import {Component, OnInit} from '@angular/core';
import {AuthService} from '@auth0/auth0-angular';
import {map} from "rxjs";
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import {Router} from '@angular/router';

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

  constructor(private http: HttpClient, public auth: AuthService, private router: Router) { }


  ngOnInit(): void { 
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
        this.fetchIsHR(this.user_id);
        this.postDataToDatabase();
      }
    });

    })
    
  }

  

  postDataToDatabase() {
    // This is your data that you want to send in POST request
    const data = {
      nombre: this.user_givenname,
      apellido: this.user_familyname,
      nombre_completo: this.user_name,
      correo: this.user_email,
      sub: this.user_id
    }

    this.http.post(' https://perficient-bot-service-backend-flask-dannyjr08.cloud.okteto.net/api/DatabasePOST', data)
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
  fetchIsHR(userSub: string): void {
    //it takes userSub parameter obtain in ngOnInit
    //deleted validation since is already done in OnInit method
    const userId = userSub.replace('|', '_');  // replace | with _ in user ID
        this.http.get(`https://perficient-bot-service-backend-flask-dannyjr08.cloud.okteto.net/api/CheckHR`, { params: { sub: userId } }).subscribe((response: any) => {

          if (response.length > 0) {
            console.log(response[0].IsHR);
            this.isHR = response[0].IsHR;
          }
        });
  }


 

}
