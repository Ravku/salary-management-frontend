import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let fixture: ReturnType<typeof TestBed.createComponent<DashboardComponent>>;
  let router: Router;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['clearToken']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    fixture.detectChanges();
  });

  it('renders dashboard navigation and the child route outlet', () => {
    const element = fixture.nativeElement as HTMLElement;
    const links = Array.from(element.querySelectorAll('a.nav-link'))
      .map(link => link.textContent?.trim());

    expect(links).toEqual(['By Country', 'By Department', 'Employees']);
    expect(element.querySelector('router-outlet')).not.toBeNull();
    expect(element.querySelector('.brand')?.getAttribute('routerLink')).toBe('/dashboard/country');
  });

  it('clears authentication and navigates to login when signing out', () => {
    fixture.nativeElement.querySelector('button').click();

    expect(authService.clearToken).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
