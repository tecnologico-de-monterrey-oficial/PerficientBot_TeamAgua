import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendTokensComponent } from './send-tokens.component';

describe('SendTokensComponent', () => {
  let component: SendTokensComponent;
  let fixture: ComponentFixture<SendTokensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendTokensComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendTokensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
