import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { By } from '@angular/platform-browser';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout']);

    await TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should set isLoggedIn to true if token exists', () => {
      spyOn(localStorage, 'getItem').and.callFake((key: string) => {
        if (key === 'token') return 'valid-token';
        return null;
      });

      const comp = new NavbarComponent(mockAuthService, mockRouter);
      expect(comp.isLoggedIn).toBeTrue();
    });

    it('should set userRole if token exists', () => {
      spyOn(localStorage, 'getItem').and.callFake((key: string) => {
        if (key === 'token') return 'valid-token';
        if (key === 'role') return 'author';
        return null;
      });

      const comp = new NavbarComponent(mockAuthService, mockRouter);
      expect(comp.userRole).toBe('author');
    });

    it('should not set isLoggedIn or userRole if token does not exist', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);

      const comp = new NavbarComponent(mockAuthService, mockRouter);
      expect(comp.isLoggedIn).toBeFalse();
      expect(comp.userRole).toBe('');
    });
  });

  describe('Navigation', () => {
    it('should navigate to /posts when h1 is clicked', () => {
      const h1 = fixture.debugElement.query(By.css('h1'));
      h1.triggerEventHandler('click', null);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/posts']);
    });

    it('should navigate to the correct route when a button is clicked', () => {
      component.isLoggedIn = true;
      component.userRole = 'author';
      fixture.detectChanges();

      const postsButton = fixture.debugElement.query(By.css('button:nth-child(1)'));
      postsButton.triggerEventHandler('click', null);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/posts']);

      const draftsButton = fixture.debugElement.query(By.css('button:nth-child(2)'));
      draftsButton.triggerEventHandler('click', null);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/drafts']);
    });

    it('should navigate to /login if not logged in', () => {
      component.isLoggedIn = false;
      fixture.detectChanges();

      const loginButton = fixture.debugElement.query(By.css('button'));
      loginButton.triggerEventHandler('click', null);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Logout', () => {
    it('should call authService.logout and reload the page on logout', () => {
      spyOn(window.location, 'reload'); // Mock reload
      component.logout();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(window.location.reload).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/posts']);
    });
  });

  describe('Template', () => {
    it('should display navigation buttons for authors when logged in', () => {
      component.isLoggedIn = true;
      component.userRole = 'author';
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('button'));
      expect(buttons.length).toBe(4);
      expect(buttons[0].nativeElement.textContent).toContain('Posts');
      expect(buttons[1].nativeElement.textContent).toContain('Drafts');
      expect(buttons[2].nativeElement.textContent).toContain('Create Post');
      expect(buttons[3].nativeElement.textContent).toContain('Logout');
    });

    it('should display only login button when not logged in', () => {
      component.isLoggedIn = false;
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('button'));
      expect(buttons.length).toBe(1);
      expect(buttons[0].nativeElement.textContent).toContain('Login');
    });
  });
});