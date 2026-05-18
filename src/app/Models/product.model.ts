import {Data} from '@angular/router';

export interface ProductModel {
  id: number;
  name: string;
  codigo: string;
  dataCadastro: string;
  quantidade: number;
  precoVenda: number;
  precoCompra: number;
  ativo: boolean;
  estoqueMinimo: number;
  categoriaId: number;

}
