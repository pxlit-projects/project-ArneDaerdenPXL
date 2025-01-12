import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <h2>Login</h2>
      @if(errorMessage) {
        <div class="alert alert-error">{{ errorMessage }}</div>
      }
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="username">Username:</label>
          <input
            id="username"
            formControlName="username"
            type="text"
            placeholder="Enter your username"
            (keydown.enter)="onSubmit()"
          />
          @if(loginForm.controls['username'].invalid && loginForm.controls['username'].touched) {
            <div class="alert alert-error">Username is required.</div>
          }
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input
            id="password"
            formControlName="password"
            type="password"
            placeholder="Enter your password"
            (keydown.enter)="onSubmit()"
          />
          @if(loginForm.controls['password'].invalid && loginForm.controls['password'].touched) {
            <div class="alert alert-error">Password is required.</div>
          }
        </div>
        <button type="submit" [disabled]="loginForm.invalid">
          Login
        </button>
      </form>
      <div class="form-footer">
        <p>Don't have an account? Register <a (click)="navigateToRegister()" style="color: blue;">here</a></p>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: () => {
          this.router.navigate(['/posts']).then(() => {
            window.location.reload();
          });
        },
        error: () => {
          this.errorMessage = 'Login failed. Please check your credentials.';
        },
      });
    }
  }  

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}