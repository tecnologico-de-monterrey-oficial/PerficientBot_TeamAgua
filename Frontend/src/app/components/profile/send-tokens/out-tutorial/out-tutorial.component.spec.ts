import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutTutorialComponent } from './out-tutorial.component';

describe('OutTutorialComponent', () => {
  let component: OutTutorialComponent;
  let fixture: ComponentFixture<OutTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OutTutorialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
