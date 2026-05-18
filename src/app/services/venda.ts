import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ItemVendaResponse {
  id: string;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface VendaDetalheResponse {
  id: string;
  statusVenda: number; // 0 = Aberta, 1 = Finalizada, 2 = Cancelada
  totalFinal: number;
  abertaEm: string;
  itens: ItemVendaResponse[];
}

export interface AddItemRequest {
  produtoId: number;
  quantidade: number;
}

export interface FinalizarVendaRequest {
  formaPagamento: number; // 0=Dinheiro, 1=CartaoCredito, 2=CartaoDebito, 3=Pix
  valorPago?: number;
}

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Vendas`;

  abrir(): Observable<VendaDetalheResponse> {
    return this.http.post<VendaDetalheResponse>(this.apiUrl, {});
  }

  getById(id: string): Observable<VendaDetalheResponse> {
    return this.http.get<VendaDetalheResponse>(`${this.apiUrl}/${id}`);
  }

  addItem(id: string, request: AddItemRequest): Observable<VendaDetalheResponse> {
    return this.http.post<VendaDetalheResponse>(`${this.apiUrl}/${id}/itens`, request);
  }

  removeItem(vendaId: string, itemId: string): Observable<VendaDetalheResponse> {
    return this.http.delete<VendaDetalheResponse>(`${this.apiUrl}/${vendaId}/itens/${itemId}`);
  }

  finalizar(id: string, request: FinalizarVendaRequest): Observable<VendaDetalheResponse> {
    return this.http.put<VendaDetalheResponse>(`${this.apiUrl}/${id}/finalizar`, request);
  }
}
