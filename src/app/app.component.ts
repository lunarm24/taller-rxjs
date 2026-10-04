import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
export class AppComponent {
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

  constructor(private dummyjsonService: DummyjsonService) {}

  searchUser(): void {
    const username = this.searchForm.controls.username.value.trim();
    if (!username) {
      return;
    }

    this.user = null;
    this.posts = [];
    this.comments = [];
    this.loading = true;
    this.postsLoading = false;
    this.commentsLoading = false;
    this.errorMessage = '';
    this.postsErrorMessage = '';
    this.loading = true;

    this.dummyjsonService.getProfileByUsername(username).subscribe({
      next: (result) => {
        this.loading = false;

        if (!result.found) {
          this.errorMessage = `No se encontró ningún usuario con el username "${username}".`;
          return;
        }

        this.user = result.user;
        this.posts = result.posts;
        this.comments = result.comments;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No fue posible cargar el perfil. Revisa tu conexión e inténtalo de nuevo.';
      }
    });
  }
}
