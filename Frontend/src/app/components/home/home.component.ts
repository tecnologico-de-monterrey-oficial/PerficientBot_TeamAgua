import {Component, OnInit} from '@angular/core';
import {AuthService} from '@auth0/auth0-angular';
import { OpenaiService } from 'src/app/services/openai.service';
import {map} from "rxjs";
import { HttpClient } from '@angular/common/http';import { ChatbotComponent } from './chatbot/chatbot.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{

  title = 'Decoded ID Token';
  code= '';


  user$ = this.auth.user$;
  code$ = this.user$.pipe(map((user) => JSON.stringify(user, null, 2)));

  user_givenname!: string;
  user_familyname!: string;
  user_name!: string;
  user_email!: string;
  user_id!: string; //Sub
  db_user_id!: string;  // New variable to store user_id from the response

  constructor(private http: HttpClient, public auth: AuthService, 
    private Chatbot: OpenaiService, private router: Router) { }


  ngOnInit() {
    this.auth.isAuthenticated$.subscribe(isAuthenticated => {
      if(!isAuthenticated){
        //protects route using auth service and route module
        this.router.navigate(['/login']).then(r => console.log(r));
      }
      
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

    /*const options = {
      timeout: 40000, // Increase the timeout value (in milliseconds)
    };
    {
      ...options, // Spread the 'options' object for other configuration
      responseType: 'json' // Specify the response type as JSON
    }
    */

    this.http.post<{mensaje: string, user_id: string}>(' https://perficient-bot-service-backend-flask-dannyjr08.cloud.okteto.net/api/DatabasePOST', data)
      .subscribe(
        (res) => {
          console.log(res);
          this.db_user_id = res.user_id;  // Save user_id from response to your variable

          // Now send this data to the '/login' API
          const loginData = {
            "id": this.db_user_id,
            "email": this.user_email,
            "secret_key": this.user_id
          };

          console.log('Estoy haciendo Login a NodeJS');

          this.http.post<{ token: string }>('https://perficient-bot-service-backend-nodejs-dannyjr08.cloud.okteto.net/api/login', loginData)
            .subscribe(
              (rec) => {
                console.log("token: ", rec.token);
                this.Chatbot.setAuthorizationHeader(rec.token)
              },
              (err) => {
                console.error('Error with  https://perficient-bot-service-backend-flask-dannyjr08.cloud.okteto.net/api/DatabasePOST:', err);
              }
            );

        },
        (err) => {
          console.error(err);
        }
      );
  }

}
