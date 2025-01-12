import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';
import { PostService } from './post.service';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = 'http://localhost:8085/api/reviews';

  constructor(private http: HttpClient) {}

  approvePost(postId: number, comments: string): Observable<Review> {
    return this.http.patch<Review>(`${this.apiUrl}/approve/${postId}`, comments);
  }

  rejectPost(postId: number, comments: string): Observable<Review> {
    return this.http.patch<Review>(`${this.apiUrl}/decline/${postId}`, comments);
  }

  getReviewForPost(postId: number): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/post/${postId}`);
  }
}
