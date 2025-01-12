import type { Comment } from './comment.model';

describe('Comment', () => {
  it('should create an instance', () => {
    expect(new Comment()).toBeTruthy();
  });

  describe('Comment', () => {
    it('should create an instance', () => {
      const comment: Comment = {
        id: 1,
        postId: 1,
        username: 'testuser',
        content: 'This is a test comment',
        createdAt: '2023-10-01T00:00:00Z'
      };
      expect(comment).toBeTruthy();
    });

    it('should have correct properties', () => {
      const comment: Comment = {
        id: 1,
        postId: 1,
        username: 'testuser',
        content: 'This is a test comment',
        createdAt: '2023-10-01T00:00:00Z'
      };
      expect(comment.id).toBe(1);
      expect(comment.postId).toBe(1);
      expect(comment.username).toBe('testuser');
      expect(comment.content).toBe('This is a test comment');
      expect(comment.createdAt).toBe('2023-10-01T00:00:00Z');
    });
  });
});
