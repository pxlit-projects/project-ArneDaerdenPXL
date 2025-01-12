import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsComponent } from './posts.component';
import { By } from '@angular/platform-browser';
import { PostService } from '../../../services/post.service';
import { CommentService } from '../../../services/comment.service';
import { Router } from '@angular/router';
import { Post } from '../../../models/post.model';
import { of } from 'rxjs';
import { Comment } from '../../../models/comment.model';

describe('PostsComponent', () => {
  let component: PostsComponent;
  let fixture: ComponentFixture<PostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('PostsComponent', () => {
    let component: PostsComponent;
    let fixture: ComponentFixture<PostsComponent>;
    let postServiceStub: Partial<PostService>;
    let commentServiceStub: Partial<CommentService>;
    let routerStub: Partial<Router>;

    beforeEach(async () => {
      postServiceStub = {
        getPosts: () => of([]),
        updatePost: (postId: number, updatedPost: Post) => of(updatedPost)
      };

      commentServiceStub = {
        getComments: () => of([]),
        addComment: (comment: Comment) => of(comment),
        updateComment: (comment: Comment) => of(comment),
        deleteComment: (commentId: number) => of(void 0)
      };

      routerStub = {
        navigate: () => Promise.resolve(true)
      };

      await TestBed.configureTestingModule({
        imports: [PostsComponent],
        providers: [
          { provide: PostService, useValue: postServiceStub },
          { provide: CommentService, useValue: commentServiceStub },
          { provide: Router, useValue: routerStub }
        ]
      })
      .compileComponents();

      fixture = TestBed.createComponent(PostsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render posts container', () => {
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('.posts-container')).toBeTruthy();
    });

    it('should call postService.getPosts on init', () => {
      const postService = TestBed.inject(PostService);
      spyOn(postService, 'getPosts').and.callThrough();
      component.ngOnInit();
      expect(postService.getPosts).toHaveBeenCalled();
    });

    it('should filter posts based on search input', () => {
      component.posts = [
        { id: 1, title: 'Test Post 1', content: 'Content 1', author: 'Author 1', date: '2023-01-01', status: 'Declined', isPublished: false },
        { id: 2, title: 'Test Post 2', content: 'Content 2', author: 'Author 2', date: '2023-01-02', status: 'Approved', isPublished: true }
      ];
      component.onSearch({ target: { value: 'Test Post 1' } } as any);
      expect(component.filteredPosts.length).toBe(1);
      expect(component.filteredPosts[0].title).toBe('Test Post 1');
    });

    it('should show alert message on comment exceeding 255 characters', () => {
      component.newComments[1] = 'a'.repeat(256);
      component.addComment(1);
      expect(component.showAlertError).toBeTrue();
      expect(component.alertMessage).toBe('Comment cannot exceed 255 characters.');
    });
  });
});
