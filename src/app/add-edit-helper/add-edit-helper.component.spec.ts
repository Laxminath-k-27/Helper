import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditHelperComponent } from './add-edit-helper.component';

describe('AddEditHelperComponent', () => {
  let component: AddEditHelperComponent;
  let fixture: ComponentFixture<AddEditHelperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditHelperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddEditHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
