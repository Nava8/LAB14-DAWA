import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Agrega esta línea

import { AppComponent } from './app.component';
import { ReportePeliculasComponent } from './reporte-peliculas/reporte-peliculas.component';

@NgModule({
  declarations: [
    AppComponent,
    ReportePeliculasComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule // Agrega esta línea
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
