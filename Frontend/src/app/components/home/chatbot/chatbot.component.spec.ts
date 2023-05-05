import { fakeAsync, ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms'; // Import modules here
import { ChatbotComponent } from './chatbot.component';

describe('ChatbotComponent', () => {
  let component: ChatbotComponent;
  let fixture: ComponentFixture<ChatbotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatbotComponent ],
      imports: [ HttpClientModule, CommonModule, FormsModule, ReactiveFormsModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('should return that he is looking for a request to Outlook', (done) => {
    spyOn(component, 'sendMessage');

    const botonAbrir = fixture.debugElement.nativeElement.querySelector('#Smartbot__popupButton');
    botonAbrir.click();

    fixture.detectChanges();

    const textField = fixture.debugElement.nativeElement.querySelector('#Smartbot__footer--input');
    textField.value = 'Schedule me a meeting.';

    fixture.detectChanges();

    const submitButton = fixture.debugElement.nativeElement.querySelector('#Smartbot__footer--submitButton');
    submitButton.click();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.sendMessage).toHaveBeenCalled();
      // expect(component.messages[component.messages.length - 1].message).toBe('I see that you want to schedule a meeting in Outlook.');
      done();
    });
  });
});
