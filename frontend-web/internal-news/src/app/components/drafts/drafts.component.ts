import { Component } from '@angular/core';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { EditPostComponent } from '../posts/edit-post/edit-post.component';

@Component({
  selector: 'app-drafts',
  imports: [EditPostComponent],
  template: `<div class="drafts-container">
    <h1>Drafts:</h1>
    <div class="drafts-grid">
      <!-- Use @for to iterate over drafts -->
      @for (draft of drafts; track $index) {
        <div class="draft-card" (click)="openModal(draft)">
          <h3>{{ draft.title }}</h3>
          <p class="content">{{ draft.content }}</p>
          <p class="author"><small>By {{ draft.author }}</small></p>
        </div>
      }
    </div>
  </div>
  
  <!-- Modal for the post form -->
  @if (isModalOpen) {
    <div class="modal-content">
      <button class="close-btn" (click)="closeModal()">×</button>
      <app-edit-post [draft]="selectedDraft" (formSubmitted)="onFormSubmit($event)"></app-edit-post>
    </div>
  }  `,
  styleUrls: ['./drafts.component.css']
})
export class DraftsComponent {
  drafts: Post[] = [];
  isModalOpen: boolean = false;
  selectedDraft: Post | null = null;

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.loadDrafts();
  }

  loadDrafts(): void {
    this.postService.getDrafts().subscribe((data) => {
      this.drafts = data;
    });
  }

  openModal(draft: Post): void {
    this.selectedDraft = draft;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedDraft = null;
  }

  onFormSubmit(updatedPost: Post): void {
    if (updatedPost.id) {
      this.postService.updatePost(updatedPost.id, updatedPost).subscribe(() => {
        this.loadDrafts();
        this.closeModal();
      });
    } else {
      console.error('Post ID is required for submission.');
    }
  }
}