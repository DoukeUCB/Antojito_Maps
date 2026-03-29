import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 1. IMPORTANTE PARA FORMULARIOS

@Component({
  selector: 'app-restaurant-page',
  standalone: true,
  imports: [CommonModule, FormsModule], // 2. AÑADIR FormsModule AQUÍ
  templateUrl: './restaurant-page.html',
  styleUrl: './restaurant-page.css',
})
export class RestaurantPage {
  promociones = [{ id: 1, nombre: '10% de descuento en Combo 1', descripcion: 'Papas + Arroz + 2 Presas + Refresco', precio: 21.6 }];
  menu = [
    { id: 101, nombre: '2 Presas', descripcion: 'Papas + arroz + 2 presas de pollo', precio: 45 },
    { id: 102, nombre: 'Combo 1', descripcion: 'Papas + Arroz + 2 Presas + Refresco', precio: 35 }
  ];

  // Variables para el Modal
  editandoItem: boolean = false;
  esPromo: boolean = false;
  itemTemporal: any = {}; // Copia para editar sin alterar el original hasta guardar

  // ABRIR MODAL
  editarPromo(promo: any) {
    this.esPromo = true;
    this.abrirModal(promo);
  }

  editarMenu(item: any) {
    this.esPromo = false;
    this.abrirModal(item);
  }

  private abrirModal(item: any) {
    this.itemTemporal = { ...item }; // Creamos una copia superficial (Shallow copy)
    this.editandoItem = true;
  }

  cerrarModal() {
    this.editandoItem = false;
  }

  guardarCambios() {
    if (this.esPromo) {
      const index = this.promociones.findIndex(p => p.id === this.itemTemporal.id);
      this.promociones[index] = this.itemTemporal;
    } else {
      const index = this.menu.findIndex(m => m.id === this.itemTemporal.id);
      this.menu[index] = this.itemTemporal;
    }
    this.cerrarModal();
  }

  // ELIMINAR (Se mantiene igual)
  eliminarPromo(id: number) {
    if (confirm("¿Eliminar oferta?")) this.promociones = this.promociones.filter(p => p.id !== id);
  }

  eliminarMenu(id: number) {
    if (confirm("¿Eliminar del menú?")) this.menu = this.menu.filter(m => m.id !== id);
  }
}