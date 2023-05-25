import {Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {AuthService} from '@auth0/auth0-angular';
import {map} from "rxjs";
import { ProfileComponent} from "../profile.component";

@Component({
  selector: 'app-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.scss']
})
export class UploadFormComponent implements OnInit{
  selectedFile: File | null = null;
  user_id!: string; //Sub


  constructor(private http: HttpClient, public auth: AuthService) { }

  ngOnInit(): void {
    this.auth.user$.subscribe(user => {
      // @ts-ignore
      this.user_id = user.sub;



      console.log(this.user_id);
    });
  }

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.selectedFile = inputElement.files[0];
    }
  }


  onSubmit() {
    if (this.selectedFile) {
      const fd = new FormData();
      fd.append('file', this.selectedFile, this.selectedFile.name);
      const userIDFixed = this.user_id.replace('|', '_');

      this.http.post(`http://localhost:3001/upload/${userIDFixed}`, fd)
        .subscribe(res => {
          console.log(res);
        });
    }
  }
}
