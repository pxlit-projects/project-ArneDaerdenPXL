import { Component } from '@angular/core';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/post.model';
import { EditPostComponent } from '../edit-post/edit-post.component';

@Component({
  selector: 'app-posts',
  imports: [EditPostComponent],
  template: `<div class="posts-container">
    <h1>Posts</h1>
    <input type="text" (input)="onSearch($event)" placeholder="Search posts" />
    <div class="posts-grid">
      <!-- Use @for to iterate over filteredPosts -->
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
  }`,
  styleUrl: './posts.component.css'
})

export class PostsComponent {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  isPostModalOpen: boolean = false;
  selectedPost: Post | null = null;

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.postService.getPosts().subscribe((data) => {
      this.posts = data;
      this.filteredPosts = data;
    });
  }

  onSearch(event: Event): void {
    const keyword = (event.target as HTMLInputElement).value;
    this.filteredPosts = this.posts.filter((post) =>
      post.title.toLowerCase().includes(keyword.toLowerCase()) || post.content.toLowerCase().includes(keyword.toLowerCase())
    );
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