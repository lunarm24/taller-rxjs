import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Comment } from './models/comment.interface';
import { Post } from './models/post.interface';
import { User } from './models/user.interface';
import { DummyjsonService } from './services/dummyjson.service';
import { UserDetailsComponent } from './user-details/user-details.component';
import { UserPostsComponent } from './user-posts/user-posts.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, UserDetailsComponent, UserPostsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  username = '';
  user: User | null = null;
  posts: Post[] = [];
  comments: Comment[] = [];
  loading = false;
  postsLoading = false;
  commentsLoading = false;
  errorMessage = '';
  postsErrorMessage = '';

  private searchNumber = 0;
  private pendingComments = 0;

  constructor(private dummyjsonService: DummyjsonService) {}

  searchUser(): void {
    const username = this.username.trim();
    if (!username) {
      return;
    }

    const currentSearch = ++this.searchNumber;
    this.user = null;
    this.posts = [];
    this.comments = [];
    this.loading = true;
    this.postsLoading = false;
    this.commentsLoading = false;
    this.errorMessage = '';
    this.postsErrorMessage = '';

    this.dummyjsonService.searchUser(username).subscribe({
      next: (response) => {
        if (currentSearch !== this.searchNumber) {
          return;
        }

        this.loading = false;
        const user = response.users[0];
        if (!user) {
          this.errorMessage = `No se encontró ningún usuario con el username "${username}".`;
          return;
        }

        this.user = user;
        this.loadPosts(user.id, currentSearch);
      },
      error: () => {
        if (currentSearch !== this.searchNumber) {
          return;
        }

        this.loading = false;
        this.errorMessage = 'No fue posible consultar el usuario. Revisa tu conexión e inténtalo de nuevo.';
      }
    });
  }

  private loadPosts(userId: number, currentSearch: number): void {
    this.postsLoading = true;

    this.dummyjsonService.getPostsByUser(userId).subscribe({
      next: (response) => {
        if (currentSearch !== this.searchNumber) {
          return;
        }

        this.posts = response.posts;
        this.postsLoading = false;
        this.pendingComments = response.posts.length;
        this.commentsLoading = this.pendingComments > 0;

        response.posts.forEach((post) => this.loadComments(post.id, currentSearch));
      },
      error: () => {
        if (currentSearch !== this.searchNumber) {
          return;
        }

        this.postsLoading = false;
        this.postsErrorMessage = 'No fue posible cargar las publicaciones de este usuario.';
      }
    });
  }

  private loadComments(postId: number, currentSearch: number): void {
    this.dummyjsonService.getCommentsByPost(postId).subscribe({
      next: (response) => {
        if (currentSearch !== this.searchNumber) {
          return;
        }

        this.comments = [...this.comments, ...response.comments]
          .sort((first, second) => first.id - second.id);
        this.finishCommentRequest();
      },
      error: () => {
        if (currentSearch !== this.searchNumber) {
          return;
        }

        this.postsErrorMessage = 'No fue posible cargar algunos comentarios.';
        this.finishCommentRequest();
      }
    });
  }

  private finishCommentRequest(): void {
    this.pendingComments -= 1;
    this.commentsLoading = this.pendingComments > 0;
  }
}
