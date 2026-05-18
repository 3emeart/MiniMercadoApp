import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {
  sidebarOpen = true;

  constructor(private router: Router) {}

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
