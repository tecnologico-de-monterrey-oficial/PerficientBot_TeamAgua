import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartbotComponent } from './smartbot.component';

describe('SmartbotComponent', () => {
  let component: SmartbotComponent;
  let fixture: ComponentFixture<SmartbotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmartbotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmartbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
