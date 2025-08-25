import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSelectWithSelectAllComponent } from './multi-select-with-select-all.component';

describe('MultiSelectWithSelectAllComponent', () => {
  let component: MultiSelectWithSelectAllComponent;
  let fixture: ComponentFixture<MultiSelectWithSelectAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelectWithSelectAllComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MultiSelectWithSelectAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
