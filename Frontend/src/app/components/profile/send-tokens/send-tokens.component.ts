import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-send-tokens',
  templateUrl: './send-tokens.component.html',
  styleUrls: ['./send-tokens.component.scss']
})
export class SendTokensComponent implements OnInit {
  outlookToken: string = '';
  githubToken: string = '';
  azureToken: string = '';
  user_sub!: string; // Sub
  tokensSubidos: boolean = false;
  showtoken: boolean = false;

  constructor(private http: HttpClient, public auth: AuthService) {}

  ngOnInit() {
    this.auth.user$.subscribe((user) => {
      if (user) {
        // Código para rellenar el user_sub
        this.user_sub = user.sub || '';
        this.getTokens();
      }
    });
  }

  enviarTokens(): void {
    if (this.outlookToken && this.githubToken && this.azureToken) {
      const sub = this.user_sub;

      const datosTokens = {
        sub: sub,
        outlookToken: this.outlookToken,
        githubToken: this.githubToken,
        azureToken: this.azureToken
      };

      this.http
        .post(' https://perficient-bot-service-dannyjr08.cloud.okteto.net:3001/api/DatabasePOSTTokens', datosTokens)
        .subscribe(
          (response: any) => {
            console.log(response.mensaje);
          },
          (error: any) => {
            console.error(error.error);
          }
        );
    } else {
      alert('Todos los campos son obligatorios');
    }
  }

  getTokens(): void {
    const sub = this.user_sub;

    this.http
      .get(` https://perficient-bot-service-dannyjr08.cloud.okteto.net:3001/api/DatabaseGETTokens/${sub}`)
      .subscribe(
        (response: any) => {
          if (response.outlookToken && response.githubToken && response.azureToken) {
            this.outlookToken = response.outlookToken;
            this.githubToken = response.githubToken;
            this.azureToken = response.azureToken;
            this.tokensSubidos = true;
            console.log('Tokens del usuario:', response);
          } else {
            console.log('No tokens found for the user');
          }
        },
        (error: any) => {
          console.error(error.error);
        }
      );
  }

  toggleShowToken() {
    this.showtoken = !this.showtoken;
  }
}



