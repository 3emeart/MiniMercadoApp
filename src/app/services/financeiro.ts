import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FinanceiroFormaPagamentoResponse {
  formaPagamento: number;
  nome: string;
  total: number;
  quantidade: number;
}

export interface FinanceiroSerieDiaResponse {
  data: string;
  total: number;
  vendas: number;
}

export interface FinanceiroVendaResponse {
  id: string;
  status: number;
  formaPagamento: number;
  totalFinal: number;
  abertaEm: string;
  finalizadaEm?: string;
  canceladaEm?: string;
  itens: number;
}

export interface FinanceiroResumoResponse {
  inicio: string;
  fim: string;
  faturamentoBruto: number;
  faturamentoCancelado: number;
  ticketMedio: number;
  vendasFinalizadas: number;
  vendasCanceladas: number;
  vendasAbertas: number;
  itensVendidos: number;
  formasPagamento: FinanceiroFormaPagamentoResponse[];
  serieDiaria: FinanceiroSerieDiaResponse[];
  ultimasVendas: FinanceiroVendaResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class FinanceiroService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Financeiro`;

  obterResumo(inicio: string, fim: string): Observable<FinanceiroResumoResponse> {
    const params = new HttpParams()
      .set('inicio', inicio)
      .set('fim', fim);

    return this.http.get<FinanceiroResumoResponse>(`${this.apiUrl}/resumo`, { params });
  }
}
