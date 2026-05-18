import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService, ProdutoRequest } from '../../../services/product';
import { CategoriaService, CategoriaResponse } from '../../../services/categoria';

@Component({
  selector: 'app-produto-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './produto-cadastro.html',
  styleUrl: './produto-cadastro.css'
})
export class ProdutoCadastro implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private categoriaService = inject(CategoriaService);
  private cdr = inject(ChangeDetectorRef);

  produtoForm: FormGroup = this.fb.group({
    codigo: ['', [Validators.required]],
    nome: ['', [Validators.required, Validators.minLength(3)]],
    descricao: [''],
    categoria: ['', [Validators.required]],
    precoCusto: ['', [Validators.required, Validators.min(0)]],
    precoVenda: ['', [Validators.required, Validators.min(0)]],
    estoqueAtual: [0, [Validators.required, Validators.min(0)]]
  });

  isSubmitted = false;
  isSaving = false;
  isEditMode = false;
  productId: number | null = null;

  categorias: CategoriaResponse[] = [];
  isLoadingCategorias = true;

  ngOnInit() {
    this.carregarCategorias();
    
    // Verificar se é edição
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = Number(id);
      this.carregarDadosProduto(this.productId);
    }
  }

  carregarDadosProduto(id: number) {
    this.isSaving = true;
    this.productService.buscarPorId(id).subscribe({
      next: (p) => {
        this.produtoForm.patchValue({
          codigo: p.codigo,
          nome: p.nome,
          categoria: p.categoriaId,
          precoCusto: p.precoCompra,
          precoVenda: p.precoVenda,
          estoqueAtual: p.quantidadeAtual
        });
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar produto', err);
        alert('Erro ao carregar dados do produto.');
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  carregarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (dados) => {
        this.categorias = dados;
        this.isLoadingCategorias = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar categorias', err);
        this.isLoadingCategorias = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    
    if (this.produtoForm.valid) {
      this.isSaving = true;
      this.cdr.detectChanges();
      
      const formValue = this.produtoForm.value;
      
      const payload: ProdutoRequest = {
        nome: formValue.nome,
        codigo: formValue.codigo,
        quantidadeInicial: Number(formValue.estoqueAtual),
        precoCompra: Number(formValue.precoCusto),
        precoVenda: Number(formValue.precoVenda),
        medidaVenda: 0, // Unidade
        categoriaId: Number(formValue.categoria)
      };

      const request = this.isEditMode && this.productId 
        ? this.productService.update(this.productId, payload)
        : this.productService.create(payload);

      request.subscribe({
        next: (res) => {
          this.isSaving = false;
          alert(this.isEditMode ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
          this.router.navigate(['/admin/produtos']);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
          alert('Erro ao salvar produto. Verifique o console.');
          console.error(err);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  cancelar() {
    this.router.navigate(['/admin/produtos']);
  }
}



