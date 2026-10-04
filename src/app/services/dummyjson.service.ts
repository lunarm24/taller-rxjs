import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Comment, CommentsResponse } from '../models/comment.interface';
import { Post, PostsResponse } from '../models/post.interface';
import { User, UsersResponse } from '../models/user.interface';
import { map, switchMap } from 'rxjs/operators';

export type UserProfileResult =
  | { found: false }
  | { found: true; user: User; posts: Post[]; comments: Comment[] };

@Injectable({
  providedIn: 'root'
})
export class DummyjsonService {
  private readonly apiUrl = 'https://dummyjson.com';

  constructor(private http: HttpClient) {}

  searchUser(username: string): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(
      `${this.apiUrl}/users/filter?key=username&value=${encodeURIComponent(username)}`
    );
  }

  getPostsByUser(userId: number): Observable<PostsResponse> {
    return this.http.get<PostsResponse>(`${this.apiUrl}/posts/user/${userId}`);
  }

  getCommentsByPost(postId: number): Observable<CommentsResponse> {
    return this.http.get<CommentsResponse>(`${this.apiUrl}/comments/post/${postId}`);
  }

  getProfileByUsername(username: string): Observable<UserProfileResult> {
    return this.searchUser(username).pipe(
      switchMap((usersResponse) => {
        const user = usersResponse.users[0];
        if (!user) {
          return of<UserProfileResult>({ found: false });
        }

        return this.getPostsByUser(user.id).pipe(
          switchMap((postsResponse) =>
            this.getCommentsForPosts(postsResponse.posts).pipe(
              map((comments) => ({
                found: true as const,
                user,
                posts: postsResponse.posts,
                comments
              }))
            )
          )
        );
      })
    );
  }

  private getCommentsForPosts(
    posts: Post[],
    postIndex = 0,
    comments: Comment[] = []
  ): Observable<Comment[]> {
    if (postIndex >= posts.length) {
      return of(comments);
    }

    return this.getCommentsByPost(posts[postIndex].id).pipe(
      map((response) => [...comments, ...response.comments]),
      switchMap((updatedComments) =>
        this.getCommentsForPosts(posts, postIndex + 1, updatedComments)
      )
    );
  }
}
