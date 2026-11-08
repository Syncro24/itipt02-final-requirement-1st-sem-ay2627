import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminAuthPage } from './admin-auth.page';

describe('AdminAuthPage', () => {
  let component: AdminAuthPage;
  let fixture: ComponentFixture<AdminAuthPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAuthPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
