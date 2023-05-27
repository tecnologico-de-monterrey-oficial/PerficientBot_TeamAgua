import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {AuthService} from '@auth0/auth0-angular';

@Component({
  selector: 'app-hr-search',
  templateUrl: './hr-search.component.html',
  styleUrls: ['./hr-search.component.scss']
})
export class HrSearchComponent {
  user_id!: string;
  cvImage!: string;
  cvImageData: string = '';
  summary!: string;

  ngOnInit(): void {
    this.auth.user$.subscribe(user => {
      // @ts-ignore
      this.user_id = user.sub;
      console.log(this.user_id);
    });
  }

    constructor(private http: HttpClient, public auth: AuthService) { }

    getImage(){
      this.http.get(`http://localhost:3001/CV/${this.user_id}`).subscribe(
        (response: any) => {
          this.cvImage = response.image;
          this.cvImageData = 'data:image/png;base64,' + this.cvImage;
        },
        (error: any) => {
          console.log('Error retrieving CV image:', error);
        }
      );
    }

    getSummary(){
      this.http.get(`http://localhost:3001/GPTtext/${this.user_id}`).subscribe(
        (response: any) => {
          this.summary = response.content;
          console.log(this.summary);
        },
        (error: any) => {
          console.log('Error retrieving summary:', error);
        }
      );
    }

}
