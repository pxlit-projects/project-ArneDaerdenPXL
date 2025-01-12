import { Component } from '@angular/core';
import { PostService } from '../../../services/post.service';
import { CommentService } from '../../../services/comment.service';
import { Post } from '../../../models/post.model';
import { Comment } from '../../../models/comment.model';
import { EditPostComponent } from '../edit-post/edit-post.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-posts',
  imports: [EditPostComponent, FormsModule],
  template: `
    <div class="posts-container">
      <h1>Posts</h1>

      <h2>Filter posts</h2>
      <div class="filters">
        <input type="text" (input)="onSearch($event)" placeholder="Search by title or content" />
        <input type="text" (input)="onAuthorSearch($event)" placeholder="Filter by author" />
        <input type="date" (change)="onDateFilter($event)" />
      </div>
      
      @if(showAlertSuccess) {
        <div class="alert-box-success">{{ alertMessage }}</div>
      }

      @if(showAlertError) {
        <div class="alert-box-error">{{ alertMessage }}</div>
      }

      <div class="posts-grid">
        @if (filteredPosts.length === 0 && posts.length === 0) {
          <h3>No posts available</h3>
        } @else {
          @for (post of filteredPosts; track $index) {
            <div class="post-card" style="position: relative;">
              @if (isLoggedIn && post.author === loggedInUsername) {
                <label class="edit-button" (click)="openPostModal(post); $event.stopPropagation()">
                  <i class="fas fa-pencil"></i>
                </label>
              }
              <h3>{{ post.title }}</h3>
              <p>{{ post.content }}</p>
              <p class="author"><small>By {{ post.author }} on {{ post.date }}</small></p>

              <!-- Comments Section -->
              <div class="comments-section">
                <h4>Comments</h4>
                @if ((comments[post.id] || []).length > 0) {
                  <ul>
                    @for (comment of comments[post.id]; track $index) {
                      <li>
                        <div class="comment-header">
                          <strong>{{ comment.username }}:</strong>
                          @if (comment.username === loggedInUsername) {
                            <div class="comment-actions">
                              <i class="fas fa-pencil" (click)="openCommentModal(comment, post.id)"></i>
                              @if (comment.id !== null) {
                                <i class="fas fa-times" (click)="deleteComment(comment.id , post.id)"></i>
                              }
                            </div>
                          }
                        </div>
                        <p>{{ comment.content }}</p>
                      </li>
                    }
                  </ul>
                } @else {
                  <p>No comments yet. Be the first to comment!</p>
                }

                <div class="add-comment">
                  <input
                    type="text"
                    [(ngModel)]="newComments[post.id]"
                    placeholder="Add a comment... "
                    (keydown.enter)="addComment(post.id)"
                  />
                  <button (click)="addComment(post.id)">Post</button>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>

    @if (isPostModalOpen) {
      <div class="modal-content">
        <button class="close-btn" (click)="closePostModal()">×</button>
        <app-edit-post [draft]="selectedPost" (formSubmitted)="onPostFormSubmit($event)"></app-edit-post>
      </div>
    }
    @if (isCommentModalOpen) {
      <div class="modal-content">
        <button class="close-btn" (click)="closeCommentModal()">×</button>
        <h3>Edit Comment</h3>
        <p>Max 255 characters!</p>
        @if(showAlertFormError) {
          <div class="alert-box-error">{{ alertMessage }}</div>
        }
        @if (editingComment) {
          <textarea [(ngModel)]="editingComment.content"  class="comment-textarea"></textarea>
        }
        <p>Characters: {{ this.editingComment?.content?.length }}</p>
        <button (click)="submitCommentEdit()"  class="save-btn">Save</button>
      </div>
    }
  `,
  styleUrls: ['./posts.component.css']
})
export class PostsComponent {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  comments: { [key: number]: Comment[] } = {};
  newComments: { [key: number]: string } = {};
  isPostModalOpen: boolean = false;
  selectedPost: Post | null = null;
  authorFilter: string = '';
  dateFilter: string = '';
  isLoggedIn: boolean = false;
  loggedInUsername: string = '';
  isCommentModalOpen: boolean = false;
  editingComment: Comment | null = null;
  editingPostId: number | null = null;
  showAlertSuccess: boolean = false;
  showAlertError: boolean = false;
  showAlertFormError: boolean = false;
  alertMessage: string = '';

