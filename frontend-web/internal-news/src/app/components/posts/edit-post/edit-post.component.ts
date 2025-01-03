import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/post.model';

@Component({
  selector: 'app-edit-post',
  imports: [ReactiveFormsModule],
  template: `<form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="form-container">
  <div class="form-group">
    <label for="title">Title</label>
    <input id="title" formControlName="title" class="form-control" />
  </div>

  <div class="form-group">
    <label for="content">Content</label>
    <textarea id="content" formControlName="content" class="form-control"></textarea>
  </div>

  <!-- Removed the Author field as it is now taken from the logged-in user -->
  <!-- <div class="form-group">
    <label for="author">Author</label>
    <input id="author" formControlName="author" class="form-control" />
  </div> -->

  <button type="submit" class="submit-btn" [disabled]="editForm.invalid">Update Post</button>
</form>`,
  styleUrls: ['./edit-post.component.css']
})
export class EditPostComponent implements OnInit {
  @Input() draft: Post | null = null;
  @Output() formSubmitted = new EventEmitter<Post>();
  editForm: FormGroup;

  constructor(private fb: FormBuilder, private postService: PostService) {
    this.editForm = this.fb.group({
        title: ['', Validators.required],
        content: ['', Validators.required],
        author: ['', Validators.required],
        isPublished: [false]
    });
  }

  ngOnInit(): void {
    if (this.draft) {
      this.editForm.patchValue(this.draft);
    }
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      if (this.draft && this.draft.id) {
        const updatedPost = { ...this.draft, ...this.editForm.value };
        this.formSubmitted.emit(updatedPost);
      } else {
        console.error('Draft ID is missing');
      }
    } else {
      console.log('Form is invalid, cannot submit');
    }
  }
}