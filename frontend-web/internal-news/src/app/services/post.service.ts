import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({
    providedIn: 'root'
  })
export class PostService {
    private apiUrl = 'http://localhost:8081/api/posts';

    constructor(private http: HttpClient) { }

    createPost(post: Post): Observable<Post> {
        return this.http.post<Post>(this.apiUrl, post);
    }

    getDrafts(): Observable<Post[]> {
        return this.http.get<Post[]>(`${this.apiUrl}/drafts`);
    }

    getPostById(id: number): Observable<Post[]> {
        return this.http.get<Post[]>(`${this.apiUrl}/${id}`);
    }

    updatePost(postId: number, updatedPost: Post): Observable<Post> {
      return this.http.put<Post>(`${this.apiUrl}/${postId}`, updatedPost);
    }
}
