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
    const options = {
      timeout: 40000, // Increase the timeout value (in milliseconds)
    };

    this.http.post(' https://perficient-bot-service-dannyjr08.cloud.okteto.net:8000/api/DatabasePOST', data, {
      ...options, // Spread the 'options' object for other configuration
      responseType: 'json' // Specify the response type as JSON
    })
      .subscribe(
        (res) => {
          console.log(res);
        },
        (err) => {
          console.error(err);
        }
      );
  }



 

}
