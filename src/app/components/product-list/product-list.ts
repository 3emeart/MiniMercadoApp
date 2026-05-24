import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, ProdutoResponse } from '../../services/product';
import { PromocaoResponse, PromocaoService, TipoPromocao } from '../../services/promocao';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  private productService = inject(ProductService);
  private promocaoService = inject(PromocaoService);
  private cdr = inject(ChangeDetectorRef);

  products = signal<ProdutoResponse[]>([]);
  isLoading = signal<boolean>(true);
  promocoesAtivas: PromocaoResponse[] = [];

  ngOnInit(): void {
    this.carregarProdutos();
    this.carregarPromocoesAtivas();
  }

  carregarProdutos() {
    this.isLoading.set(true);
    this.cdr.detectChanges();
    
    this.productService.buscarTodos().subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar produtos', err);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  carregarPromocoesAtivas() {
    this.promocaoService.buscarAtivas().subscribe({
      next: (data) => {
        this.promocoesAtivas = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar promoções ativas', err);
      }
    });
  }

  produtoTemPromocao(produtoId: number): boolean {
    return this.promocoesAtivas.some((promocao) =>
      promocao.ativo && promocao.regras?.some((regra) => regra.produtoId === produtoId)
    );
  }

  resumoPromocaoProduto(produtoId: number): string {
    const promocao = this.promocoesAtivas.find((item) =>
      item.ativo && item.regras?.some((regra) => regra.produtoId === produtoId)
    );

    if (!promocao) {
      return '';
    }

    const regra = promocao.regras.find((item) => item.produtoId === produtoId);

    if (promocao.tipo === TipoPromocao.LeveXPagueY) {
      return `Leve ${regra?.quantidadeMinima ?? ''} pague ${regra?.quantidadePaga ?? ''}`;
    }

    if (promocao.tipo === TipoPromocao.DescontoPorQuantidade) {
      return `${this.formatarMoeda(regra?.valorDesconto ?? 0)} off a partir de ${regra?.quantidadeMinima ?? 1}`;
    }

    if (promocao.tipo === TipoPromocao.DescontoPercentual) {
      return `${regra?.valorDesconto ?? 0}% off`;
    }

    return promocao.nome;
  }

  private formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  excluirProduto(id: number, nome: string) {
    if (confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) {
      this.isLoading.set(true);
      this.cdr.detectChanges();
      
      this.productService.delete(id).subscribe({
        next: () => {
          this.carregarProdutos();
        },
        error: (err) => {
          console.error('Erro detalhado:', err);
          alert('Não foi possível excluir o produto. Verifique se ele possui movimentações vinculadas.');
          this.isLoading.set(false);
          this.cdr.detectChanges();
        }
      });
    }
  }
}

