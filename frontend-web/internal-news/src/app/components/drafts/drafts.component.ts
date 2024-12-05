import { Component } from '@angular/core';
import { PostService } from '../../services/post.service';
import { ReviewService } from '../../services/review.service';
import { Post } from '../../models/post.model';
import { EditPostComponent } from '../posts/edit-post/edit-post.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-drafts',
  imports: [EditPostComponent, FormsModule],
  template: `<div class="drafts-container">
    <h1>Drafts</h1>
    @if(showAlertSuccess) {
      <div class="alert-box-success">{{ alertMessage }}</div>
    }
    @if(showAlertError) {
      <div class="alert-box-error">{{ alertMessage }}</div>
    }
    <div class="drafts-grid">
      <!-- Show message if no drafts are available -->
      @if (!drafts.length) {
        <p>No drafts available</p>
      }

      <!-- Display draft cards -->
      @for (draft of drafts; ; track $index) {
        <div class="draft-card">
          <h3>{{ draft.title }}</h3>
          <p class="content">{{ draft.content }}</p>
          <p class="author">
            <small>By {{ draft.author }} on {{ draft.date }}</small>
          </p>
          <textarea [(ngModel)]="comments[draft.id]" id="{{ draft.id }}" placeholder="Enter your comment"></textarea>
          <div class="action-buttons">
            <button
              class="approve-button"
              (click)="approveDraft(draft.id, comments[draft.id]); $event.stopPropagation()"
            >
              Approve
            </button>
            <button
              class="decline-button"
              (click)="declineDraft(draft.id, comments[draft.id]); $event.stopPropagation()"
            >
              Decline
            </button>
          </div>
          <button class="draft-button" (click)="publishPost(draft.id); $event.stopPropagation()">Publish</button>
        </div>
      }
    </div>
    
    <!-- Modal for editing drafts -->
    @if(isModalOpen) {
      <div class="modal-content">
        <button class="close-btn" (click)="closeModal()">×</button>
        <app-edit-post
          [draft]="selectedDraft"
          (formSubmitted)="onFormSubmit($event)"
        ></app-edit-post>
      </div>
    }
  </div>`,
  styleUrls: ['./drafts.component.css'],
})
export class DraftsComponent {
  comments: { [key: number]: string } = {};
  drafts: Post[] = [];
  isModalOpen: boolean = false;
  selectedDraft: Post | null = null;
  showAlertSuccess: boolean = false;
  showAlertError: boolean = false;
  alertMessage: string = '';

  constructor(private postService: PostService, private reviewService: ReviewService, private router: Router) {}

  ngOnInit(): void {
    this.loadDrafts();
  }

  loadDrafts(): void {
    this.postService.getDrafts().subscribe((data) => {
      this.drafts = data;
    });
  }

  approveDraft(id: number, comment: string): void {
    if (comment !== '') {
      const draftToUpdate = this.drafts.find((draft) => draft.id === id);
      if (draftToUpdate) {
        draftToUpdate.status = 'Approved';

        forkJoin([
          this.reviewService.approvePost(id, comment),
          this.postService.updatePost(draftToUpdate.id, draftToUpdate),
        ]).subscribe(() => {
          this.drafts = this.drafts.filter((draft) => draft.id !== id);
          delete this.comments[id];
        });
      }
      this.showAlertMessage('Draft approved successfully.', "success");
      setTimeout(() => {
        this.loadDrafts();
      }, 50);
    }
  }

  declineDraft(id: number, comment: string): void {
    console.log('Declining draft:', id, comment);
    if (comment !== '') {
      const draftToUpdate = this.drafts.find((draft) => draft.id === id);
      if (draftToUpdate) {
        draftToUpdate.status = 'Declined';

        forkJoin([
          this.reviewService.rejectPost(id, comment),
          this.postService.updatePost(draftToUpdate.id, draftToUpdate),
        ]).subscribe(() => {
          this.drafts = this.drafts.filter((draft) => draft.id !== id);
          delete this.comments[id];
        });
      }
      this.showAlertMessage('Draft declined successfully.', "success");
      setTimeout(() => {
        this.loadDrafts();
      }, 10);
    }
  }  

  openModal(draft: Post): void {
    this.selectedDraft = draft;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedDraft = null;
  }

  publishPost(id: number): void {
    this.postService.getPostById(id).subscribe((post: Post) => {
      if (post.status === 'Approved') {
        this.postService.publishPost(id).subscribe(() => {
          this.drafts = this.drafts.filter((draft) => draft.id !== id);
          this.showAlertMessage('Draft published successfully.', "success");
          setTimeout(() => {
            this.router.navigate(['/posts']);
          }, 5000);
        });
      } else {
        this.showAlertMessage('Post must be approved before publishing.', "error");
      }
    });
  }
  
  showAlertMessage(message: string, reason: string): void {
    if(reason === "success") {
      console.log(message);
      this.alertMessage = message;
      this.showAlertSuccess = true;
      setTimeout(() => {
        this.showAlertSuccess = false;
      }, 5000);
    } else {
        console.error(message);
        this.alertMessage = message;
        this.showAlertError = true;
        setTimeout(() => {
            this.showAlertError = false;
        }, 5000);
    }
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