  constructor(
    private postService: PostService,
    private commentService: CommentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.postService.getPosts().subscribe((data) => {
      this.posts = data;
      this.filteredPosts = data;

      this.posts.forEach((post) => {
        this.loadComments(post.id);
      });
    });
    this.checkLoginStatus();
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    }
  }

  checkLoginStatus(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const role = localStorage.getItem('role');
        const username = localStorage.getItem('username');
        if (token) {
          this.isLoggedIn = true;
          if (username) {
            this.loggedInUsername = username;
          }
        }
      } catch (e) {
        console.error('Invalid token:', e);
        this.isLoggedIn = false;
      }
    }
  }

  loadComments(postId: number): void {
    this.commentService.getComments(postId).subscribe((data) => {
      console.log('Loaded comments for post', postId, data);
      this.comments[postId] = data;
    });
  }

  addComment(postId: number): void {
    const commentText = this.newComments[postId];
    if (!commentText) return;
    if (commentText.length > 255) {
      this.showAlertMessage('Comment cannot exceed 255 characters.', 'error');
      return
    }

    const newComment: Comment = {
      id: null,
      postId,
      username: this.loggedInUsername,
      content: commentText,
      createdAt: new Date().toISOString()
    };

    this.commentService.addComment(newComment).subscribe((savedComment) => {
      this.comments[postId] = [...(this.comments[postId] || []), savedComment];
      this.newComments[postId] = '';
    });
  }

  onSearch(event: Event): void {
    const keyword = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters({ keyword });
  }

  onAuthorSearch(event: Event): void {
    this.authorFilter = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters();
  }

  onDateFilter(event: Event): void {
    this.dateFilter = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  applyFilters({ keyword }: { keyword?: string } = {}): void {
    this.filteredPosts = this.posts.filter((post) => {
      const matchesKeyword =
        !keyword || post.title.toLowerCase().includes(keyword) || post.content.toLowerCase().includes(keyword);
      const matchesAuthor = !this.authorFilter || post.author.toLowerCase().includes(this.authorFilter);
      const matchesDate = !this.dateFilter || post.date === this.dateFilter;

      return matchesKeyword && matchesAuthor && matchesDate;
    });
  }

  openPostModal(post: Post): void {
    this.selectedPost = post;
    this.isPostModalOpen = true;
  }

  closePostModal(): void {
    this.isPostModalOpen = false;
    this.selectedPost = null;
  }

  onPostFormSubmit(updatedPost: Post): void {
    if (updatedPost.id) {
      this.postService.updatePost(updatedPost.id, updatedPost).subscribe(() => {
        this.ngOnInit();
        this.closePostModal();
        this.showAlertMessage('Post updated successfully.', 'success');
      });
    } else {
      console.error('Post ID is required for submission.');
      this.showAlertMessage('Post ID is required for submission.', 'error');
    }
  }

  openCommentModal(comment: Comment, postId: number): void {
    this.editingComment = { ...comment };
    this.editingPostId = postId;
    this.isCommentModalOpen = true;
  }

  closeCommentModal(): void {
    this.isCommentModalOpen = false;
    this.editingComment = null;
    this.editingPostId = null;
  }

  submitCommentEdit(): void {
    
    if (this.editingComment && this.editingPostId !== null) {
      if (this.editingComment?.content.length > 255) {
        this.showAlertFormMessage('Comment cannot exceed 255 characters.', 'error');
        return
      }
      this.commentService.updateComment(this.editingComment).subscribe(() => {
        this.ngOnInit();
        this.closeCommentModal();
        this.showAlertMessage('Comment updated successfully.', 'success');
      });
    } else {
      console.error('Comment ID is required for submission.');
      this.showAlertMessage('Comment ID is required for submission.', 'error');
    }
  }
  
  deleteComment(commentId: number, postId: number): void {
    this.commentService.deleteComment(commentId).subscribe(() => {
      this.comments[postId] = this.comments[postId].filter((c) => c.id !== commentId);
    });
    this.showAlertMessage('Comment deleted successfully.', 'success');
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

  showAlertFormMessage(message: string, reason: string): void {
    if (reason === 'error') {
      this.alertMessage = message;
      this.showAlertFormError = true;
      setTimeout(() => this.showAlertFormError = false, 3000);
    }
  }
}