import { Component } from '@angular/core'; 
import { Router } from '@angular/router'; 
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar">
      <h1 (click)="navigateTo('/posts')">Internal News</h1>
      <ul class="navbar-links">
        @if(isLoggedIn) {
          <li><button (click)="navigateTo('/posts')">Posts</button></li>
        }
        @if(isLoggedIn && userRole === 'author') {
          <li><button (click)="navigateTo('/drafts')">Drafts</button></li>
          <li><button (click)="navigateTo('/create-post')">Create Post</button></li>
        }

        @if(isLoggedIn) {
          <li><button (click)="logout()">Logout</button></li>
        } @else {
          <li><button (click)="navigateTo('/login')">Login</button></li>
        }
      </ul>
    </nav>
  `,
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  isLoggedIn: boolean = false;
  userRole: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.isLoggedIn = this.checkToken();
    if (this.isLoggedIn) {
      this.userRole = this.getUserRole();
    }
  }

  checkToken(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserRole(): string {
    return localStorage.getItem('role') || '';
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
    window.location.reload();
    this.router.navigate(['/posts']);
  }
}