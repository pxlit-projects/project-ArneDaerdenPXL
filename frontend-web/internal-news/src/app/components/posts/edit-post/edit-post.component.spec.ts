import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPostComponent } from './edit-post.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Post } from '../../../models/post.model';
import { By } from '@angular/platform-browser';

describe('EditPostComponent', () => {
  let component: EditPostComponent;
  let fixture: ComponentFixture<EditPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('EditPostComponent', () => {
    let component: EditPostComponent;
    let fixture: ComponentFixture<EditPostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ReactiveFormsModule],
        declarations: [EditPostComponent]
      })
      .compileComponents();

      fixture = TestBed.createComponent(EditPostComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize the form with draft values', () => {
      const draft: Post = { id: 1, title: 'Test Title', content: 'Test Content', author: 'Test Author', isPublished: false, status: 'Declined', date: new Date().toString() };
      component.draft = draft;
      component.ngOnInit();
      expect(component.editForm.value).toEqual(draft);
    });

    it('should emit formSubmitted event with updated post on valid form submission', () => {
      const draft: Post = { id: 1, title: 'Test Title', content: 'Test Content', author: 'Test Author', isPublished: false, status: 'Declined', date: new Date().toString() };
      component.draft = draft;
      component.ngOnInit();

      component.editForm.setValue({ title: 'Updated Title', content: 'Updated Content', author: 'Updated Author', isPublished: true });

      spyOn(component.formSubmitted, 'emit');
      component.onSubmit();

      expect(component.formSubmitted.emit).toHaveBeenCalledWith({
        id: 1,
        title: 'Updated Title',
        content: 'Updated Content',
        author: 'Updated Author',
        isPublished: true,
        status: 'Declined',
        date: draft.date,
      });
    });

    it('should not emit formSubmitted event if form is invalid', () => {
      component.editForm.setValue({ title: '', content: '', author: '', isPublished: false });

      spyOn(component.formSubmitted, 'emit');
      component.onSubmit();

      expect(component.formSubmitted.emit).not.toHaveBeenCalled();
    });

    it('should log error if draft ID is missing on form submission', () => {
      component.draft = { title: 'Test Title', content: 'Test Content', author: 'Test Author', isPublished: false } as Post;
      component.ngOnInit();

      spyOn(console, 'error');
      component.onSubmit();

      expect(console.error).toHaveBeenCalledWith('Draft ID is missing');
    });
  });
});
