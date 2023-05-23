import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-search-bar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css']
})
export class SearchBarComponent {
  textoBusqueda: string = '';
  resultados: any[] = [];

  constructor(private http: HttpClient) { }

  buscar() {
    if (this.textoBusqueda && this.textoBusqueda.length > 2) {
      this.http.get<any[]>('URL_DE_TU_API' + this.textoBusqueda)
        .subscribe(data => {
          this.resultados = data;
        });
    } else {
      this.resultados = [];
    }
  }
}


