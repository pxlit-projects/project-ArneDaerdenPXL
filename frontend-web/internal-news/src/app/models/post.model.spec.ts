import type { Post } from './post.model';

describe('Post', () => {
  it('should have correct properties', () => {
    const post: Post = {
      id: 1,
      title: 'Test Title',
      content: 'Test Content',
      author: 'Test Author',
      status: 'Declined',
      isPublished: false,
      date: '2023-10-01'
    };
    expect(post).toBeTruthy();
  });

  describe('Post', () => {
    it('should create an instance', () => {
      const post: Post = {
        id: 1,
        title: 'Test Title',
        content: 'Test Content',
        author: 'Test Author',
        status: 'Declined',
        isPublished: false,
        date: '2023-10-01'
      };
      expect(post).toBeTruthy();
    });

    it('should have correct properties', () => {
      const post: Post = {
        id: 1,
        title: 'Test Title',
        content: 'Test Content',
        author: 'Test Author',
        status: 'Declined',
        isPublished: false,
        date: '2023-10-01'
      };
      expect(post.id).toBe(1);
      expect(post.title).toBe('Test Title');
      expect(post.content).toBe('Test Content');
      expect(post.author).toBe('Test Author');
      expect(post.status).toBe('Declined');
      expect(post.isPublished).toBe(false);
      expect(post.date).toBe('2023-10-01');
    });
  });
});
