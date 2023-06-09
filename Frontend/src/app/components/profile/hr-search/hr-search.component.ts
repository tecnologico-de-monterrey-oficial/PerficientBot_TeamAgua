import { Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {AuthService} from '@auth0/auth0-angular';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-hr-search',
  templateUrl: './hr-search.component.html',
  styleUrls: ['./hr-search.component.scss']
})
export class HrSearchComponent implements OnInit{
  textoBusqueda: string = '';
  resultados: any[] = [];
  noResults: boolean = true;
  isHR: boolean = false;  // This new variable will hold the HR status
  selectedPersona: any; // show employee
  show = "";



  constructor(private http: HttpClient, public auth: AuthService) { }

  ngOnInit(): void {
    this.fetchIsHR();
  }

  fetchIsHR(): void {
    this.auth.user$
      // @ts-ignore
      .pipe(filter(user => user !== null && user.sub !== null))
      .subscribe(user => {
        // @ts-ignore
        const userId = user.sub.replace('|', '_');  // replace | with _ in user ID
        this.http.get(`http://localhost:3001/api/CheckHR`, { params: { sub: userId } }).subscribe((response: any) => {

          if (response.length > 0) {
            console.log(response[0].IsHR);
            this.isHR = response[0].IsHR;
          }
        });
      });
  }



  onInputChange(): void {
    if (this.textoBusqueda) {
      this.http.get('http://localhost:3001/api/DatabaseGET', { params: { fullname: this.textoBusqueda } })
        .subscribe((response: any) => {
          this.resultados = response;
          this.noResults = false;
        });
    } else {
      this.resultados = [];
      this.noResults = true;
    }
  }


  getImage(persona: any): void {
    const subFixed = persona.sub.replace('|', '_');

    // then use the fixed sub in your HTTP requests
    this.http.get(`http://localhost:3001/CV/${subFixed}`).subscribe(
      (response: any) => {
        persona.cvImage = response.image;
        persona.cvImageData = 'data:image/png;base64,' + persona.cvImage;
      },
      (error: any) => {
        console.log('Error retrieving CV image:', error);
      }
    );
  }

  getSummary(persona: any): void {
    const subFixed = persona.sub.replace('|', '_');

    // then use the fixed sub in your HTTP requests
    this.http.get(`http://localhost:3001/GPTtext/${subFixed}`).subscribe(
      (response: any) => {
        persona.summary = response.content;
        console.log(persona.summary);
      },
      (error: any) => {
        console.log('Error retrieving summary:', error);
      }
    );
  }

  //Employee view functions overlay
  openOverlay(persona: any) {
    this.selectedPersona = persona;
    this.getImage(persona);
    this.getSummary(persona);
  }

  closeOverlay() {
    this.selectedPersona = null;
    this.show = "";
  }

  //Choose what to show in overlay
  showOverlay(content: string) {
    this.show = content;
  }

}
