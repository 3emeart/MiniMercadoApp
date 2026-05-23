import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PromocaoService, PromocaoResponse, TipoPromocao } from '../../../services/promocao';

@Component({
  selector: 'app-promocao-lista',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './promocao-lista.html',
  styleUrl: './promocao-lista.css',
})
export class PromocaoLista implements OnInit {
  private promocaoService = inject(PromocaoService);
  private cdr = inject(ChangeDetectorRef);

  promocoes = signal<PromocaoResponse[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.carregarPromocoes();
  }

  carregarPromocoes() {
    this.isLoading.set(true);
    this.cdr.detectChanges();
    
    this.promocaoService.buscarAtivas().subscribe({
      next: (data) => {
        this.promocoes.set(data);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar promoções', err);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  toggleStatus(id: string) {
    this.promocaoService.toggleStatus(id).subscribe({
      next: (promocao) => {
        const index = this.promocoes().findIndex(p => p.id === id);
        if (index !== -1) {
          const newPromocoes = [...this.promocoes()];
          newPromocoes[index] = promocao;
          this.promocoes.set(newPromocoes);
        }
      },
      error: (err) => {
        console.error('Erro ao alterar status', err);
        alert('Erro ao alterar status da promoção.');
      }
    });
  }

  getTipoNome(tipo: TipoPromocao): string {
    switch (tipo) {
      case TipoPromocao.LeveXPagueY: return 'Leve X Pague Y';
      case TipoPromocao.DescontoPorQuantidade: return 'Desconto p/ Quantidade';
      case TipoPromocao.DescontoPercentual: return 'Desconto Percentual';
      default: return 'Desconhecido';
    }
  }
}
