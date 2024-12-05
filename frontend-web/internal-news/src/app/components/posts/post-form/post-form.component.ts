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

            <div class="form-group">
                <label for="author">Author:</label>
                <input id="author" formControlName="author" type="text" placeholder="Author's name" />
            </div>

            <div class="form-buttons">
                <button type="button" (click)="saveDraft()" [disabled]="postForm.invalid">Save Draft</button>
                <button type="button" (click)="publishPost()" [disabled]="postForm.invalid">Publish</button>
            </div>
        </form>
    </div>

    @if (alertMessage) {
        <div class="alert" [ngClass]="alertClass">
            {{ alertMessage }}
        </div>
    }
  `,
  styleUrls: ['./post-form.component.css']
})
export class PostFormComponent implements OnInit {
  postForm: FormGroup;
  alertMessage: string | null = null;
  alertClass: string = '';

  constructor(private fb: FormBuilder, private postService: PostService, private router: Router) {
      this.postForm = this.fb.group({
          title: ['', Validators.required],
          content: ['', Validators.required],
          author: ['', Validators.required],
          isPublished: [false]
      });
  }

  ngOnInit(): void {}

  saveDraft(): void {
      this.submitPost(false);
  }

  publishPost(): void {
      this.submitPost(true);
  }

  submitPost(isPublished: boolean): void {
      if (this.postForm.valid) {
          const postToSubmit: Post = { ...this.postForm.value, isPublished };
          this.postService.createPost(postToSubmit).subscribe({
              next: (response) => {
                  console.log(isPublished ? 'Post published' : 'Post saved as draft', response);
                  this.alertMessage = 'Successfully added the post!';
                  this.alertClass = 'alert-success';
                  this.resetForm();
                  if (isPublished) {
                      this.router.navigate(['/posts']);
                  } else {
                      this.router.navigate(['/drafts']);
                  }
              },
              error: (err) => {
                  console.error('Error submitting post:', err);
                  this.alertMessage = 'Something went wrong. Please try again.';
                  this.alertClass = 'alert-danger';
              }
          });
      }
  }

  resetForm(): void {
      this.postForm.reset({
          title: '',
          content: '',
          author: '',
          isPublished: false
      });
  }

  onSubmit(): void {
      if (this.postForm.valid) {
          console.log('Post form submitted');
      }
  }
}