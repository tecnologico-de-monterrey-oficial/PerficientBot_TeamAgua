import { Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {AuthService} from '@auth0/auth0-angular';

@Component({
  selector: 'app-hr-search',
  templateUrl: './hr-search.component.html',
  styleUrls: ['./hr-search.component.scss']
})
export class HrSearchComponent implements OnInit{
  textoBusqueda: string = '';
  resultados: any[] = [];
  isHR: boolean = false;  // This new variable will hold the HR status


  constructor(private http: HttpClient, public auth: AuthService) { }

  ngOnInit(): void {
    this.auth.user$.subscribe(user => {
      // @ts-ignore
      const userId = user.sub.replace('|', '_');  // replace | with _ in user ID
      this.http.get(`http://localhost:3001/api/CheckHR`, { params: { user_id: userId } }).subscribe((response: any) => {
        this.isHR = response.isHR;
      });
    });
  }

  onInputChange(): void {
    if (this.textoBusqueda) {
      this.http.get('http://localhost:3001/api/DatabaseGET', { params: { fullname: this.textoBusqueda } })
        .subscribe((response: any) => {
          this.resultados = response;
        });
    } else {
      this.resultados = [];
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

}
