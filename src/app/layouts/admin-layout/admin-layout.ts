import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SignalRService } from '../../services/signalr';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout implements OnInit, OnDestroy {
  sidebarOpen = true;
  dropdownOpen = false;

  public signalr = inject(SignalRService);
  private router = inject(Router);

  constructor() {}

  ngOnInit(): void {
    this.signalr.iniciarConexao();
    
    // Fecha o dropdown ao clicar em qualquer lugar da tela
    window.addEventListener('click', this.handleWindowClick);
  }

  ngOnDestroy(): void {
    this.signalr.pararConexao();
    window.removeEventListener('click', this.handleWindowClick);
  }

  private handleWindowClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-container')) {
      this.dropdownOpen = false;
    }
  };

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  fecharDropdown(): void {
    this.dropdownOpen = false;
  }

  marcarComoLida(id: string, event: Event): void {
    event.stopPropagation();
    this.signalr.marcarComoLida(id);
  }

  excluirNotificacao(id: string, event: Event): void {
    event.stopPropagation();
    this.signalr.excluirNotificacao(id);
  }

  marcarTodasComoLidas(event: Event): void {
    event.stopPropagation();
    this.signalr.marcarTodasComoLidas();
  }

  limparTodas(event: Event): void {
    event.stopPropagation();
    this.signalr.limparTudo();
  }

  verEstoque(produtoId: number, idNotificacao?: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (idNotificacao) {
      this.signalr.marcarComoLida(idNotificacao);
    }
    this.fecharDropdown();
    this.router.navigate(['/admin/estoque']);
  }


  get currentSection(): string {
    const url = this.router.url;

    if (url.includes('/estoque')) {
      return 'Estoque';
    }

    if (url.includes('/financeiro')) {
      return 'Financeiro';
    }

    if (url.includes('/usuarios')) {
      return 'Usuarios';
    }

    if (url.includes('/categorias') || url.includes('/produtos')) {
      return 'Produtos';
    }

    return 'Dashboard';
  }

  get currentPage(): string {
    const url = this.router.url;

    if (url.includes('/categorias')) {
      return 'Categorias';
    }

    if (url.includes('/produtos/novo')) {
      return 'Cadastro';
    }

    if (url.includes('/produtos/editar')) {
      return 'Edicao';
    }

    if (url.includes('/estoque')) {
      return 'Gestao';
    }

    if (url.includes('/financeiro')) {
      return 'Detalhamento';
    }

    return 'Lista';
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
