import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs/';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {

  constructor(private http: HttpClient) { }
  apiURL = 'http://localhost:3000/';

  // Http Options
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': ''
    })
  }

  setAuthorizationHeader(token: string): void {
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', 'Bearer '+token); 
    console.log(this.httpOptions.headers) ;
  }

  sendMessage(payload: any): Observable<any> {
    const options = {
      timeout: 40000, // Increase the timeout value (in milliseconds)
    };

    return this.http.post<any>(this.apiURL, JSON.stringify(payload), {
      ...this.httpOptions,
      ...options, // Spread the 'options' object for other configuration
      responseType: 'json' // Specify the response type as JSON
    })
    .pipe(
      retry(1),
      catchError(this.handleError)
    )
  }

  clearConversation(): Observable<any> {
    const options = {
      timeout: 40000, // Increase the timeout value (in milliseconds)
    };
    return this.http.post<any>(this.apiURL + 'clear-conversation', {
      ...this.httpOptions,
      ...options, // Spread the 'options' object for other configuration
      responseType: 'json' // Specify the response type as JSON
    })
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
