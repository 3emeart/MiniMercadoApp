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
  minDataInicio = this.formatarDataHoraLocal(new Date());

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
        this.promocaoForm.patchValue({
          nome: p.nome,
          descricao: p.descricao,
          tipo: p.tipo,
          dataInicio: this.formatarDataHoraLocal(p.dataInicio),
          dataFim: this.formatarDataHoraLocal(p.dataFim)
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
    this.validarPeriodoPromocao();
    
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

      console.log('Payload promoção:', payload);

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
          const detalheErro = this.obterMensagemErro(err);
          alert(`Erro ao salvar promoção: ${detalheErro}`);
          console.error('Erro ao salvar promoção:', err.error || err);
          console.error('Validações da API:', JSON.stringify(err.error?.errors || err.error || err, null, 2));
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

  private validarPeriodoPromocao() {
    const dataInicioControl = this.promocaoForm.get('dataInicio');
    const dataFimControl = this.promocaoForm.get('dataFim');
    const dataInicio = dataInicioControl?.value ? new Date(dataInicioControl.value) : null;
    const dataFim = dataFimControl?.value ? new Date(dataFimControl.value) : null;

    this.removerErroControle(dataInicioControl, 'dataPassada');
    this.removerErroControle(dataFimControl, 'dataFimMenor');

    if (!this.isEditMode && dataInicio && dataInicio < new Date()) {
      dataInicioControl?.setErrors({ ...(dataInicioControl.errors || {}), dataPassada: true });
    }

    if (dataInicio && dataFim && dataFim <= dataInicio) {
      dataFimControl?.setErrors({ ...(dataFimControl.errors || {}), dataFimMenor: true });
    }
  }

  private removerErroControle(control: AbstractControl | null | undefined, erro: string) {
    if (!control?.errors?.[erro]) {
      return;
    }

    const errors = { ...control.errors };
    delete errors[erro];
    control.setErrors(Object.keys(errors).length ? errors : null);
  }

  private formatarDataHoraLocal(value: string | Date): string {
    if (!value) {
      return '';
    }

    const data = new Date(value);
    const pad = (numero: number) => numero.toString().padStart(2, '0');

    return [
      data.getFullYear(),
      pad(data.getMonth() + 1),
      pad(data.getDate())
    ].join('-') + `T${pad(data.getHours())}:${pad(data.getMinutes())}`;
  }

  private obterMensagemErro(err: any): string {
    const erro = err?.error;

    if (!erro) {
      return 'verifique o console para mais detalhes.';
    }

    if (typeof erro === 'string') {
      return erro;
    }

    if (erro.errors) {
      return Object.entries(erro.errors)
        .map(([campo, mensagens]) => {
          const listaMensagens = Array.isArray(mensagens) ? mensagens : [mensagens];
          return `${campo}: ${listaMensagens.join(', ')}`;
        })
        .join(' | ');
    }

    if (erro.message) {
      return erro.message;
    }

    if (erro.title) {
      return erro.title;
    }

    return JSON.stringify(erro);
  }

  cancelar() {
    this.router.navigate(['/admin/promocoes']);
  }
}
