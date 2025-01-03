import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <h2>Register</h2>
      @if(successMessage) {
        <div class="alert alert-success">{{ successMessage }}</div>
      }
      @if(errorMessage) {
        <div class="alert alert-error">{{ errorMessage }}</div>
      }
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="username">Username:</label>
          <input
            id="username"
            formControlName="username"
            type="text"
            placeholder="Enter your username"
          />
          @if(registerForm.controls['username'].invalid && registerForm.controls['username'].touched) {
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
          />
          @if(registerForm.controls['password'].invalid && registerForm.controls['password'].touched) {
            <div class="alert alert-error">Password is required.</div>
          }
        </div>
        <div class="form-group">
          <label for="role">Role:</label>
          <select id="role" formControlName="role">
            <option value="">Select role</option>
            <option value="user">User</option>
            <option value="author">Author</option>
          </select>
          @if(registerForm.controls['role'].invalid && registerForm.controls['role'].touched) {
            <div class="alert alert-error">Role is required.</div>
          }
        </div>
        <button type="submit" [disabled]="registerForm.invalid">
          Register
        </button>
      </form>
      <div class="form-footer">
        <p>Already have an account? Login <a (click)="navigateToLogin()" style="color: blue;">here</a></p>
      </div>
    </div>
  `,
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.registerForm.valid) {
      const { username, password, role } = this.registerForm.value;
      this.authService.register(username, password, role).subscribe({
        next: () => {
          this.successMessage = 'Registration successful! Redirecting to login...';
          this.errorMessage = null;
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: () => {
          this.successMessage = null;
          this.errorMessage = 'Registration failed. Please try again.';
        },
      });
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}