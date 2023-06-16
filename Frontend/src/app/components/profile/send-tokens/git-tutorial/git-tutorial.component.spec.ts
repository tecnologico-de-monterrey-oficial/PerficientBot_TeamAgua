import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GitTutorialComponent } from './git-tutorial.component';

describe('GitTutorialComponent', () => {
  let component: GitTutorialComponent;
  let fixture: ComponentFixture<GitTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GitTutorialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GitTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
