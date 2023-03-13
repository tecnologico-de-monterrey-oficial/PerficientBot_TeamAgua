import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OpenaiService } from '../../../services/openai.service';

export interface Message {
  type: string,
  message: string
}

@Component({
  selector: 'app-smartbot',
  templateUrl: './smartbot.component.html',
  styleUrls: ['./smartbot.component.scss']
})
export class SmartbotComponent implements OnInit {
  isOpen = false;
  loading = false;
  messages: Message[] = [];
  chatForm = new FormGroup({
    message: new FormControl('', [Validators.required])
  });
  @ViewChild('scrollMe') private myScrollContainer: any;

  constructor(private Smartbot : OpenaiService) {
    this.messages.push({
      type: 'client',
      message: 'Hello, I am your personal assistant Smartbot. How can I help you today?'
    });
  }

  ngOnInit(): void {
  }

  result: string = "";
  myprompt: string = '';

  openSmartBot() : void {
    this.isOpen = !this.isOpen;
  }

  sendMessage() : void {
    const sentMessage = this.chatForm.value.message!;
    this.loading = true;
    this.messages.push({
      type: 'user',
      message: sentMessage
    });

      var payload = {
        model: "curie:ft-personal-2023-03-11-06-30-42",
        prompt: this.myprompt,
        temperature: 0,
        max_tokens: 60,
        stop: "."
      }

      this.chatForm.reset();
      this.scrollToBottom();

      this.Smartbot.sendMessage(payload) // Don't put sentMessage here?
      .subscribe((data: any) => {
        //alert(JSON.stringify(data));
        console.log(data);
        this.result = data.choices[0].text;
        this.loading = false;
        this.messages.push({
          type: 'client',
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
