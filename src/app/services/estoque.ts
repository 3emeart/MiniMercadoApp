import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EstoqueResumoResponse {
  produtoId: number;
  nomeProduto: string;
  codigo: string;
  quantidadeAtual: number;
  estoqueMinimo: number;
  abaixoDoMinimo: boolean;
}

export interface MovimentacaoEstoqueResponse {
  id: string;
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  tipo: number;
  vendaId?: string;
  observacao?: string;
  criadoEm: string;
}

export interface EntradaEstoqueRequest {
  produtoId: number;
  quantidade: number;
  observacao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstoqueService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Estoque`;

  consultarEstoqueBaixo(): Observable<EstoqueResumoResponse[]> {
    return this.http.get<EstoqueResumoResponse[]>(`${this.apiUrl}/baixo`);
  }

  consultarMovimentacoes(produtoId: number): Observable<MovimentacaoEstoqueResponse[]> {
    return this.http.get<MovimentacaoEstoqueResponse[]>(`${this.apiUrl}/movimentacoes/${produtoId}`);
  }

  registrarEntrada(request: EntradaEstoqueRequest): Observable<MovimentacaoEstoqueResponse> {
    return this.http.post<MovimentacaoEstoqueResponse>(`${this.apiUrl}/entrada`, request);
  }
}
