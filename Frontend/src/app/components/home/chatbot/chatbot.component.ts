import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OpenaiService } from '../../../services/openai.service';
import { AuthService } from '@auth0/auth0-angular';

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
  constructor(private authService: AuthService,
    private Chatbot : OpenaiService) {} 

  loading = false; //animation waiting for bot response  
  messages: Message[] = []; //chat history 
  chatForm = new FormGroup({
    message: new FormControl('', [Validators.required])
  });
  @ViewChild('scrollMe') private myScrollContainer: any;

  /* constructor(private Chatbot : OpenaiService) {
    this.messages.push({
      type: 'assistant',
      message: 'Hello, I am your personal assistant for Perficient. How can I help you today?'
    });
    
  } */

  ngOnInit(): void {
    this.messages.push({
      type: 'assistant',
      message: 'Hello, I am your personal assistant for Perficient. How can I help you today?'
    });
  }

  result: string = "";
  myprompt: string = '';

 
  clearConversation(){
    
    //Alert confirmation before deleting conversation
    const confirmDelete = confirm('Are you sure you want to clear the conversation?');

    if(confirmDelete) {
      this.messages = [];
      this.loading = false

      //Restart conversation with predefined bot message
      this.messages.push({
        type: 'assistant',
        message: 'Hello, I am your personal assistant for Perficient. How can I help you today?'
      });
      this.Chatbot.clearConversation()
    }
   
  }

  sendMessage() : void {
    console.log('Activar send Message');
    const sentMessage = this.chatForm.value.message!;
    this.loading = true;
    this.messages.push({
      type: 'user',
      message: sentMessage
    });

      var body = { user_message: this.myprompt }

      this.chatForm.reset();
      this.scrollToBottom();


      this.Chatbot.sendMessage(body) 
      .subscribe((data: any) => {
        //alert(JSON.stringify(data));
        console.log(data);
        this.result = data.response.content;
        this.loading = false;
        this.messages.push({
          type: 'assistant',
          message: this.result
        });
        this.scrollToBottom();
      });
  }

  scrollToBottom() : void {
    setTimeout(() => {
      try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight + 500;
      } catch(err) {}
    }, 150);
  }
}
