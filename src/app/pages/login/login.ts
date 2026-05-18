import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isSubmitted = false;
  isLoading = false;
  errorMessage = '';

  onSubmit() {
    this.isSubmitted = true;
    this.errorMessage = '';
    
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.cdr.detectChanges();
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          const role = response.userData.role;
          // Bloqueia se for Operador (compara como string para evitar erro de tipo do TS)
          if (String(role) === '2' || (typeof role === 'string' && role.toLowerCase() === 'operador')) {
            this.authService.logout();
            this.errorMessage = 'Acesso negado. Operadores devem usar o terminal de vendas (PDV).';
            this.isLoading = false;
            this.cdr.detectChanges();
            return;
          }
          this.isLoading = false;
          this.cdr.detectChanges();
          this.router.navigate(['/admin/produtos']);
        },
        error: (err) => {
          this.isLoading = false;
          // Capture the explicit error message from the API or fallback to generic
          const apiMessage = err.error?.message || err.error?.title;
          this.errorMessage = apiMessage ? `Falha no login: ${apiMessage}` : 'Falha no login. Verifique seu e-mail e senha.';
          console.error('Login error', err);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.cdr.detectChanges();
    }
  }
}


