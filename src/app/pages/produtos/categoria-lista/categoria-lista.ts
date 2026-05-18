import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService, CategoriaResponse } from '../../../services/categoria';

@Component({
  selector: 'app-categoria-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categoria-lista.html',
  styleUrl: './categoria-lista.css'
})
export class CategoriaLista implements OnInit {
  private categoriaService = inject(CategoriaService);
  private cdr = inject(ChangeDetectorRef);
  
  categorias: CategoriaResponse[] = [];
  loading = false;
  showModal = false;
  editingCategoria: Partial<CategoriaResponse> | null = null;
  
  categoriaForm: Partial<CategoriaResponse> = {
    nome: '',
    descricao: ''
  };

  ngOnInit() {
    this.carregarCategorias();
  }

  carregarCategorias() {
    this.loading = true;
    this.cdr.detectChanges();
    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar categorias', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModal(categoria?: CategoriaResponse) {
    if (categoria) {
      this.editingCategoria = categoria;
      this.categoriaForm = { ...categoria };
    } else {
      this.editingCategoria = null;
      this.categoriaForm = { nome: '', descricao: '' };
    }
    this.showModal = true;
    this.cdr.detectChanges();
  }

  fecharModal() {
    this.showModal = false;
    this.editingCategoria = null;
    this.cdr.detectChanges();
  }

  salvarCategoria() {
    if (!this.categoriaForm.nome) return;

    this.loading = true;
    this.cdr.detectChanges();

    if (this.editingCategoria?.id) {
      this.categoriaService.updateCategoria(this.editingCategoria.id, this.categoriaForm).subscribe({
        next: () => {
          this.fecharModal();
          this.carregarCategorias();
        },
        error: (err) => {
          console.error('Erro ao atualizar categoria', err);
          alert('Erro ao atualizar categoria.');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.categoriaService.createCategoria(this.categoriaForm).subscribe({
        next: () => {
          this.fecharModal();
          this.carregarCategorias();
        },
        error: (err) => {
          console.error('Erro ao criar categoria', err);
          alert('Erro ao criar categoria.');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  excluirCategoria(id: number) {
    if (confirm('Tem certeza que deseja excluir esta categoria? Isso pode afetar produtos vinculados.')) {
      this.loading = true;
      this.cdr.detectChanges();
      this.categoriaService.deleteCategoria(id).subscribe({
        next: () => {
          this.carregarCategorias();
        },
        error: (err) => {
          console.error('Erro ao excluir categoria', err);
          alert('Não foi possível excluir a categoria. Verifique se existem produtos vinculados a ela.');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
