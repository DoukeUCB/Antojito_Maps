import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RestauranteService } from '../../core/services/restaurante.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map-page.html',
  styleUrls: ['./map-page.css']
})
export class MapPage implements OnInit, AfterViewInit {

  private map!: L.Map;
  private markersLayer = L.layerGroup();
  private locationMarker?: L.Marker;

  categorias = [
    { label: 'Todas',         slug: '' },
    { label: 'Salteñas',      slug: 'Salteñas' },
    { label: 'Chicharrón',    slug: 'Chicharron' },
    { label: 'Sushi',         slug: 'Sushi' },
    { label: 'Comida Típica', slug: 'Comida Tipica' },
    { label: 'Pizzería',      slug: 'Pizzeria' },
    { label: 'Hamburguesas',  slug: 'Hamburguesas' },
    { label: 'Tacos',         slug: 'Tacos' },
    { label: 'Parrilla',      slug: 'Parrilla' },
  ];

  categoriaSeleccionada: string = '';
  textoBusqueda:         string = '';
  mostrarBienvenida:     boolean = true;
  sinResultados:         boolean = false;
  categoriaSinResultados: string = '';
  cargando:              boolean = false;
  errorApi:              boolean = false;

  private restaurantes: any[] = [];

  constructor(
    private route:              ActivatedRoute,
    private router:             Router,
    private ngZone:             NgZone,
    private restauranteService: RestauranteService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.categoriaSeleccionada = params['categoria'] || '';
      if (this.map) {
        this.filtrarRestaurantes();
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.obtenerUbicacion();
    this.cargarRestaurantes();
  }

  // ── Inicializar mapa ─────────────────────────
  private initMap(): void {
    this.map = L.map('map', {
      center: [-17.3935, -66.1568],
      zoom: 15,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
  }

  // ── Geolocalización ──────────────────────────
  private obtenerUbicacion(): void {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const iconoUbicacion = L.divIcon({
          className: 'user-location-marker',
          html: `
            <div class="user-pulse-ring"></div>
            <div class="user-dot"></div>
          `,
          iconSize:   [20, 20],
          iconAnchor: [10, 10]
        });

        if (this.locationMarker) {
          this.locationMarker.setLatLng([lat, lng]);
        } else {
          this.locationMarker = L.marker([lat, lng], { icon: iconoUbicacion })
            .addTo(this.map);
        }

        this.map.setView([lat, lng], 15);
      },
      (err) => {
        console.warn('Geolocalización denegada:', err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  // ── Cargar desde backend ─────────────────────
  cargarRestaurantes(): void {
    this.cargando = true;
    this.errorApi = false;

    const timeoutId = setTimeout(() => {
      if (this.cargando) {
        this.cargando = false;
        this.errorApi = true;
      }
    }, 8000);

    this.restauranteService.getRestaurantes().subscribe({
      next: (data: any) => {
        clearTimeout(timeoutId);

        if (Array.isArray(data)) {
          this.restaurantes = data;
        } else if (data?.data && Array.isArray(data.data)) {
          this.restaurantes = data.data;
        } else if (data?.restaurantes && Array.isArray(data.restaurantes)) {
          this.restaurantes = data.restaurantes;
        } else if (data?.content && Array.isArray(data.content)) {
          this.restaurantes = data.content;
        } else {
          this.restaurantes = [];
        }

        this.cargando = false;
        this.filtrarRestaurantes();
      },
      error: (err) => {
        clearTimeout(timeoutId);
        console.error('Error cargando restaurantes:', err);
        this.cargando = false;
        this.errorApi = true;
      }
    });
  }

  // ── Filtrar y pintar marcadores ──────────────
  filtrarRestaurantes(): void {
    this.markersLayer.clearLayers();

    const filtrados = this.restaurantes.filter(r => {
      const matchCat = !this.categoriaSeleccionada ||
        (r.category ?? r.categoria ?? '')
          .toLowerCase() === this.categoriaSeleccionada.toLowerCase();

      const nombre = r.name ?? r.nombre ?? '';
      const matchBusqueda = !this.textoBusqueda ||
        nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase());

      return matchCat && matchBusqueda;
    });

    const catLabel = this.categorias.find(c =>
      c.slug.toLowerCase() === this.categoriaSeleccionada.toLowerCase()
    )?.label || this.categoriaSeleccionada;

    this.sinResultados    = filtrados.length === 0 && !!this.categoriaSeleccionada;
    this.categoriaSinResultados = catLabel;
    this.mostrarBienvenida = filtrados.length === 0 && !this.categoriaSeleccionada;

    filtrados.forEach(r => {
      const lat = r.latitude  ?? r.lat ?? r.latitud;
      const lng = r.longitude ?? r.lng ?? r.longitud;
      if (!lat || !lng) return;

      // ── Icono del pin ──────────────────────
      const icono = L.divIcon({
        className: 'custom-restaurant-marker',
        html: `<div class="marker-pin"><div class="marker-inner"></div></div>`,
        iconSize:   [28, 36],
        iconAnchor: [14, 36]
      });

      // ── Datos del restaurante ──────────────
      const nombre      = r.name        ?? r.nombre      ?? 'Restaurante';
      const descripcion = r.description ?? r.descripcion ?? '';
      const imagen      = r.image_url   ?? r.imageUrl    ?? '';
      const categoria   = r.category    ?? r.categoria   ?? '';
      const uuid        = r.id          ?? r.uuid         ?? '';

      // ── Imagen del popup ───────────────────
      const imagenHtml = imagen
        ? `<img
             src="${imagen}"
             alt="${nombre}"
             style="width:100%;height:110px;object-fit:cover;
                    border-radius:10px 10px 0 0;display:block;"
             onerror="this.style.display='none'">`
        : `<div style="width:100%;height:70px;background:#f0ebe3;
                       border-radius:10px 10px 0 0;display:flex;
                       align-items:center;justify-content:center;font-size:32px;">
             🍽️
           </div>`;

      // ── Contenido del popup ────────────────
      const popupHtml = `
        <div style="
          font-family:'Inter',sans-serif;
          width:210px;
          border-radius:10px;
          overflow:hidden;
          margin:-14px -20px -14px;
        ">
          ${imagenHtml}
          <div style="padding:12px 14px 14px;">
            <span style="
              font-size:10px;font-weight:700;
              color:#BF9861;text-transform:uppercase;
              letter-spacing:0.8px;">
              ${categoria}
            </span>
            <p style="
              margin:5px 0 5px;font-size:14px;
              font-weight:700;color:#02332D;line-height:1.2;">
              ${nombre}
            </p>
            <p style="
              margin:0 0 12px;font-size:12px;
              color:#666;line-height:1.4;">
              ${descripcion || 'Sin descripción disponible'}
            </p>
          </div>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: icono });

      marker.bindPopup(popupHtml, {
        maxWidth:  230,
        className: 'custom-popup'
      });

      // Botón popup
      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.getElementById(`btn-ver-${uuid}`);
          if (btn) {
            btn.addEventListener('click', () => {
              this.ngZone.run(() => {
                this.router.navigate(['/restaurant-view', uuid]);
              });
            });
          }
        }, 50);
      });

      this.markersLayer.addLayer(marker);
    });
  }

  // ── Acciones del header ──────────────────────
  buscarRestaurante(texto: string): void {
    this.textoBusqueda = texto;
    this.filtrarRestaurantes();
  }

  seleccionarCategoria(slug: string): void {
    this.categoriaSeleccionada = slug;
    this.router.navigate([], {
      queryParams:       { categoria: slug || null },
      queryParamsHandling: 'merge'
    });
    this.filtrarRestaurantes();
  }

  verTodasLasCategorias(): void {
    this.seleccionarCategoria('');
  }

  volverAlInicio(): void {
    this.router.navigate(['/inicio']);
  }

  centrarEnMiUbicacion(): void {
    this.obtenerUbicacion();
  }
}