import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProdutoRequest {
  nome: string;
  codigo: string;
  quantidadeInicial: number;
  precoCompra: number;
  precoVenda: number;
  medidaVenda: number; // 0 = Unidade, 1 = Kg, etc.
  categoriaId: number;
}

export interface ProdutoResponse {
  id: number;
  nome: string;
  codigo: string;
  quantidadeAtual: number;
  precoCompra: number;
  precoVenda: number;
  categoriaId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Produto`;

  buscarTodos(): Observable<ProdutoResponse[]> {
    return this.http.get<ProdutoResponse[]>(this.apiUrl);
  }

  create(request: ProdutoRequest): Observable<ProdutoResponse> {
    return this.http.post<ProdutoResponse>(this.apiUrl, request);
  }

  update(id: number, request: ProdutoRequest): Observable<ProdutoResponse> {
    return this.http.put<ProdutoResponse>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  buscarPorId(id: number): Observable<ProdutoResponse> {
    return this.http.get<ProdutoResponse>(`${this.apiUrl}/${id}`);
  }
}
