import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { CommonModule } from '@angular/common';
import { AuthModule } from '@auth0/auth0-angular';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChatbotComponent } from './components/home/chatbot/chatbot.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import {UploadFormComponent} from "./components/profile/upload-form/upload-form.component";
import { HrSearchComponent } from './components/profile/hr-search/hr-search.component';
import { MainInfoComponent } from './components/profile/main-info/main-info.component';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProfileComponent,
    ChatbotComponent,
    HomeComponent,
    NavbarComponent,
    UploadFormComponent,
    HrSearchComponent,
    MainInfoComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule.forRoot({
      domain: 'dev-2mvs0z4f2xdgez6l.us.auth0.com',
      clientId: 'rfKvWNyqMVcEOJ5Im6jQ9Ffo29x3LnfZ',
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    }),
    NgbModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
