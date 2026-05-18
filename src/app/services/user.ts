import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: number; // 0=Admin, 1=Gerente, 2=Operador
  active: boolean;
  createdIn: string;
}

interface UserApiResponse {
  id: string;
  name?: string;
  email?: string;
  role?: number;
  active?: boolean;
  createdIn?: string;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  password?: string;
  role: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/User`;

  getAll(): Observable<UserResponse[]> {
    return this.http.get<UserApiResponse[]>(this.apiUrl).pipe(
      map((usuarios) => usuarios.map((usuario) => this.normalizeUser(usuario)))
    );
  }

  create(request: UserCreateRequest): Observable<UserResponse> {
    return this.http.post<UserApiResponse>(this.apiUrl, request).pipe(
      map((usuario) => this.normalizeUser(usuario))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private normalizeUser(usuario: UserApiResponse): UserResponse {
    return {
      id: usuario.id,
      name: usuario.name || 'Usuario sem nome',
      email: usuario.email || '-',
      role: usuario.role ?? 2,
      active: usuario.active ?? false,
      createdIn: usuario.createdIn || ''
    };
  }
}
