import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Restaurante } from '../../core/models/restaurant.model';
import { RestauranteService } from '../../core/services/restaurante.service';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/assets/marker-icon-2x-red.png',
  iconUrl: '/assets/marker-icon-red.png',
  shadowUrl: '/assets/marker-shadow.png'
});

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map-page.html',
  styleUrl: './map-page.css'
})
export class MapPage implements OnInit {

  private map: any;
  mostrarBienvenida: boolean = true;
  categoriaSeleccionada: string = '';
  restaurantesFiltrados: Restaurante[] = [];
  markersLayer: any;
  
  private markersMap: Map<string, L.Marker> = new Map(); 
  restaurantes: Restaurante[] = [];

  constructor(
    private router: Router, 
    private cd: ChangeDetectorRef,
    private restauranteService: RestauranteService 
  ) {}

  ngOnInit(): void {
    this.initMap();
    this.markersLayer = L.layerGroup().addTo(this.map); 
    this.cargarDatosDesdeBackend();
    this.configurarGeolocalizacion();
    this.iniciarTemporizadorBienvenida();
  }

  private cargarDatosDesdeBackend(): void {
    this.restauranteService.getRestaurantes().subscribe({
      next: (data) => {
        this.restaurantes = data;
        this.restaurantesFiltrados = [...this.restaurantes];
        this.agregarMarcadores();
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al conectar con el servicio:', err)
    });
  }

  private initMap(): void {
    this.map = L.map('map').setView([-17.3895, -66.1568], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private agregarMarcadores(): void {
    this.markersLayer.clearLayers(); 
    this.markersMap.clear();

    this.restaurantesFiltrados.forEach(restaurante => {
      
      const latVal = restaurante.latitude ?? restaurante.latitud;
      const lngVal = restaurante.longitude ?? restaurante.longitud;
      const id = restaurante.uuid ?? restaurante.id;
      const nombre = restaurante.nombre ?? restaurante.name;
      const descripcion = restaurante.descripcion ?? restaurante.description;

      
      if (latVal !== undefined && lngVal !== undefined && id) {
        const marker = L.marker([latVal, lngVal]);

        const popupContent = `
          <div style="text-align: center; font-family: 'Inter', sans-serif; min-width: 150px;">
            <b style="color: #02332D; font-size: 1rem;">${nombre}</b><br>
            <p style="margin: 5px 0; font-size: 0.85rem; color: #666;">
              ${descripcion ? descripcion : 'Sin descripción disponible'}
            </p>
            <button id="btn-view-${id}" 
                    style="background: #BF9861; color: white; border: none; 
                           padding: 8px 12px; border-radius: 5px; cursor: pointer;
                           font-weight: bold; margin-top: 5px; width: 100%;">
              Ver Menú y Ofertas
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);
        
        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-view-${id}`);
          if (btn) {
            btn.onclick = () => {
              this.router.navigate(['/restaurant-view', id]);
            };
          }
        });

        marker.addTo(this.markersLayer);
        this.markersMap.set(id, marker);
      }
    });
  }

  buscarRestaurante(termino: string): void {
    if (!termino.trim()) return;
    const res = this.restaurantes.find(r => {
      const nombre = r.nombre ?? r.name ?? '';
      return nombre.toLowerCase().includes(termino.toLowerCase());
    });

    if (res) {
      const lat = res.latitude ?? res.latitud;
      const lng = res.longitude ?? res.longitud;
      const id = res.uuid ?? res.id;

      if (lat !== undefined && lng !== undefined && id) {
        this.map.flyTo([lat, lng], 17);
        const marker = this.markersMap.get(id);
        if (marker) marker.openPopup();
      }
    }
  }

  filtrarRestaurantes(): void {
    this.restaurantesFiltrados = this.categoriaSeleccionada === '' 
      ? [...this.restaurantes] 
      : this.restaurantes.filter(r => {
          const cat = r.categoria ?? r.category;
          return cat === this.categoriaSeleccionada;
        });
    this.agregarMarcadores(); 
  }

  private configurarGeolocalizacion(): void {
    this.map.locate({ setView: true, maxZoom: 16 });
    this.map.on('locationfound', (e: any) => {
      L.circle(e.latlng, { radius: e.accuracy / 2, color: '#007bff' }).addTo(this.map);
    });
  }

  private iniciarTemporizadorBienvenida(): void {
    setTimeout(() => {
      this.mostrarBienvenida = false;
      this.cd.detectChanges(); 
    }, 5000);
  }
}