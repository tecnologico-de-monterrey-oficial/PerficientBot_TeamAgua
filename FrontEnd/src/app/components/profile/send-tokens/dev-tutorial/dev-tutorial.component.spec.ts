import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevTutorialComponent } from './dev-tutorial.component';

describe('DevTutorialComponent', () => {
  let component: DevTutorialComponent;
  let fixture: ComponentFixture<DevTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DevTutorialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
