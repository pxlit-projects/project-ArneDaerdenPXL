import { TestBed } from '@angular/core/testing';

import { CommentService } from './comment.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Comment } from '../models/comment.model';

describe('CommentService', () => {
  let service: CommentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('CommentService', () => {
    let service: CommentService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [CommentService]
      });
      service = TestBed.inject(CommentService);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should fetch comments for a given post ID', () => {
      const dummyComments: Comment[] = [
        { id: 1, postId: 1, content: 'Test Comment 1', createdAt: '2021-01-01', username: 'testuser' },
        { id: 2, postId: 1, content: 'Test Comment 2', createdAt: '2021-01-02', username: 'testuser' }
      ];

      service.getComments(1).subscribe(comments => {
        expect(comments.length).toBe(2);
        expect(comments).toEqual(dummyComments);
      });

      const req = httpMock.expectOne('http://localhost:8085/api/comments/post/1');
      expect(req.request.method).toBe('GET');
      req.flush(dummyComments);
    });

    it('should add a new comment', () => {
      const newComment: Comment = { id: 3, postId: 1, content: 'New Comment', createdAt: '2021-01-03', username: 'newuser' };

      service.addComment(newComment).subscribe(comment => {
      expect(comment).toEqual(newComment);
      });

      const req = httpMock.expectOne('http://localhost:8085/api/comments');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newComment);
      req.flush(newComment);
    });

    it('should update an existing comment', () => {
      const updatedComment: Comment = { id: 1, postId: 1, content: 'Updated Comment', createdAt: '2021-01-01', username: 'testuser' };

      service.updateComment(updatedComment).subscribe(comment => {
      expect(comment).toEqual(updatedComment);
      });

      const req = httpMock.expectOne(`http://localhost:8085/api/comments/${updatedComment.id}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updatedComment);
      req.flush(updatedComment);
    });

    it('should delete a comment', () => {
      const commentId = 1;

      service.deleteComment(commentId).subscribe(response => {
      expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`http://localhost:8085/api/comments/${commentId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
