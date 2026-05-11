import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureUsers } from './feature-users';

describe('FeatureUsers', () => {
  let component: FeatureUsers;
  let fixture: ComponentFixture<FeatureUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureUsers],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureUsers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
