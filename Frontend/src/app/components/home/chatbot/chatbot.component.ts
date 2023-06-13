import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OpenaiService } from '../../../services/openai.service';
import { AuthService } from '@auth0/auth0-angular';
import { Token } from '@angular/compiler';
import { HttpClient } from '@angular/common/http';

export interface Message {
  type: string,
  message: string
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {
   user$ = this.authService.user$;

  showOverlay = false;
  loading = false; //animation waiting for bot response
  messages: Message[] = []; //chat history
  chatForm = new FormGroup({
    message: new FormControl('', [Validators.required])
  });
  @ViewChild('scrollMe') private myScrollContainer: any;


  secretkey: string = '';
  outlookToken: string = '';
  githubToken: string = '';
  azureToken: string = '';

  tokensSubidos: boolean = false;
  
  constructor(public authService: AuthService,
    private Chatbot : OpenaiService, private http: HttpClient) {}

  ngOnInit(): void {
    
    this.messages = this.Chatbot.getConversation();
    if(this.messages.length==0){
      this.messages.push({
        type: 'assistant',
        message: 'Hello, I am your personal assistant for Perficient. How can I help you today?'
      });
    }


    this.authService.user$.subscribe(user => {
      if (user) {
        this.secretkey = user.sub || '';
        this.getTokens();
      }
    });
    
  }

  result: string = "";
  myprompt: string = '';



  deleteOverlay(){
    this.showOverlay = !this.showOverlay;
  }

  confirmDelete(){
    
      this.messages = [];
      this.loading = false

      //Restart conversation with predefined bot message
      this.messages.push({
        type: 'assistant',
        message: 'Hello, I am your personal assistant for Perficient. How can I help you today?'
      });
      this.deleteOverlay();
      this.Chatbot.saveConversation(this.messages);
      this.Chatbot.clearConversation();

  }

  sendMessage() : void {
    console.log('Activar send Message');
    const sentMessage = this.chatForm.value.message!.trim();
    console.log(sentMessage);
    
    this.loading = true;
    this.messages.push({
      type: 'user',
      message: sentMessage
    });

      let body = { user_message: this.myprompt.trim(), secret_key: this.secretkey }

      this.chatForm.reset();
      this.scrollToBottom();


      this.Chatbot.sendMessage(body)
      .subscribe((data: any) => {
        //alert(JSON.stringify(data));
        console.log(data);
        console.log(data.response);
        console.log(data.response.content);
        console.log(data.new_token);
        this.result = data.response.content;
        this.loading = false;
        this.Chatbot.setAuthorizationHeader(data.new_token)
        this.messages.push({
          type: 'assistant',
          message: this.result
        });
        this.scrollToBottom();
      });

      this.Chatbot.saveConversation(this.messages);
  }

  scrollToBottom() : void {
    setTimeout(() => {
      try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight + 500;
      } catch(err) {}
    }, 150);
  }

  getTokens(): void {
    const sub = this.secretkey;

    this.http
      .get(`http://localhost:3001/api/DatabaseGETTokens/${sub}`)
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

  // Code for send message on Enter key
onEnterPressed(event: Event) {
  if (this.chatForm.valid) {
    this.sendMessage();
    event.preventDefault(); 
  }
}


}
