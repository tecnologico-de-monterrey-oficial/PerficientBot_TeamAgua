import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css']
})
export class SearchBarComponent implements OnInit {
  textoBusqueda: string = '';
  resultados: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  onInputChange(): void {
    if (this.textoBusqueda) {
      this.http.get('http://localhost:8000/api/DatabaseGET', { params: { fullname: this.textoBusqueda } })
        .subscribe((response: any) => {
          this.resultados = response;
        });
    } else {
      this.resultados = [];
    }
  }
  

  accion1(persona: any): void {
    // Acción a realizar cuando se hace clic en el botón 1
  }

  accion2(persona: any): void {
    // Acción a realizar cuando se hace clic en el botón 2
  }
}
