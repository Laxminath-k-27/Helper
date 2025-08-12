import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TickDialogComponent } from './tick-dialog.component';

describe('TickDialogComponent', () => {
  let component: TickDialogComponent;
  let fixture: ComponentFixture<TickDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TickDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TickDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
