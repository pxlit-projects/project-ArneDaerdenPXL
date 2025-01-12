import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostFormComponent } from './post-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/post.model';

describe('PostFormComponent', () => {
  let component: PostFormComponent;
  let fixture: ComponentFixture<PostFormComponent>;
  let postService: jasmine.SpyObj<PostService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const postServiceSpy = jasmine.createSpyObj('PostService', ['createPost']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PostFormComponent],
      providers: [
        { provide: PostService, useValue: postServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostFormComponent);
    component = fixture.componentInstance;
    postService = TestBed.inject(PostService) as jasmine.SpyObj<PostService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize the form with default values', () => {
      expect(component.postForm.value).toEqual({
        title: '',
        content: '',
        isPublished: false
      });
    });

    it('should redirect to login if not logged in', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null); // Simulate no token
      component.checkLoginStatus();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should set loggedInUsername if token and role are valid', () => {
      spyOn(localStorage, 'getItem').and.callFake((key: string) => {
        if (key === 'token') return 'valid-token';
        if (key === 'role') return 'author';
        if (key === 'username') return 'testUser';
        return null;
      });

      component.checkLoginStatus();
      expect(component.isLoggedIn).toBeTrue();
      expect(component.loggedInUsername).toBe('testUser');
    });
  });

  describe('Form Submission', () => {
    const mockPost: Post = {
      id: 1,
      title: 'Test Title',
      content: 'Test Content',
      author: 'testUser',
      isPublished: false,
      status: 'draft',
      date: new Date().toString()
    };

    beforeEach(() => {
      spyOn(localStorage, 'getItem').and.callFake((key: string) => {
        if (key === 'username') return 'testUser';
        if (key === 'role') return 'author';
        return null;
      });
      component.checkLoginStatus();
    });

    it('should not submit an invalid form', () => {
      component.postForm.controls['title'].setValue('');
      component.postForm.controls['content'].setValue('');
      component.submitPost(false);

      expect(postService.createPost).not.toHaveBeenCalled();
    });

    it('should submit a valid draft', () => {
      component.postForm.controls['title'].setValue('Test Title');
      component.postForm.controls['content'].setValue('Test Content');
      postService.createPost.and.returnValue(of(mockPost));

      component.saveDraft();

      expect(postService.createPost).toHaveBeenCalledWith(jasmine.objectContaining({
        title: 'Test Title',
        content: 'Test Content',
        isPublished: false,
        author: 'testUser'
      }));
      expect(component.showAlertSuccess).toBeTrue();
      expect(component.alertMessage).toBe('Post added successfully.');
    });

    it('should publish a valid post', () => {
      component.postForm.controls['title'].setValue('Test Title');
      component.postForm.controls['content'].setValue('Test Content');
      postService.createPost.and.returnValue(of(mockPost));

      component.publishPost();

      expect(postService.createPost).toHaveBeenCalledWith(jasmine.objectContaining({
        title: 'Test Title',
        content: 'Test Content',
        isPublished: true,
        author: 'testUser'
      }));
      expect(component.showAlertSuccess).toBeTrue();
      expect(component.alertMessage).toBe('Post added successfully.');
      expect(router.navigate).toHaveBeenCalledWith(['/posts']);
    });

    it('should show an error alert on failed submission', () => {
      component.postForm.controls['title'].setValue('Test Title');
      component.postForm.controls['content'].setValue('Test Content');
      postService.createPost.and.returnValue(throwError(() => new Error('Error')));

      component.submitPost(false);

      expect(component.showAlertError).toBeTrue();
      expect(component.alertMessage).toBe('Error adding post.');
    });
  });

  describe('Utility Methods', () => {
    it('should reset the form', () => {
      component.postForm.controls['title'].setValue('Test Title');
      component.postForm.controls['content'].setValue('Test Content');

      component.resetForm();

      expect(component.postForm.value).toEqual({
        title: '',
        content: '',
        isPublished: false
      });
    });

    it('should show a success alert message', () => {
      component.showAlertMessage('Success', 'success');

      expect(component.showAlertSuccess).toBeTrue();
      expect(component.alertMessage).toBe('Success');
    });

    it('should show an error alert message', () => {
      component.showAlertMessage('Error', 'error');

      expect(component.showAlertError).toBeTrue();
      expect(component.alertMessage).toBe('Error');
    });
  });
});