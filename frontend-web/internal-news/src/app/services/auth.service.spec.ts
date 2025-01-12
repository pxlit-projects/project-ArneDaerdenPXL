import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [AuthService]
      });
      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should login and store token, role, and username in localStorage', () => {
      const mockResponse = {
        token: 'test-token',
        role: 'test-role',
        username: 'test-username'
      };

      service.login('testuser', 'testpassword').subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('token')).toBe(mockResponse.token);
        expect(localStorage.getItem('role')).toBe(mockResponse.role);
        expect(localStorage.getItem('username')).toBe(mockResponse.username);
      });

      const req = httpMock.expectOne('http://localhost:8085/api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should register a new user', () => {
      const mockResponse = {
      message: 'User registered successfully'
      };

      service.register('newuser', 'newpassword', 'user').subscribe(response => {
      expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:8085/api/auth/register');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should logout and clear localStorage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('role', 'test-role');
      localStorage.setItem('username', 'test-username');

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('role')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();
      service.currentUser$.subscribe(user => {
      expect(user).toBeNull();
      });
    });

    it('should retrieve token from localStorage on initialization', () => {
      const token = 'test-token';
      spyOn(localStorage, 'getItem').and.callFake((key: string): string | null => {
      return key === 'token' ? token : null;
      });

      const service = TestBed.inject(AuthService);

      expect(localStorage.getItem).toHaveBeenCalledWith('token');
    });
  });
});
