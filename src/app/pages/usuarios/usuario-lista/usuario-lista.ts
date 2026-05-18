import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserResponse, UserCreateRequest } from '../../../services/user';

@Component({
  selector: 'app-usuario-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario-lista.html',
  styleUrl: './usuario-lista.css'
})
export class UsuarioLista implements OnInit {
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  usuarios: UserResponse[] = [];
  termoBusca = '';
  filtroPerfil: number | 'todos' = 'todos';
  filtroStatus: 'todos' | 'ativos' | 'inativos' = 'todos';
  exibindoModal = false;
  isLoading = true;
  isProcessing = false;
  errorMessage = '';

  novoUsuario: UserCreateRequest = {
    name: '',
    email: '',
    password: '',
    role: 2 // Default to Operador
  };

  ngOnInit() {
    this.carregarUsuarios();
  }

  carregarUsuarios() {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar usuarios', err);
        this.errorMessage = err.error?.message || 'Nao foi possivel carregar os usuarios.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get usuariosFiltrados(): UserResponse[] {
    const busca = this.termoBusca.trim().toLowerCase();

    return this.usuarios.filter((usuario) => {
      const correspondeBusca = !busca
        || usuario.name.toLowerCase().includes(busca)
        || usuario.email.toLowerCase().includes(busca);
      const correspondePerfil = this.filtroPerfil === 'todos' || usuario.role === this.filtroPerfil;
      const correspondeStatus = this.filtroStatus === 'todos'
        || (this.filtroStatus === 'ativos' && usuario.active)
        || (this.filtroStatus === 'inativos' && !usuario.active);

      return correspondeBusca && correspondePerfil && correspondeStatus;
    });
  }

  get totalUsuarios(): number {
    return this.usuarios.length;
  }

  get usuariosAtivos(): number {
    return this.usuarios.filter((usuario) => usuario.active).length;
  }

  get totalGerentes(): number {
    return this.usuarios.filter((usuario) => usuario.role === 0 || usuario.role === 1).length;
  }

  get totalOperadores(): number {
    return this.usuarios.filter((usuario) => usuario.role === 2).length;
  }

  abrirModal() {
    this.novoUsuario = { name: '', email: '', password: '', role: 2 };
    this.exibindoModal = true;
  }

  fecharModal() {
    this.exibindoModal = false;
  }

  salvarUsuario() {
    if (!this.novoUsuario.name || !this.novoUsuario.email || !this.novoUsuario.password) {
      alert('Preencha todos os campos!');
      return;
    }

    this.isProcessing = true;
    this.userService.create(this.novoUsuario).subscribe({
      next: () => {
        alert('Usuário criado com sucesso!');
        this.isProcessing = false;
        this.fecharModal();
        this.carregarUsuarios();
      },
      error: (err) => {
        alert(err.error?.message || 'Erro ao criar usuário.');
        this.isProcessing = false;
        this.cdr.detectChanges();
      }
    });
  }

  excluirUsuario(usuario: UserResponse) {
    if (confirm(`Tem certeza que deseja excluir o usuario "${usuario.name}"?`)) {
      this.userService.delete(usuario.id).subscribe({
        next: () => {
          this.carregarUsuarios();
        },
        error: (err) => {
          console.error('Erro ao excluir usuario', err);
          alert(err.error?.message || 'Erro ao excluir usuário.');
        }
      });
    }
  }

  getRoleName(role: number): string {
    switch(role) {
      case 0: return 'Admin';
      case 1: return 'Gerente';
      case 2: return 'Operador';
      default: return 'Desconhecido';
    }
  }
}
