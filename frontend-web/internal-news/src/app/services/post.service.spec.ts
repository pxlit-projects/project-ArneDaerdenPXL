import { TestBed } from '@angular/core/testing';

import { PostService } from './post.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Post } from '../models/post.model';

describe('PostServiceService', () => {
  let service: PostService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('PostService', () => {
    let service: PostService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [PostService]
      });
      service = TestBed.inject(PostService);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should create a post', () => {
      const dummyPost: Post = { id: 1, title: 'Test Post', content: 'This is a test post', isDraft: false };

      service.createPost(dummyPost).subscribe(post => {
        expect(post).toEqual(dummyPost);
      });

      const req = httpMock.expectOne(service['apiUrl']);
      expect(req.request.method).toBe('POST');
      req.flush(dummyPost);
    });

    it('should retrieve posts', () => {
      const dummyPosts: Post[] = [
      { id: 1, title: "Test Post 1", content: "This is a test post 1", author: "Editor", status: "approved", isPublished: true, date: "2021-07-01T00:00:00.000Z" },
      { id: 1, title: "Test Post 2", content: "This is a test post 2", author: "Editor", status: "approved", isPublished: true, date: "2021-07-02T00:00:00.000Z" },
      ];

      service.getPosts().subscribe(posts => {
      expect(posts.length).toBe(2);
      expect(posts).toEqual(dummyPosts);
      });

      const req = httpMock.expectOne(service['apiUrl']);
      expect(req.request.method).toBe('GET');
      req.flush(dummyPosts);
    });

    it('should retrieve drafts', () => {
      const dummyDrafts: Post[] = [
      { id: 1, title: "Draft Post 1", content: "This is a draft post 1", author: "Editor", status: "declined", isPublished: false, date: "2021-07-01T00:00:00.000Z" },
      { id: 2, title: "Draft Post 2", content: "This is a draft post 2", author: "Editor", status: "declined", isPublished: false, date: "2021-07-02T00:00:00.000Z" }
      ];

      service.getDrafts().subscribe(drafts => {
      expect(drafts.length).toBe(2);
      expect(drafts).toEqual(dummyDrafts);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/drafts`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyDrafts);
    });
  });
});
