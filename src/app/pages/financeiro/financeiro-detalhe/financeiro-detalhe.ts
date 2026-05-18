import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceiroResumoResponse, FinanceiroService, FinanceiroVendaResponse } from '../../../services/financeiro';

@Component({
  selector: 'app-financeiro-detalhe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financeiro-detalhe.html',
  styleUrl: './financeiro-detalhe.css'
})
export class FinanceiroDetalhe implements OnInit {
  private financeiroService = inject(FinanceiroService);
  private cdr = inject(ChangeDetectorRef);

  resumo: FinanceiroResumoResponse | null = null;
  inicio = '';
  fim = '';
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.definirPeriodoPadrao();
    this.carregarResumo();
  }

  get maxSerie(): number {
    return Math.max(...(this.resumo?.serieDiaria.map((item) => item.total) ?? [0]), 1);
  }

  get totalMovimento(): number {
    if (!this.resumo) {
      return 0;
    }

    return this.resumo.faturamentoBruto + this.resumo.faturamentoCancelado;
  }

  get taxaCancelamento(): number {
    if (!this.resumo) {
      return 0;
    }

    const totalVendas = this.resumo.vendasFinalizadas + this.resumo.vendasCanceladas;
    return totalVendas === 0 ? 0 : (this.resumo.vendasCanceladas / totalVendas) * 100;
  }

  carregarResumo(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.financeiroService.obterResumo(this.inicio, this.fim).subscribe({
      next: (dados) => {
        this.resumo = dados;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar financeiro', err);
        this.errorMessage = err.error?.message || 'Não foi possível carregar o detalhamento financeiro.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarPeriodoRapido(dias: number): void {
    const hoje = new Date();
    const inicio = new Date();
    inicio.setDate(hoje.getDate() - (dias - 1));

    this.inicio = this.toInputDate(inicio);
    this.fim = this.toInputDate(hoje);
    this.carregarResumo();
  }

  percentualPagamento(total: number): number {
    if (!this.resumo?.faturamentoBruto) {
      return 0;
    }

    return (total / this.resumo.faturamentoBruto) * 100;
  }

  alturaBarra(total: number): number {
    return Math.max((total / this.maxSerie) * 100, total > 0 ? 8 : 0);
  }

  statusLabel(status: number): string {
    if (status === 1) {
      return 'Finalizada';
    }

    if (status === 2) {
      return 'Cancelada';
    }

    return 'Aberta';
  }

  statusClass(status: number): string {
    if (status === 1) {
      return 'badge-success';
    }

    if (status === 2) {
      return 'badge-error';
    }

    return 'badge-warning';
  }

  formaPagamentoLabel(forma: number): string {
    if (forma === 1) {
      return 'Cartão';
    }

    if (forma === 2) {
      return 'Pix';
    }

    return 'Dinheiro';
  }

  dataReferencia(venda: FinanceiroVendaResponse): string {
    return venda.finalizadaEm || venda.canceladaEm || venda.abertaEm;
  }

  private definirPeriodoPadrao(): void {
    const hoje = new Date();
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(hoje.getDate() - 6);

    this.inicio = this.toInputDate(seteDiasAtras);
    this.fim = this.toInputDate(hoje);
  }

  private toInputDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
