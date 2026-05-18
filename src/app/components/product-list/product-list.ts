import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, ProdutoResponse } from '../../services/product';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  products = signal<ProdutoResponse[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.carregarProdutos();
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


