import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export enum TipoPromocao {
  LeveXPagueY = 0,
  DescontoPorQuantidade = 1,
  DescontoPercentual = 2
}

export interface RegraPromocaoRequest {
  produtoId: number;
  quantidadeMinima: number;
  valorDesconto?: number;
  quantidadePaga?: number;
}

export interface RegraPromocaoResponse {
  id: string;
  promocaoId: string;
  produtoId: number;
  quantidadeMinima: number;
  valorDesconto?: number;
  quantidadePaga?: number;
  produto?: any; // Assuming it comes populated
}

export interface PromocaoRequest {
  nome: string;
  descricao: string;
  tipo: TipoPromocao;
  dataInicio: string;
  dataFim: string;
  regras: RegraPromocaoRequest[];
}

export interface PromocaoResponse {
  id: string;
  nome: string;
  descricao: string;
  tipo: TipoPromocao;
  dataInicio: string;
  dataFim: string;
  ativo: boolean;
  regras: RegraPromocaoResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class PromocaoService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Promocao`;

  buscarTodos(): Observable<PromocaoResponse[]> {
    return this.http.get<PromocaoResponse[]>(this.apiUrl);
  }

  buscarAtivas(): Observable<PromocaoResponse[]> {
    return this.http.get<PromocaoResponse[]>(`${this.apiUrl}/ativas`);
  }

  buscarPorId(id: string): Observable<PromocaoResponse> {
    return this.http.get<PromocaoResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: PromocaoRequest): Observable<PromocaoResponse> {
    return this.http.post<PromocaoResponse>(this.apiUrl, request);
  }

  update(id: string, request: PromocaoRequest): Observable<PromocaoResponse> {
    return this.http.put<PromocaoResponse>(`${this.apiUrl}/${id}`, request);
  }

  toggleStatus(id: string): Observable<PromocaoResponse> {
    return this.http.put<PromocaoResponse>(`${this.apiUrl}/${id}/status`, {});
  }
}
