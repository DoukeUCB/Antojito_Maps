import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-restaurants',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-restaurants.html',
  styleUrls: ['./admin-restaurants.css']
})
export class AdminRestaurantsComponent {

  constructor(private router: Router) {}

  restaurantes = [
    { nombre: 'MAMA CHICKEN', plan: 'Ninguna', tiempo: '0 días', bloqueado: false },
    { nombre: 'ROAST AND ROLL', plan: 'Mensual', tiempo: '5 días', bloqueado: false },
    { nombre: 'SUBWAY', plan: 'Anual', tiempo: '125 días', bloqueado: true },
    { nombre: 'POLLOS COPACABANA', plan: 'Ninguna', tiempo: '0 días', bloqueado: false },
    { nombre: 'BURGER KING', plan: 'Mensual', tiempo: '11 días', bloqueado: true },
    { nombre: 'PIZZA ELIS', plan: 'Mensual', tiempo: '1 día', bloqueado: false }
  ];

  toggleBloqueo(r: any) {
    r.bloqueado = !r.bloqueado;
  }

  irAdmin() {
    this.router.navigate(['/admin']);
  }
}