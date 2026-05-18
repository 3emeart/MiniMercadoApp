import { Component, inject, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendaService, VendaDetalheResponse } from '../../../services/venda';
import { ProductService, ProdutoResponse } from '../../../services/product';
import { AuthService, UserDataResponse } from '../../../services/auth';

@Component({
  selector: 'app-pdv',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pdv.html',
  styleUrl: './pdv.css'
})
export class PdvComponent implements OnInit {
  private vendaService = inject(VendaService);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private router = inject(Router);

  operador: UserDataResponse | null = null;
  
  // Controle de Cancelamento
  exibindoAutorizacao = false;
  itemIdParaCancelar: string | null = null;
  senhaSupervisor = '';

  vendaAtual: VendaDetalheResponse | null = null;
  produtos: ProdutoResponse[] = [];
  produtosFiltrados: ProdutoResponse[] = [];
  
  searchTerm = '';
  isProcessing = false;
  isFinalizing = false;
  isLoadingProdutos = true;
  exibindoPagamento = false;
  formaPagamentoSelecionada = 0;
  valorRecebido: number | null = null;
  
  pixData: { qrCodeBase64: string, copyAndPaste: string } | null = null;
  exibindoPix = false;

  ngOnInit(): void {
    this.operador = this.authService.getUserData();
    
    if (!this.operador) {
      this.router.navigate(['/pdv/login']);
      return;
    }

    this.carregarProdutos();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (event.key === 'F1') {
      event.preventDefault();
      if (!this.vendaAtual && !this.isProcessing) {
        this.iniciarVenda();
      }
    }

    if (event.key === 'F12') {
      event.preventDefault();
      if (this.podeFinalizar) {
        this.abrirPagamento();
      }
    }

    if (event.key === 'Escape') {
      if (this.exibindoPagamento) {
        this.fecharPagamento();
      }

      if (this.exibindoAutorizacao) {
        this.cancelarAutorizacao();
      }
    }
  }

  get quantidadeItens(): number {
    return this.vendaAtual?.itens?.reduce((total, item) => total + item.quantidade, 0) ?? 0;
  }

  get totalItensDistintos(): number {
    return this.vendaAtual?.itens?.length ?? 0;
  }

  get podeFinalizar(): boolean {
    return Boolean(this.vendaAtual?.itens?.length) && !this.isFinalizing && !this.isProcessing;
  }

  get subtotalVenda(): number {
    return this.vendaAtual?.totalFinal ?? 0;
  }

  get troco(): number {
    if (this.formaPagamentoSelecionada !== 0 || this.valorRecebido === null) {
      return 0;
    }

    return Math.max(this.valorRecebido - this.subtotalVenda, 0);
  }

  get produtosDisponiveis(): number {
    return this.produtos.filter((produto) => produto.quantidadeAtual > 0).length;
  }

  sair() {
    this.authService.logout();
    this.router.navigate(['/pdv/login']);
  }

  carregarProdutos() {
    this.isLoadingProdutos = true;
    this.productService.buscarTodos().subscribe({
      next: (data) => {
        this.produtos = data;
        this.produtosFiltrados = data;
        this.isLoadingProdutos = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao buscar produtos', err);
        this.isLoadingProdutos = false;
        this.cdr.detectChanges();
      }
    });
  }

  iniciarVenda() {
    this.isProcessing = true;
    this.vendaService.abrir().subscribe({
      next: (venda) => {
        this.vendaAtual = venda;
        this.searchTerm = '';
        this.filtrarProdutos();
        this.isProcessing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao abrir nova venda.');
        this.isProcessing = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrarProdutos() {
    if (!this.searchTerm) {
      this.produtosFiltrados = this.produtos;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.produtosFiltrados = this.produtos.filter(p => 
        p.nome.toLowerCase().includes(term) || p.codigo.toLowerCase().includes(term)
      );
    }
    this.cdr.detectChanges();
  }

  adicionarPrimeiroResultado() {
    const produto = this.produtosFiltrados.find((item) => item.quantidadeAtual > 0);
    if (produto) {
      this.adicionarProduto(produto.id);
    }
  }

  adicionarProduto(produtoId: number) {
    if (!this.vendaAtual) return;
    
    this.isProcessing = true;
    this.cdr.detectChanges();

    this.vendaService.addItem(this.vendaAtual.id, { produtoId, quantidade: 1 }).subscribe({
      next: (venda) => {
        this.vendaAtual = venda;
        this.searchTerm = '';
        this.filtrarProdutos();
        this.isProcessing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Erro ao adicionar item.');
        this.isProcessing = false;
        this.cdr.detectChanges();
      }
    });
  }

  removerItem(itemId: string) {
    this.itemIdParaCancelar = itemId;
    this.exibindoAutorizacao = true;
    this.senhaSupervisor = '';
    this.cdr.detectChanges();
  }

  confirmarCancelamento() {
    // Simulação: Em um cenário real, isso chamaria o backend para validar a senha do gerente
    if (this.senhaSupervisor === '1234') { 
      if (this.itemIdParaCancelar && this.vendaAtual) {
        this.isProcessing = true;
        this.vendaService.removeItem(this.vendaAtual.id, this.itemIdParaCancelar).subscribe({
          next: (venda) => {
            this.vendaAtual = venda;
            this.isProcessing = false;
            this.exibindoAutorizacao = false;
            this.itemIdParaCancelar = null;
            this.carregarProdutos(); // Recarregar estoque
          },
          error: (err) => {
            console.error(err);
            alert('Erro ao remover item.');
            this.isProcessing = false;
            this.cdr.detectChanges();
          }
        });
      }
    } else {
      alert('Senha do Gerente Inválida!');
      this.senhaSupervisor = '';
    }
  }

  cancelarAutorizacao() {
    this.exibindoAutorizacao = false;
    this.itemIdParaCancelar = null;
    this.senhaSupervisor = '';
    this.cdr.detectChanges();
  }

  abrirPagamento() {
    if (!this.vendaAtual || !this.vendaAtual.itens || this.vendaAtual.itens.length === 0) return;
    this.formaPagamentoSelecionada = 0;
    this.valorRecebido = this.vendaAtual.totalFinal;
    this.exibindoPagamento = true;
    this.cdr.detectChanges();
  }

  fecharPagamento() {
    this.exibindoPagamento = false;
    this.valorRecebido = null;
    this.cdr.detectChanges();
  }

  selecionarPagamento(formaPagamento: number) {
    this.formaPagamentoSelecionada = formaPagamento;
    if (formaPagamento !== 0) {
      this.valorRecebido = this.subtotalVenda;
    }
  }

  finalizarVenda() {
    if (!this.vendaAtual || !this.vendaAtual.itens || this.vendaAtual.itens.length === 0) return;

    if (this.formaPagamentoSelecionada === 0 && (this.valorRecebido ?? 0) < this.vendaAtual.totalFinal) {
      alert('Valor recebido menor que o total da venda.');
      return;
    }

    this.isFinalizing = true;
    this.cdr.detectChanges();
    
    this.vendaService.finalizar(this.vendaAtual.id, {
      formaPagamento: this.formaPagamentoSelecionada,
      valorPago: this.formaPagamentoSelecionada === 0 ? Number(this.valorRecebido) : undefined
    }).subscribe({
      next: () => {
        alert('Venda finalizada com sucesso!');
        this.vendaAtual = null;
        this.exibindoPagamento = false;
        this.isFinalizing = false;
        this.valorRecebido = null;
        this.carregarProdutos();
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Erro ao finalizar venda.');
        this.isFinalizing = false;
        this.cdr.detectChanges();
      }
    });
  }
}

