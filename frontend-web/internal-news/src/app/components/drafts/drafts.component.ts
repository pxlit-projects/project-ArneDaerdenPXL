import { Component } from '@angular/core';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { EditPostComponent } from '../posts/edit-post/edit-post.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-drafts',
  imports: [EditPostComponent],
  template: `<div class="drafts-container">
    <h1>Drafts</h1>
    <div class="drafts-grid">
      <!-- Use @for to iterate over drafts -->
      @if (drafts.length === 0) {
        <h3>No drafts available</h3>
      } @else {
        @for (draft of drafts; track $index) {
          <div class="draft-card" (click)="openModal(draft)">
            <h3>{{ draft.title }}</h3>
            <p class="content">{{ draft.content }}</p>
            <button class="draft-button" (click)="publishPost(draft.id); $event.stopPropagation()">Publish</button>
            <p class="author"><small>By {{ draft.author }} on {{ draft.date }}</small></p>
          </div>
        }
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

  constructor(private postService: PostService, private router: Router) {}

  ngOnInit(): void {
    this.loadDrafts();
  }

  loadDrafts(): void {
    this.postService.getDrafts().subscribe((data) => {
      this.drafts = data;
    });
  }

  publishPost(id: number): void {
    this.postService.publishPost(id).subscribe(() => {
        this.drafts = this.drafts.filter((draft) => draft.id !== id);
    });
    setTimeout(() => {
      this.router.navigate(['/posts']);
    }, 50);
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
      console.error('Draft ID is required for submission.');
    }
  }
}