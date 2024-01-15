import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './map/map.component';

const routes: Routes = [
  { path :  'EcoScore', component: MapComponent },
  { path :  '', redirectTo: '/EcoScore', pathMatch: 'full' },
  { path :  '**', redirectTo: '/EcoScore', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
