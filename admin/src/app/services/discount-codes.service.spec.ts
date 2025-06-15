import { TestBed } from '@angular/core/testing';

import { DiscountCodeService } from './discount-codes.service';

describe('DiscountCodesService', () => {
  let service: DiscountCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiscountCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
