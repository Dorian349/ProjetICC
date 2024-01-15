import { Component } from '@angular/core';
import * as L from 'leaflet';
import { RestaurantI } from '../shared/model/restaurant-i';
import { RestaurantsService } from '../shared/services/restaurants.service';
import { CoorCityService } from '../shared/services/coor-city.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent {
  private map: any;
  private marker: any;
  public city: string = "";

  activeFilters: string[] = []; // Initialisez à un tableau vide
  displayedMarkers: L.Marker[] = [];

  private listMarkers: RestaurantI[] = [];


  constructor(public restaurantService : RestaurantsService, public coordCity : CoorCityService) { }

  ngOnInit() {
    console.log("ngOnInit");
    this.listMarkers = this.restaurantService.getAllRestaurants();
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [39.8283 , -98.5795],
      zoom: 5
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    const bounds = this.map.getBounds();

    this.listMarkers.forEach((marker) => {
      let coord = {lat : marker.lat, lng : marker.lng}
      if (bounds.contains(coord)) {
        this.displayedMarkers.push(L.marker([marker.lat, marker.lng]).bindTooltip('<strong>' +marker.name+'</strong><br>'+marker.address+'<br>Category : '+ marker.category + '<br>Score : ' + marker.score).addTo(this.map));
      } else {
        this.map.removeLayer(marker);
      }

    })

    this.map.on('moveend', this.handleMapMoveEnd.bind(this));
  }


  // Code pour réagir à l'événement moveend
  handleMapMoveEnd() {
    this.printMarker();
  }

  // Code pour afficher les marqueurs qu'il faut
  printMarker() {
    const bounds = this.map.getBounds();
    console.log("updateMarkers");

    this.listMarkers.forEach((marker) => {
      let coord = {lat : marker.lat, lng : marker.lng}
      if (bounds.contains(coord) && ((this.activeFilters.some((filter) => marker.category.includes(filter)) && this.activeFilters.length > 0)|| this.activeFilters.length == 0)) {
        L.marker([marker.lat, marker.lng]).bindTooltip('<strong>' +marker.name+'</strong><br>'+marker.address+'<br>Category : '+ marker.category + '<br>Score : ' + marker.score).addTo(this.map);
      } else {
        this.map.removeLayer(coord);
      }
    })
    this.map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker) {
        if (bounds.contains(layer.getLatLng())) {
          this.map.addLayer(layer);
        }else{
          this.map.removeLayer(layer);
        }
      }
    });
  }

  // Code pour gérer les filtres
  applyFilter(filter: string): void {
    // Vérifie si le filtre est déjà actif
    const index = this.activeFilters.indexOf(filter);

    if (index === -1) {
      // Ajoute le filtre à la liste s'il n'est pas déjà présent
      this.activeFilters.push(filter);
    } else {
      // Retire le filtre s'il est déjà actif
      this.activeFilters.splice(index, 1);
    }

    // Logique pour afficher/masquer les marqueurs en fonction des filtres actifs

    // Exemple : Supprimer tous les marqueurs de la carte
    this.map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });


    // Exemple : Ajouter les marqueurs correspondant aux filtres actifs
    this.listMarkers.forEach((marker) => {
      if (this.activeFilters.some((filter) => marker.category.includes(filter)) && this.map.getBounds().contains([marker.lat, marker.lng]) && this.activeFilters.length > 0) {
        L.marker([marker.lat, marker.lng]).bindTooltip('<strong>' +marker.name+'</strong><br>'+marker.address+'<br>Category : '+ marker.category + '<br>Score : ' + marker.score).addTo(this.map);
      }else if (this.activeFilters.length == 0 && this.map.getBounds().contains([marker.lat, marker.lng])) {
        L.marker([marker.lat, marker.lng]).bindTooltip('<strong>' +marker.name+'</strong><br>'+marker.address+'<br>Category : '+ marker.category + '<br>Score : ' + marker.score).addTo(this.map);
      }
    });
  }


  //Coordonnées de la ville
  getCityCoord() {
    if (this.city == "") {
      this.map.setView([39.8283 , -98.5795], 5);
    }else{
      this.coordCity.geocodeAddress(this.city).subscribe((data) => {
        this.map.setView([data[0].lat, data[0].lon], 13);
      });
    }
  }



}
