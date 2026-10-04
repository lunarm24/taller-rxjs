import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Comment } from './models/comment.interface';
import { Post } from './models/post.interface';
import { User } from './models/user.interface';
import { DummyjsonService } from './services/dummyjson.service';
import { UserDetailsComponent } from './user-details/user-details.component';
import { UserPostsComponent } from './user-posts/user-posts.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserDetailsComponent, UserPostsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  searchForm = new FormGroup({
    username: new FormControl('', { nonNullable: true })
  });
  user: User | null = null;
  posts: Post[] = [];
  comments: Comment[] = [];
  loading = false;
  postsLoading = false;
  commentsLoading = false;
  errorMessage = '';
  postsErrorMessage = '';

  private readonly searchRequests = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(private dummyjsonService: DummyjsonService) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchRequests.pipe(
      tap(() => this.resetSearch()),
      switchMap((username) => this.searchProfile(username))
    ).subscribe((result) => {
      if (result.status === 'user-not-found') {
        this.loading = false;
        this.errorMessage = `No se encontró ningún usuario con el username "${result.username}".`;
        return;
      }

      if (result.status === 'user-error') {
        this.loading = false;
        this.errorMessage = 'No fue posible consultar el usuario. Revisa tu conexión e inténtalo de nuevo.';
        return;
      }

      if (result.status === 'posts-error') {
        this.postsLoading = false;
        this.postsErrorMessage = 'No fue posible cargar las publicaciones de este usuario.';
        return;
      }

      this.comments = result.comments;
      this.commentsLoading = false;
      if (result.commentsError) {
        this.postsErrorMessage = 'No fue posible cargar algunos comentarios.';
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  searchUser(): void {
    const username = this.searchForm.controls.username.value.trim();
    if (!username) {
      return;
    }

    this.searchRequests.next(username);
  }

  private resetSearch(): void {
    this.user = null;
    this.posts = [];
    this.comments = [];
    this.loading = true;
    this.postsLoading = false;
    this.commentsLoading = false;
    this.errorMessage = '';
    this.postsErrorMessage = '';
  }

  private searchProfile(username: string): Observable<SearchResult> {
    return this.dummyjsonService.searchUser(username).pipe(
      switchMap((response) => {
        const user = response.users[0];
        if (!user) {
          return of<SearchResult>({ status: 'user-not-found', username });
        }

        this.user = user;
        this.loading = false;
        this.postsLoading = true;

        return this.dummyjsonService.getPostsByUser(user.id).pipe(
          switchMap((postsResponse) => {
            this.posts = postsResponse.posts;
            this.postsLoading = false;

            if (postsResponse.posts.length === 0) {
              return of<SearchResult>({
                status: 'loaded',
                comments: [],
                commentsError: false
              });
            }

            this.commentsLoading = true;
            return forkJoin(
              postsResponse.posts.map((post) =>
                this.dummyjsonService.getCommentsByPost(post.id).pipe(
                  map((commentsResponse) => ({
                    comments: commentsResponse.comments,
                    failed: false
                  })),
                  catchError(() => of({ comments: [] as Comment[], failed: true }))
                )
              )
            ).pipe(
              map((commentResults) => ({
                status: 'loaded' as const,
                comments: commentResults
                  .flatMap((result) => result.comments)
                  .sort((first, second) => first.id - second.id),
                commentsError: commentResults.some((result) => result.failed)
              }))
            );
          }),
          catchError(() => of<SearchResult>({ status: 'posts-error' }))
        );
      }),
      catchError(() => of<SearchResult>({ status: 'user-error' }))
    );
  }
}

type SearchResult =
  | { status: 'user-not-found'; username: string }
  | { status: 'user-error' }
  | { status: 'posts-error' }
  | { status: 'loaded'; comments: Comment[]; commentsError: boolean };
