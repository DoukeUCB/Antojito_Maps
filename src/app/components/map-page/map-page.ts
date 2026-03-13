import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/assets/marker-icon-2x-red.png',
  iconUrl: '/assets/marker-icon-red.png',
  shadowUrl: '/assets/marker-shadow.png'
});

@Component({
  selector: 'app-map-page',
  standalone: true,
  templateUrl: './map-page.html',
  styleUrl: './map-page.css'
})
export class MapPage implements OnInit {

  private map: any;

  // Restaurantes simulados
  private restaurants = [
    {
      name: "Pollos Panchita",
      lat: -17.3895,
      lng: -66.1568,
      description: "Pollo frito y combos familiares"
    },
    {
      name: "Burger House",
      lat: -17.3950,
      lng: -66.1600,
      description: "Hamburguesas artesanales"
    },
    {
      name: "Pizza Loca",
      lat: -17.3920,
      lng: -66.1500,
      description: "Pizzas con promociones"
    }
  ];

  ngOnInit(): void {
    this.initMap();
    this.addRestaurants();
  }

  private initMap(): void {

    this.map = L.map('map').setView([-17.3895, -66.1568], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

 
  private addRestaurants(): void {

  this.restaurants.forEach(restaurant => {

    const marker = L.marker([restaurant.lat, restaurant.lng]).addTo(this.map);

    marker.bindPopup(`
      <div style="text-align:center; width:200px">

        <img src="/assets/logo-panchita.png"
             style="width:80px; margin-bottom:8px; border-radius:8px">

        <h3 style="margin:5px 0">${restaurant.name}</h3>
        <p style="font-size:14px; margin:0 0 10px 0"">
          ${restaurant.description}
        </p>

        <a href="/restaurant"
           style="
             background:#7F1100;
             color:white;
             padding:6px 12px;
             border-radius:6px;
             text-decoration:none;
             font-size:14px
           ">
           Ver restaurante
        </a>

      </div>
    `);

  });

}

}