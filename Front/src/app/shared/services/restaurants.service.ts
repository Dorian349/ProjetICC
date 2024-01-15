import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RestaurantI } from '../model/restaurant-i';

@Injectable({
  providedIn: 'root'
})
export class RestaurantsService {
  public listeRestaurants : RestaurantI[] = [
    {
      "name" : "Sustainabowl",
      "address" : "8338 Lincoln Blvd, Los Angeles, CA 90045, États-Unis",
      "lat": 33.9595,
      "lng": -118.4177,
      "category": ["social", "governance"],
      "score": 2.05
    },
    {
        "name" : "Plant Food + Wine",
        "address" : "300 S Doheny Dr, Los Angeles, CA 90048, États-Unis",
        "lat": 34.073599,
        "lng": -118.389727,
        "category": ["social", "governance"],
        "score": 2.3
    },
    {
        "name" : "The Vegan Joint - DTLA (California Certified Green Business)",
        "address" : "980 San Pedro St, Los Angeles, CA 90015, États-Unis",
        "lat": 34.036108,
        "lng": -118.251445,
        "category": ["social", "governance"],
        "score": 2.4
    },
    {
        "name" : "Green Leaves Vegan",
        "address" : "1769 Hillhurst Ave, Los Angeles, CA 90027, États-Unis",
        "lat": 34.1033686,
        "lng": -118.2875896,
        "category": ["social", "governance"],
        "score": 2.2
    },
    {
        "name" : "Tender Greens",
        "address" : "6290 Sunset Blvd, Hollywood, CA 90028, États-Unis",
        "lat": 34.09792,
        "lng": -118.2875896,
        "category": ["organic","social", "governance"],
        "score": 2.1412429378531073
    },
    {
        "name" : "The Kitchen For The Puffessor",
        "address" : "696 S Alvarado St, Los Angeles, CA 90057, États-Unis",
        "lat": 34.056484,
        "lng": -118.326282,
        "category": ["social", "governance"],
        "score": 3.25
    },
    {
        "name" : "Green House",
        "address" : "1150 San Pedro St, Los Angeles, CA 90015, États-Unis",
        "lat": 34.034392,
        "lng": -118.252614,
        "category": ["social", "governance"],
        "score": 3.0
    },
    {
        "name" : "Green Corner",
        "address" : "1411 W Sunset Blvd, Los Angeles, CA 90026, États-Unis",
        "lat": 34.074609,
        "lng": -118.252322,
        "category": ["organic","social", "governance"],
        "score": 2.1412429378531073
    },
    {
        "name" : "CENTRIC EATS THEE VEGAN WINGZ STOP & SOUL FOOD",
        "address" : "3317 N Mission Rd, Los Angeles, CA 90031, États-Unis",
        "lat": 34.066193,
        "lng": -118.205997,
        "category": ["governance"],
        "score": 2.1412429378531073
    },
    {
        "name" : "Simply Wholesome",
        "address" : "4508 W Slauson Ave, Los Angeles, CA 90043, États-Unis",
        "lat": 33.9886573,
        "lng": -118.3544909,
        "category": ["organic", "governance"],
        "score": 2.4
    },
    {
        "name" : "Earthy Picks Vegan Cafe",
        "address" : "420 E Church St #114, Orlando, FL 32801, États-Unis",
        "lat": 28.540376,
        "lng": -81.37256,
        "category": ["social", "governance"],
        "score": 2.15
    },
    {
        "name" : "Dharma Southern Kitchen",
        "address" : "5565 Old Cheney Hwy, Orlando, FL 32807, États-Unis",
        "lat": 28.561261,
        "lng": -81.313441,
        "category": ["social", "governance"],
        "score": 2.25
    },
    {
        "name" : "The Monroe",
        "address" : "448 N Terry Ave, Orlando, FL 32801, États-Unis",
        "lat": 28.545703,
        "lng": -81.38703,
        "category": ["social", "governance"],
        "score": 2.15
    },
    {
        "name" : "The Cowfish® Sushi Burger Bar",
        "address" : "6000 Universal Blvd, Orlando, FL 32819, États-Unis",
        "lat": 28.4718789,
        "lng": -81.4712106,
        "category": ["organic","social", "governance"],
        "score": 2.1
    },
    {
        "name" : "Kraves Vegan Foods",
        "address" : "100 Freedom Pl S, New York, NY 10069, États-Unis",
        "lat": 40.7742378,
        "lng": -73.989899,
        "category": ["governance"],
        "score": 0.6
    },
    {
        "name" : "Little Beet",
        "address" : "135 W 50th St, New York, NY 10020, États-Unis",
        "lat": 40.7608683,
        "lng": -73.9823969,
        "category": ["social", "governance"],
        "score": 2.15
    },
    {
        "name" : "Planta Queen",
        "address" : "15 W 27th St, New York, NY 10001, États-Unis",
        "lat": 40.7444772,
        "lng": -73.988275,
        "category": ["social", "governance"],
        "score": 2.1
    }
  ]

  constructor(private http : HttpClient) { }


  getAllRestaurants() : RestaurantI[]{
    return this.listeRestaurants;
  }

}
