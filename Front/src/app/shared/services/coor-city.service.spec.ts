import { TestBed } from '@angular/core/testing';

import { CoorCityService } from './coor-city.service';

describe('CoorCityService', () => {
  let service: CoorCityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoorCityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
