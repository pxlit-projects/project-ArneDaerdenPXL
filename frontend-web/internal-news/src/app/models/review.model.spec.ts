import type { Review } from './review.model';

describe('Review', () => {
  it('should create an instance', () => {
    const review: Review = {
      postId: 1,
      status: 'Declined',
      comments: 'This is a comment'
    };
    expect(review).toBeTruthy();
  });

  describe('Review', () => {
    it('should create an instance', () => {
      const review: Review = {
        postId: 1,
        status: 'Declined',
        comments: 'This is a comment'
      };
      expect(review).toBeTruthy();
    });

    it('should have a postId', () => {
      const review: Review = {
        postId: 1,
        status: 'Declined',
        comments: 'This is a comment'
      };
      expect(review.postId).toBe(1);
    });

    it('should have a status', () => {
      const review: Review = {
        postId: 1,
        status: 'pending',
        comments: 'This is a comment'
      };
      expect(review.status).toBe('pending');
    });

    it('should have comments', () => {
      const review: Review = {
        postId: 1,
        status: 'pending',
        comments: 'This is a comment'
      };
      expect(review.comments).toBe('This is a comment');
    });
  });
});
