// login.page.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    try {
      await this.authService.signIn(this.email, this.password);
      alert('Login realizado com sucesso!');
      this.router.navigate(['/home']); // Redireciona para as tabs após o login
    } catch (error) {
      if (error instanceof Error) {
        alert('Erro no cadastro: ' + error.message);
      } else {
        alert('Erro desconhecido.');
    }
  }
}}
