import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-pdv-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pdv-login.html',
  styleUrl: './pdv-login.css'
})
export class PdvLogin {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  isProcessing = false;
  errorMsg = '';

  login() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Informe e-mail e senha.';
      return;
    }

    this.isProcessing = true;
    this.errorMsg = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        // No PDV, qualquer um pode entrar, mas o foco é o Operador
        this.router.navigate(['/pdv']);
      },
      error: (err) => {
        this.errorMsg = 'Credenciais inválidas ou sem acesso ao caixa.';
        this.isProcessing = false;
        this.cdr.detectChanges();
      }
    });
  }
}
