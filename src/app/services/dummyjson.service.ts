import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentsResponse } from '../models/comment.interface';
import { PostsResponse } from '../models/post.interface';
import { UsersResponse } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class DummyjsonService {
  private readonly apiUrl = 'https://dummyjson.com';

  constructor(private http: HttpClient) {}

  searchUser(username: string): Observable<UsersResponse> {
    const params = new HttpParams()
      .set('key', 'username')
      .set('value', username);

    return this.http.get<UsersResponse>(`${this.apiUrl}/users/filter`, { params });
  }

  getPostsByUser(userId: number): Observable<PostsResponse> {
    return this.http.get<PostsResponse>(`${this.apiUrl}/posts/user/${userId}`);
  }

  getCommentsByPost(postId: number): Observable<CommentsResponse> {
    return this.http.get<CommentsResponse>(`${this.apiUrl}/comments/post/${postId}`);
  }
}
