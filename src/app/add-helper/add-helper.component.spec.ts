import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHelperComponent } from './add-helper.component';

describe('AddHelperComponent', () => {
  let component: AddHelperComponent;
  let fixture: ComponentFixture<AddHelperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddHelperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
