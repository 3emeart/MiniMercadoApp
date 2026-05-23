import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PromocaoService, PromocaoRequest, TipoPromocao, RegraPromocaoRequest } from '../../../services/promocao';
import { ProductService, ProdutoResponse } from '../../../services/product';

@Component({
  selector: 'app-promocao-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './promocao-cadastro.html',
  styleUrl: './promocao-cadastro.css'
})
export class PromocaoCadastro implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private promocaoService = inject(PromocaoService);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  promocaoForm: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    descricao: [''],
    tipo: [0, [Validators.required]],
    dataInicio: ['', [Validators.required]],
    dataFim: ['', [Validators.required]],
    regras: this.fb.array([], Validators.required)
  });

  isSubmitted = false;
  isSaving = false;
  isEditMode = false;
  promocaoId: string | null = null;
  produtos: ProdutoResponse[] = [];

  ngOnInit() {
    this.carregarProdutos();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.promocaoId = id;
      this.carregarDadosPromocao(this.promocaoId);
    } else {
      this.addRegra(); // Add at least one rule by default
    }
  }

  get regras() {
    return this.promocaoForm.get('regras') as FormArray;
  }

  addRegra() {
    const regraForm = this.fb.group({
      produtoId: ['', Validators.required],
      quantidadeMinima: [1, [Validators.required, Validators.min(1)]],
      quantidadePaga: [null],
      valorDesconto: [null]
    });
    this.aplicarValidadoresRegra(regraForm, this.tipoSelecionado);
    this.regras.push(regraForm);
  }

  removeRegra(index: number) {
    this.regras.removeAt(index);
  }

  onTipoChange(resetValues = true) {
    const tipo = this.tipoSelecionado;

    this.regras.controls.forEach((regra) => {
      this.aplicarValidadoresRegra(regra, tipo, resetValues);
    });
  }

  private get tipoSelecionado(): TipoPromocao {
    return Number(this.promocaoForm.get('tipo')?.value) as TipoPromocao;
  }

  private aplicarValidadoresRegra(regra: AbstractControl, tipo: TipoPromocao, resetValues = false) {
    const quantidadePaga = regra.get('quantidadePaga');
    const valorDesconto = regra.get('valorDesconto');

    quantidadePaga?.clearValidators();
    valorDesconto?.clearValidators();

    if (tipo === TipoPromocao.LeveXPagueY) {
      quantidadePaga?.setValidators([Validators.required, Validators.min(1)]);
      if (resetValues) {
        valorDesconto?.setValue(null);
      }
    }

    if (tipo === TipoPromocao.DescontoPorQuantidade) {
      valorDesconto?.setValidators([Validators.required, Validators.min(0.01)]);
      if (resetValues) {
        quantidadePaga?.setValue(null);
      }
    }

    if (tipo === TipoPromocao.DescontoPercentual) {
      valorDesconto?.setValidators([Validators.required, Validators.min(0.01), Validators.max(100)]);
      if (resetValues) {
        quantidadePaga?.setValue(null);
      }
    }

    quantidadePaga?.updateValueAndValidity();
    valorDesconto?.updateValueAndValidity();
  }

  carregarProdutos() {
    this.productService.buscarTodos().subscribe({
      next: (dados) => {
        this.produtos = dados;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  carregarDadosPromocao(id: string) {
    this.isSaving = true;
    this.promocaoService.buscarPorId(id).subscribe({
      next: (p) => {
        // Format dates for datetime-local input
        const formatData = (isoDate: string) => {
          if (!isoDate) return '';
          return new Date(isoDate).toISOString().slice(0, 16);
        };

        this.promocaoForm.patchValue({
          nome: p.nome,
          descricao: p.descricao,
          tipo: p.tipo,
          dataInicio: formatData(p.dataInicio),
          dataFim: formatData(p.dataFim)
        });

        p.regras.forEach(r => {
          const regraForm = this.fb.group({
            produtoId: [r.produtoId, Validators.required],
            quantidadeMinima: [r.quantidadeMinima, [Validators.required, Validators.min(1)]],
            quantidadePaga: [r.quantidadePaga],
            valorDesconto: [r.valorDesconto]
          });
          this.aplicarValidadoresRegra(regraForm, this.tipoSelecionado);
          this.regras.push(regraForm);
        });

        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao carregar dados.');
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    
    if (this.promocaoForm.valid) {
      this.isSaving = true;
      this.cdr.detectChanges();
      
      const formValue = this.promocaoForm.value;
      const tipo = Number(formValue.tipo) as TipoPromocao;
      
      const payload: PromocaoRequest = {
        nome: formValue.nome,
        descricao: formValue.descricao,
        tipo,
        dataInicio: new Date(formValue.dataInicio).toISOString(),
        dataFim: new Date(formValue.dataFim).toISOString(),
        regras: formValue.regras.map((r: any) => this.criarRegraPayload(r, tipo))
      };

      const request = this.isEditMode && this.promocaoId 
        ? this.promocaoService.update(this.promocaoId, payload)
        : this.promocaoService.create(payload);

      request.subscribe({
        next: (res) => {
          this.isSaving = false;
          alert(this.isEditMode ? 'Promoção atualizada com sucesso!' : 'Promoção cadastrada com sucesso!');
          this.router.navigate(['/admin/promocoes']);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
          alert('Erro ao salvar promoção.');
          console.error(err);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.promocaoForm.markAllAsTouched();
      this.cdr.detectChanges();
    }
  }

  private criarRegraPayload(regra: any, tipo: TipoPromocao): RegraPromocaoRequest {
    const payload: RegraPromocaoRequest = {
      produtoId: Number(regra.produtoId),
      quantidadeMinima: Number(regra.quantidadeMinima)
    };

    if (tipo === TipoPromocao.LeveXPagueY) {
      payload.quantidadePaga = Number(regra.quantidadePaga);
    }

    if (
      tipo === TipoPromocao.DescontoPorQuantidade ||
      tipo === TipoPromocao.DescontoPercentual
    ) {
      payload.valorDesconto = Number(regra.valorDesconto);
    }

    return payload;
  }

  cancelar() {
    this.router.navigate(['/admin/promocoes']);
  }
}
