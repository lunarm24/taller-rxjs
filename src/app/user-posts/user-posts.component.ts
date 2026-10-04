import { Component, Input } from '@angular/core';
import { Comment } from '../models/comment.interface';
import { Post } from '../models/post.interface';

@Component({
  selector: 'app-user-posts',
  standalone: true,
  templateUrl: './user-posts.component.html',
  styleUrl: './user-posts.component.css'
})
export class UserPostsComponent {
  @Input() posts: Post[] = [];
  @Input() comments: Comment[] = [];
  @Input() commentsLoading = false;
  @Input() errorMessage = '';

  commentsForPost(postId: number): Comment[] {
    return this.comments.filter((comment) => comment.postId === postId);
  }

}
