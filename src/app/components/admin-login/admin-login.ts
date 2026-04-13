import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {

  correo: string = '';
  password: string = '';

  constructor(private router: Router) {}

  login(form: NgForm) {
    if (form.invalid) return;

    // navegación temporal
    this.router.navigate(['/restaurant']);
  }
}