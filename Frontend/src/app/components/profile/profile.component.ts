import {Component, OnInit} from '@angular/core';
import {AuthService} from '@auth0/auth0-angular';
import {map} from "rxjs";
import { HttpClient } from '@angular/common/http';
import {UploadFormComponent} from "./upload-form/upload-form.component";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit{

  selectedComponent: string = 'main-info';
  isHR: boolean = false;  // This new variable will hold the HR status

  title = 'Decoded ID Token';
  code= '';

  user$ = this.auth.user$;
  code$ = this.user$.pipe(map((user) => JSON.stringify(user, null, 2)));

  user_givenname!: string;
  user_familyname!: string;
  user_name!: string;
  user_email!: string;
  user_id!: string; //Sub

  constructor(private http: HttpClient, public auth: AuthService) { }


  ngOnInit() {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.user_givenname = user.given_name || '';
        this.user_familyname = user.family_name || '';
        this.user_name = user.name || '';
        this.user_email = user.email || '';
        this.user_id = user.sub || '';

        this.postDataToDatabase();
      }
    });

    this.fetchIsHR();
    
  }

  


  postDataToDatabase() {
    // This is your data that you want to send in POST request
    const data = {
      nombre: this.user_givenname,
      apellido: this.user_familyname,
      nombre_completo: this.user_name,
      correo: this.user_email,
      sub: this.user_id
    };

    this.http.post('http://localhost:3001/api/DatabasePOST', data)
      .subscribe(
        (res) => {
          console.log(res);
        },
        (err) => {
          console.error(err);
        }
      );
  }

  //validation for HR authorized 
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


 

}
