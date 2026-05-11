import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataAccessUsers } from './data-access-users';

describe('DataAccessUsers', () => {
  let component: DataAccessUsers;
  let fixture: ComponentFixture<DataAccessUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataAccessUsers],
    }).compileComponents();

    fixture = TestBed.createComponent(DataAccessUsers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
