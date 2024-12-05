import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar">
      <h1 (click)="navigateTo('/posts')">Internal News</h1>
      <ul class="navbar-links">
        <li><button (click)="navigateTo('/posts')">Posts</button></li>
        <li><button (click)="navigateTo('/drafts')">Drafts</button></li>
        <li><button (click)="navigateTo('/create-post')">Create Post</button></li>
      </ul>
    </nav>
  `,
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}