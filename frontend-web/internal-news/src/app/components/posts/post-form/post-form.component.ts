import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/post.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Create a New Post</h2>
    @if(showAlertSuccess) {
      <div class="alert-box-success">{{ alertMessage }}</div>
    }
    @if(showAlertError) {
      <div class="alert-box-error">{{ alertMessage }}</div>
    }
    <div class="form-container">
        <form [formGroup]="postForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
                <label for="title">Title:</label>
                <input id="title" formControlName="title" type="text" placeholder="Enter post title" />
            </div>

            <div class="form-group">
                <label for="content">Content:</label>
                <textarea id="content" formControlName="content" placeholder="Write your content here"></textarea>
            </div>

            <!-- Removed the Author field as it is now taken from the logged-in user -->
            <!-- <div class="form-group">
                <label for="author">Author:</label>
                <input id="author" formControlName="author" type="text" placeholder="Author's name" />
            </div> -->

            <div class="form-buttons">
                <button type="button" (click)="saveDraft()" [disabled]="postForm.invalid">Save Draft</button>
                <button type="button" (click)="publishPost()" [disabled]="postForm.invalid" [style.visibility]="'hidden'">Publish</button>
            </div>
        </form>
    </div>
  `,
  styleUrls: ['./post-form.component.css']
})
export class PostFormComponent implements OnInit {
  postForm: FormGroup;
  showAlertSuccess: boolean = false;
  showAlertError: boolean = false;
  alertMessage: string = '';
  loggedInUsername: string = '';
  isLoggedIn: boolean = false;

  constructor(private fb: FormBuilder, private postService: PostService, private router: Router) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      isPublished: [false]
    });
    this.checkLoginStatus();
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  checkLoginStatus(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const role = localStorage.getItem('role');
        const username = localStorage.getItem('username');
        if (token && role === 'author') {
          this.isLoggedIn = true;
          if (username) {
            this.loggedInUsername = username;
            console.log('Logged in as:', this.loggedInUsername);
          }
        }
      } catch (e) {
        console.error('Invalid token:', e);
        this.isLoggedIn = false;
      }
    }
  }

  saveDraft(): void {
    this.submitPost(false);
  }

  publishPost(): void {
    this.submitPost(true);
  }

  submitPost(isPublished: boolean): void {
    if (this.postForm.valid) {
      const postToSubmit: Post = { 
        ...this.postForm.value, 
        author: this.loggedInUsername,
        isPublished 
      };
      
      this.postService.createPost(postToSubmit).subscribe({
        next: (response) => {
          console.log(isPublished ? 'Post published' : 'Post saved as draft', response);
          this.showAlertMessage('Post added successfully.', 'success');
          this.resetForm();
          setTimeout(() => {
            if (isPublished) {
              this.router.navigate(['/posts']);
            } else {
              this.router.navigate(['/drafts']);
            }
          }, 3000);
        },
        error: (err) => {
          console.error('Error submitting post:', err);
          this.showAlertMessage('Error adding post.', 'error');
        }
      });
    }
  }

  resetForm(): void {
    this.postForm.reset({
      title: '',
      content: '',
      isPublished: false
    });
  }

  showAlertMessage(message: string, reason: string): void {
    if (reason === 'success') {
      console.log(message);
      this.alertMessage = message;
      this.showAlertSuccess = true;
      setTimeout(() => {
        this.showAlertSuccess = false;
      }, 3000);
    } else {
      console.error(message);
      this.alertMessage = message;
      this.showAlertError = true;
      setTimeout(() => {
        this.showAlertError = false;
      }, 3000);
    }
  }

  onSubmit(): void {
    if (this.postForm.valid) {
      console.log('Post form submitted');
    }
  }
}