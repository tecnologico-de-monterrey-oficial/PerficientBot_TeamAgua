import { TestBed } from '@angular/core/testing';

import { OpenaiService } from './openai.service';

describe('OpenaiService', () => {
  let service: OpenaiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenaiService);
  });

  xit('should be created', () => {
    expect(service).toBeTruthy();
  });
});
