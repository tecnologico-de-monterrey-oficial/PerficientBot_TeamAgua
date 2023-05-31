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

  constructor(private http: HttpClient, public auth: AuthService) { }

  ngOnInit(): void {
    this.auth.user$.subscribe(user => {
      if (user) {
        // Rellenar el user_sub
        this.user_sub = user.sub || '';
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

      this.http.post('http://localhost:8000/api/DatabasePOSTTokens', datosTokens)
        .subscribe((response: any) => {
          console.log(response.mensaje);
        }, (error: any) => {
          console.error(error.error);
        });
    } else {
      // Mostrar mensaje de error
      alert('Es obligatorio llenar todos los campos de token');
    }
  }
}

