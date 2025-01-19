import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostService } from '../../services/post.service';
import { ReviewService } from '../../services/review.service';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { Post } from '../../models/post.model';
import { DraftsComponent } from './drafts.component';

describe('DraftsComponent', () => {
  let component: DraftsComponent;
  let fixture: ComponentFixture<DraftsComponent>;
  let mockPostService: jasmine.SpyObj<PostService>;
  let mockReviewService: jasmine.SpyObj<ReviewService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockPostService = jasmine.createSpyObj('PostService', [
      'getDrafts',
      'updatePost',
      'publishPost',
      'getPostById',
    ]);
    mockReviewService = jasmine.createSpyObj('ReviewService', [
      'approvePost',
      'rejectPost',
      'getReviewForPost',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [DraftsComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: PostService, useValue: mockPostService },
        { provide: ReviewService, useValue: mockReviewService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DraftsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should check login status and redirect if not logged in', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    component.checkLoginStatus();
    expect(component.isLoggedIn).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should load drafts on initialization', () => {
    const mockDrafts: Post[] = [
      { id: 1, title: 'Draft 1', content: 'Content 1', author: 'user1', status: 'Declined', date: '2024-01-01', isPublished: false },
    ];
    mockPostService.getDrafts.and.returnValue(of(mockDrafts));

    component.ngOnInit();
    expect(mockPostService.getDrafts).toHaveBeenCalled();
    expect(component.drafts).toEqual(mockDrafts);
  });

  it('should approve a draft with a comment', () => {
    const mockDraft: Post = { id: 1, title: 'Draft 1', content: 'Content 1', author: 'user2', status: 'Declined', date: '2024-01-01', isPublished: false };
    component.drafts = [mockDraft];
    component.loggedInUsername = 'user3';
    const mockReview = { postId: 1, comments: 'Great post!', status: 'Approved' };
    mockReviewService.approvePost.and.returnValue(of(mockReview));
    mockPostService.updatePost.and.returnValue(of(mockDraft));

    component.approveDraft(1, 'Great post!');
    expect(mockReviewService.approvePost).toHaveBeenCalledWith(1, "author", 'Great post!');
    expect(mockPostService.updatePost).toHaveBeenCalled();
    expect(component.showAlertSuccess).toBeTrue();
  });

  it('should not allow a user to approve their own draft', () => {
    const mockDraft: Post = { id: 1, title: 'Draft 1', content: 'Content 1', author: 'user1', status: 'Declined', date: '2024-01-01', isPublished: false };
    component.drafts = [mockDraft];
    component.loggedInUsername = 'user1';

    component.approveDraft(1, 'Good job!');
    expect(component.showAlertError).toBeTrue();
    expect(component.alertMessage).toBe('You cannot review your own draft.');
  });

  it('should publish an approved draft', () => {
    const mockDraft: Post = { id: 1, title: 'Draft 1', content: 'Content 1', author: 'user1', status: 'Approved', date: '2024-01-01', isPublished: false };
    mockPostService.getPostById.and.returnValue(of(mockDraft));
    mockPostService.publishPost.and.returnValue(of(mockDraft));

    component.publishPost(1);
    expect(mockPostService.getPostById).toHaveBeenCalledWith(1);
    expect(mockPostService.publishPost).toHaveBeenCalledWith(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/posts']);
  });

  it('should show an error when publishing a non-approved draft', () => {
    const mockDraft: Post = { id: 1, title: 'Draft 1', content: 'Content 1', author: 'user1', status: 'Declined', date: '2024-01-01', isPublished: false };
    mockPostService.getPostById.and.returnValue(of(mockDraft));

    component.publishPost(1);
    expect(mockPostService.publishPost).not.toHaveBeenCalled();
    expect(component.showAlertError).toBeTrue();
    expect(component.alertMessage).toBe('Post must be approved before publishing.');
  });

  it('should open and close the modal', () => {
    const mockDraft: Post = { id: 1, title: 'Draft 1', content: 'Content 1', author: 'user1', status: 'Declined', date: '2024-01-01', isPublished: false };

    component.openModal(mockDraft);
    expect(component.isModalOpen).toBeTrue();
    expect(component.selectedDraft).toEqual(mockDraft);

    component.closeModal();
    expect(component.isModalOpen).toBeFalse();
    expect(component.selectedDraft).toBeNull();
  });

  it('should show a success alert message', () => {
    component.showAlertMessage('Test success message', 'success');
    expect(component.alertMessage).toBe('Test success message');
    expect(component.showAlertSuccess).toBeTrue();

    setTimeout(() => {
      expect(component.showAlertSuccess).toBeFalse();
    }, 3000);
  });

  it('should show an error alert message', () => {
    component.showAlertMessage('Test error message', 'error');
    expect(component.alertMessage).toBe('Test error message');
    expect(component.showAlertError).toBeTrue();

    setTimeout(() => {
      expect(component.showAlertError).toBeFalse();
    }, 3000);
  });
});