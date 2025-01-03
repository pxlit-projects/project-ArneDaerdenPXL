import { Component } from '@angular/core';
import { PostService } from '../../services/post.service';
import { ReviewService } from '../../services/review.service';
import { Post } from '../../models/post.model';
import { EditPostComponent } from '../posts/edit-post/edit-post.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Review } from '../../models/review.model';

@Component({
  selector: 'app-drafts',
  imports: [EditPostComponent, FormsModule],
  template: `
    <div class="drafts-container">
      <h1>Drafts</h1>

      <!-- Show success alert if applicable -->
      @if(showAlertSuccess) {
        <div class="alert-box-success">{{ alertMessage }}</div>
      }

      <!-- Show error alert if applicable -->
      @if(showAlertError) {
        <div class="alert-box-error">{{ alertMessage }}</div>
      }

      <div class="drafts-grid">
        <!-- If there are no drafts, display a message -->
        @if (!drafts.length) {
          <p>No drafts available</p>
        }

        <!-- Loop through drafts and display each one -->
        @for (draft of drafts; track $index) {
          <div class="draft-card" style="position: relative;">
            <!-- Show the edit button only if the logged-in user is the author -->
            @if (loggedInUsername === draft.author) {
              <label class="edit-button" (click)="openModal(draft); $event.stopPropagation()">
                <i class="fas fa-pencil"></i>
              </label>
            }

            <h3>{{ draft.title }}</h3>
            <p class="content">{{ draft.content }}</p>
            <p class="author">
              <small>By {{ draft.author }} on {{ draft.date }}</small>
            </p>

            <!-- Comment input field -->
            <textarea [(ngModel)]="comments[draft.id]" [disabled]="draft.author === loggedInUsername" id="{{ draft.id }}" placeholder="Enter your comment"></textarea>

            <div class="action-buttons">
              <!-- Approve and Decline buttons for others (not the author) -->
              @if (isLoggedIn && loggedInUsername !== draft.author) {
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
              }
            </div>

            @if (draft.status === 'Approved') {
              <div class="approved-message">Post approved!</div>
            } @else {
              <div class="declined-message">Post declined!</div>
            }

            @if (loggedInUsername === draft.author) {
              <button class="draft-button" (click)="publishPost(draft.id); $event.stopPropagation()">Publish</button>
            }
          </div>
        }
      </div>

      <!-- Modal content for editing a draft -->
      @if(isModalOpen) {
        <div class="modal-content">
          <button class="close-btn" (click)="closeModal()">×</button>
          <app-edit-post
            [draft]="selectedDraft"
            (formSubmitted)="onFormSubmit($event)"
          ></app-edit-post>
        </div>
      }
    </div>
  `,
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
  isLoggedIn: boolean = false;
  loggedInUsername: string = '';

  constructor(private postService: PostService, private reviewService: ReviewService, private router: Router) {
    this.checkLoginStatus();
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadDrafts();
  }

  checkLoginStatus(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const role = localStorage.getItem('role');
        const username = localStorage.getItem('username');
        if (role === 'author' && username) {
          this.isLoggedIn = true;
          this.loggedInUsername = username;
        }
      } catch (e) {
        console.error('Invalid token:', e);
        this.isLoggedIn = false;
      }
    }
  }

  loadDrafts(): void {
    this.postService.getDrafts().subscribe((data) => {
      this.drafts = data;
      this.drafts.forEach((draft) => {
        this.loadComments(draft.id);
      });
    });
  }

  loadComments(postId: number): void {
    this.reviewService.getReviewForPost(postId).subscribe((comments) => {
      if (comments) {
        this.comments[postId] = comments.comments;
        console.log('Loaded Comment for post', postId, this.comments[postId]);
      } else {
        this.comments[postId] = '';
      }
    });
  }

  approveDraft(id: number, comment: string): void {
    if (this.loggedInUsername === this.drafts.find(d => d.id === id)?.author) {
      this.showAlertMessage('You cannot review your own draft.', 'error');
      return;
    }

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
      this.showAlertMessage('Draft approved successfully.', 'success');
      setTimeout(() => this.loadDrafts(), 100);
      this.loadDrafts();
    }
  }

  declineDraft(id: number, comment: string): void {
    if (this.loggedInUsername === this.drafts.find(d => d.id === id)?.author) {
      this.showAlertMessage('You cannot review your own draft.', 'error');
      return;
    }

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
      this.showAlertMessage('Draft declined successfully.', 'success');
      setTimeout(() => this.loadDrafts(), 100);
      this.loadDrafts();
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
          this.showAlertMessage('Draft published successfully.', 'success');
          setTimeout(() => this.router.navigate(['/posts']), 3000);
        });
      } else {
        this.showAlertMessage('Post must be approved before publishing.', 'error');
      }
    });
  }

  showAlertMessage(message: string, reason: string): void {
    if (reason === 'success') {
      this.alertMessage = message;
      this.showAlertSuccess = true;
      setTimeout(() => this.showAlertSuccess = false, 3000);
    } else {
      this.alertMessage = message;
      this.showAlertError = true;
      setTimeout(() => this.showAlertError = false, 3000);
    }
  }

  onFormSubmit(updatedPost: Post): void {
    if (updatedPost.id) {
      this.postService.updatePost(updatedPost.id, updatedPost).subscribe(() => {
        this.loadDrafts();
        this.closeModal();
        this.showAlertMessage('Draft updated successfully.', 'success');
      });
    } else {
      console.error('Draft ID is required for submission.');
      this.showAlertMessage('Draft ID is required for submission.', 'error');
    }
  }
}