import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudOperationsComponent } from './crud-operations.component';

describe('CrudOperationsComponent', () => {
  let component: CrudOperationsComponent;
  let fixture: ComponentFixture<CrudOperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrudOperationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
