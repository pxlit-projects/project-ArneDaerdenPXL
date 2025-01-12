import { TestBed } from '@angular/core/testing';

import { ReviewService } from './review.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Review } from '../models/review.model';

describe('ReviewService', () => {
  let service: ReviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('ReviewService', () => {
    let service: ReviewService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [ReviewService]
      });
      service = TestBed.inject(ReviewService);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should approve a post', () => {
      const postId = 1;
      const comments = 'Approved';
      const mockReview: Review = { id: 1, postId: postId, comments: comments, status: 'approved' };

      service.approvePost(postId, comments).subscribe(review => {
        expect(review).toEqual(mockReview);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/approve/${postId}`);
      expect(req.request.method).toBe('PATCH');
      req.flush(mockReview);
    });

    it('should reject a post', () => {
      const postId = 1;
      const comments = 'Rejected';
      const mockReview: Review = { id: 1, postId: postId, comments: comments, status: 'declined' };

      service.rejectPost(postId, comments).subscribe(review => {
        expect(review).toEqual(mockReview);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/decline/${postId}`);
      expect(req.request.method).toBe('PATCH');
      req.flush(mockReview);
    });

    it('should get review for a post', () => {
      const postId = 1;
      const mockReview: Review = { id: 1, postId: postId, comments: 'Some comments', status: 'declined' };

      service.getReviewForPost(postId).subscribe(review => {
        expect(review).toEqual(mockReview);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/post/${postId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockReview);
    });
  });
});
