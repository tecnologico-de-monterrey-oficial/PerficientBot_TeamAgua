import {Component, OnInit} from '@angular/core';
import {AuthService} from '@auth0/auth0-angular';
import {Router} from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit{

  constructor(public auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.auth.isAuthenticated$.subscribe(isAuthenticated => {
      if(isAuthenticated){
        this.router.navigate(['/profile']).then(r => console.log(r));
      }


    })
  }

  login(){
    this.auth.loginWithRedirect();
    
  }


}
