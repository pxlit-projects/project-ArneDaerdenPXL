import { Component } from '@angular/core';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/post.model';
import { EditPostComponent } from '../edit-post/edit-post.component';

@Component({
  selector: 'app-posts',
  imports: [EditPostComponent],
  template: `
    <div class="posts-container">
      <h1>Posts</h1>

      <!-- Filters Section -->

      <h2>Filter posts</h2>
      <div class="filters">
        <input type="text" (input)="onSearch($event)" placeholder="Search by title or content" />
        <input type="text" (input)="onAuthorSearch($event)" placeholder="Filter by author" />
        <input type="date" (change)="onDateFilter($event)" />
      </div>

      <div class="posts-grid">
        @if (filteredPosts.length === 0 && posts.length === 0) {
          <h3>No posts available</h3>
        } @else {
          @for (post of filteredPosts; track $index) {
            <div class="post-card" (click)="openPostModal(post)">
              <h3>{{ post.title }}</h3>
              <p>{{ post.content }}</p>
              <p class="author"><small>By {{ post.author }} on {{ post.date }}</small></p>
            </div>
          }
        }
      </div>
    </div>

    <!-- Modal for the post edit form -->
    @if (isPostModalOpen) {
      <div class="modal-content">
        <button class="close-btn" (click)="closePostModal()">×</button>
        <app-edit-post [draft]="selectedPost" (formSubmitted)="onPostFormSubmit($event)"></app-edit-post>
      </div>
    }
  `,
  styleUrls: ['./posts.component.css']
})
export class PostsComponent {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  isPostModalOpen: boolean = false;
  selectedPost: Post | null = null;
  authorFilter: string = '';
  dateFilter: string = '';

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.postService.getPosts().subscribe((data) => {
      this.posts = data;
      this.filteredPosts = data;
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
      });
    } else {
      console.error('Post ID is required for submission.');
    }
  }
}