import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-restaurant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-restaurant.component.html',
  styleUrls: ['./register-restaurant.component.css'],
})
export class RegisterRestaurantComponent {

  showPassword = false;

  // datos
  name: string = '';
  email: string = '';
  password: string = '';

  // errores
  errorName: string = '';
  errorEmail: string = '';
  errorPassword: string = '';

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  register() {
    this.clearErrors();

    let valid = true;

    if (!this.name.trim()) {
      this.errorName = 'El nombre es obligatorio';
      valid = false;
    }

    if (!this.email.includes('@')) {
      this.errorEmail = 'Correo inválido';
      valid = false;
    }

    if (this.password.length < 6) {
      this.errorPassword = 'Mínimo 6 caracteres';
      valid = false;
    }

    if (!valid) return;

    console.log('Registro válido:', {
      name: this.name,
      email: this.email,
      password: this.password
    });
  }

  clearErrors() {
    this.errorName = '';
    this.errorEmail = '';
    this.errorPassword = '';
  }
}