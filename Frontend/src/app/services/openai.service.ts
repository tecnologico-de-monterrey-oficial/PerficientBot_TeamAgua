import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs/';
import { Message } from '../components/home/chatbot/chatbot.component';

@Injectable({
  providedIn: 'root'
})



export class OpenaiService {

  /* Test de guardado de conversacion */
  private conversation: Message[] = []; 
  
  saveConversation(conversation: Message[]): void {
    this.conversation = conversation;
  }

  getConversation(): Message[] {
    return this.conversation;
  }
 /* --------------------------------- */

  constructor(private http: HttpClient) { }
  apiURL = 'https://perficient-bot-service-backend-nodejs-dannyjr08.cloud.okteto.net/api/chat';

  // Http Options
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': '',
      'Access-Control-Allow-Origin':'*'
    })
  }

  setAuthorizationHeader(token: string): void {
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', 'Bearer '+token); 
    console.log(this.httpOptions.headers) ;
  }

  sendMessage(payload: any): Observable<any> {

    return this.http.post<any>(this.apiURL, JSON.stringify(payload), this.httpOptions)
    .pipe(
      retry(1),
      catchError(this.handleError)
    )
  }

  clearConversation(): Observable<any> {
    return this.http.post<any>(this.apiURL + 'api/login', this.httpOptions)
    .pipe(
      retry(1),
      catchError(this.handleError)
    )
  }

  handleError(error: any) {
    let errorMessage = '';
    if(error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }
}
