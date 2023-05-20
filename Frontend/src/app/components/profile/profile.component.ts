import {Component, OnInit} from '@angular/core';
import {AuthService} from '@auth0/auth0-angular';
import {map} from "rxjs";
import {UploadFormComponent} from "./upload-form/upload-form.component";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit{
  title = 'Decoded ID Token';
  code= '';

  user$ = this.auth.user$;
  code$ = this.user$.pipe(map((user) => JSON.stringify(user, null, 2)));



  constructor(public auth: AuthService) { }


  ngOnInit(): void {

  }

  logout(){
    this.auth.logout();
  }

}
