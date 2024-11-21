import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/post.model';

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

              <button type="submit" [disabled]="postForm.invalid">Submit</button>
          </form>
      </div>
  `,
  styleUrls: ['./post-form.component.css']
})
export class PostFormComponent implements OnInit {
  postForm: FormGroup;

  constructor(private fb: FormBuilder, private postService: PostService) {
      this.postForm = this.fb.group({
          title: ['', Validators.required],
          content: ['', Validators.required],
          author: ['', Validators.required],
          isPublished: [false]
      });
  }

  ngOnInit(): void {}

  onSubmit(): void {
      if (this.postForm.valid) {
          const newPost: Post = this.postForm.value;
          this.postService.createPost(newPost).subscribe({
              next: (response) => {
                  console.log('Post created:', response);
                  this.postForm.reset({
                      title: '',
                      content: '',
                      author: '',
                      isPublished: false
                  });
              },
              error: (err) => {
                  console.error('Error creating post:', err);
              }
          });
      }
  }
}