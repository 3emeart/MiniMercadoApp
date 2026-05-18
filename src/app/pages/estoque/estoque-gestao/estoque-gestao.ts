import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EstoqueResumoResponse, EstoqueService, MovimentacaoEstoqueResponse } from '../../../services/estoque';
import { ProductService, ProdutoResponse } from '../../../services/product';

type StatusEstoque = 'ok' | 'baixo' | 'zerado';

interface EstoqueLinha {
  produtoId: number;
  produtoNome: string;
  codigo: string;
  quantidadeAtual: number;
  estoqueMinimo: number;
  precoVenda?: number;
  status: StatusEstoque;
}

@Component({
  selector: 'app-estoque-gestao',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './estoque-gestao.html',
  styleUrl: './estoque-gestao.css'
})
export class EstoqueGestao implements OnInit {
  private fb = inject(FormBuilder);
  private estoqueService = inject(EstoqueService);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  estoque: EstoqueLinha[] = [];
  produtos: ProdutoResponse[] = [];
  estoqueBaixo: EstoqueResumoResponse[] = [];
  movimentacoes: MovimentacaoEstoqueResponse[] = [];
  produtoHistoricoId: number | null = null;
  termoBusca = '';
  filtroStatus: StatusEstoque | 'todos' = 'todos';
  isLoading = true;
  isLoadingProdutos = true;
  isLoadingMovimentacoes = false;
  isSaving = false;
  isSubmitted = false;

  movimentacaoForm = this.fb.group({
    produtoId: ['', [Validators.required]],
    quantidade: [1, [Validators.required, Validators.min(1)]],
    observacao: ['']
  });

  ngOnInit(): void {
    this.carregarDados();
  }

  get estoqueFiltrado(): EstoqueLinha[] {
    const busca = this.termoBusca.trim().toLowerCase();

    return this.estoque.filter((item) => {
      const correspondeBusca = !busca
        || item.produtoNome.toLowerCase().includes(busca)
        || item.codigo.toLowerCase().includes(busca);
      const correspondeStatus = this.filtroStatus === 'todos' || item.status === this.filtroStatus;

      return correspondeBusca && correspondeStatus;
    });
  }

  get totalItens(): number {
    return this.estoque.length;
  }

  get totalUnidades(): number {
    return this.estoque.reduce((total, item) => total + item.quantidadeAtual, 0);
  }

  get itensBaixos(): number {
    return this.estoque.filter((item) => item.status === 'baixo').length;
  }

  get itensZerados(): number {
    return this.estoque.filter((item) => item.status === 'zerado').length;
  }

  carregarDados(): void {
    this.carregarEstoqueBaixo();
    this.carregarProdutos();
  }

  carregarEstoqueBaixo(): void {
    this.estoqueService.consultarEstoqueBaixo().subscribe({
      next: (dados) => {
        this.estoqueBaixo = dados;
        this.montarLinhasEstoque();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar estoque baixo', err);
        this.estoqueBaixo = [];
        this.montarLinhasEstoque();
        this.cdr.detectChanges();
      }
    });
  }

  carregarProdutos(): void {
    this.isLoadingProdutos = true;
    this.isLoading = true;

    this.productService.buscarTodos().subscribe({
      next: (dados) => {
        this.produtos = dados;
        this.isLoadingProdutos = false;
        this.montarLinhasEstoque();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar produtos', err);
        this.isLoadingProdutos = false;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  atualizarBusca(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.termoBusca = input.value;
  }

  selecionarStatus(status: StatusEstoque | 'todos'): void {
    this.filtroStatus = status;
  }

  registrarMovimentacao(): void {
    this.isSubmitted = true;

    if (this.movimentacaoForm.invalid) {
      return;
    }

    const formValue = this.movimentacaoForm.getRawValue();
    this.isSaving = true;
    this.cdr.detectChanges();

    this.estoqueService.registrarEntrada({
      produtoId: Number(formValue.produtoId),
      quantidade: Number(formValue.quantidade),
      observacao: formValue.observacao?.trim() || undefined
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.isSubmitted = false;
        this.movimentacaoForm.reset({
          produtoId: '',
          quantidade: 1,
          observacao: ''
        });
        this.carregarDados();
        if (this.produtoHistoricoId) {
          this.carregarMovimentacoes(this.produtoHistoricoId);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao registrar movimentacao de estoque', err);
        alert('Erro ao registrar movimentacao de estoque.');
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  carregarMovimentacoes(produtoId: number): void {
    this.produtoHistoricoId = produtoId;
    this.isLoadingMovimentacoes = true;

    this.estoqueService.consultarMovimentacoes(produtoId).subscribe({
      next: (dados) => {
        this.movimentacoes = dados;
        this.isLoadingMovimentacoes = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar movimentacoes de estoque', err);
        this.movimentacoes = [];
        this.isLoadingMovimentacoes = false;
        this.cdr.detectChanges();
      }
    });
  }

  tipoMovimentacaoLabel(tipo: number): string {
    if (tipo === 1) {
      return 'Saida por venda';
    }

    if (tipo === 2) {
      return 'Devolucao';
    }

    return 'Entrada manual';
  }

  quantidadeMovimentacaoLabel(movimentacao: MovimentacaoEstoqueResponse): string {
    const prefixo = movimentacao.tipo === 1 ? '-' : '+';
    return `${prefixo}${movimentacao.quantidade}`;
  }

  statusLabel(status: StatusEstoque): string {
    if (status === 'zerado') {
      return 'Zerado';
    }

    if (status === 'baixo') {
      return 'Baixo';
    }

    return 'Ok';
  }

  private montarLinhasEstoque(): void {
    const itensBaixosPorProduto = new Map(this.estoqueBaixo.map((item) => [item.produtoId, item]));

    this.estoque = this.produtos.map((produto) => {
      const itemBaixo = itensBaixosPorProduto.get(produto.id);
      const estoqueMinimo = itemBaixo?.estoqueMinimo ?? 5;
      const quantidadeAtual = produto.quantidadeAtual ?? 0;

      return {
        produtoId: produto.id,
        produtoNome: produto.nome,
        codigo: produto.codigo,
        quantidadeAtual,
        estoqueMinimo,
        precoVenda: produto.precoVenda,
        status: this.calcularStatus(quantidadeAtual, estoqueMinimo, Boolean(itemBaixo?.abaixoDoMinimo))
      };
    });

    this.isLoading = false;
  }

  private calcularStatus(quantidadeAtual: number, estoqueMinimo: number, abaixoDoMinimo = false): StatusEstoque {
    if (quantidadeAtual <= 0) {
      return 'zerado';
    }

    if (abaixoDoMinimo || quantidadeAtual <= estoqueMinimo) {
      return 'baixo';
    }

    return 'ok';
  }
}
