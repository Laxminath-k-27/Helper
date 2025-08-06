import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHelperComponent } from './edit-helper.component';

describe('EditHelperComponent', () => {
  let component: EditHelperComponent;
  let fixture: ComponentFixture<EditHelperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditHelperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
