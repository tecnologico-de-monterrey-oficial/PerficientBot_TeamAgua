import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import {map} from "rxjs";

@Component({
  selector: 'app-main-info',
  templateUrl: './main-info.component.html',
  styleUrls: ['./main-info.component.scss']
})
export class MainInfoComponent implements OnInit{

  user$ = this.auth.user$;
  code$ = this.user$.pipe(map((user) => JSON.stringify(user, null, 2)));

  constructor(public auth: AuthService) { }

  ngOnInit() {
   
  }

  logout(){
    this.auth.logout();
  }

}
