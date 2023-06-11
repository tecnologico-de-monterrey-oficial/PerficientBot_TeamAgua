import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { HttpClient } from '@angular/common/http'; //added for currentdate
import { interval } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  currentDateAndHour:  string = '';

  user$ = this.authService.user$;
  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit() {
    this.updateCurrentDateAndHour();
    interval(1000).subscribe(() => {
      this.updateCurrentDateAndHour();
    });
  }
  
    //http://localhost:3000/datetime
    updateCurrentDateAndHour() {
      this.http.get<{currentD: string}>('http://localhost:3000/datetime').subscribe(
        response => {
          this.currentDateAndHour = response.currentD + ' UTC';
        },
        error => {
          console.error(error);
        }
      );
    }
}
