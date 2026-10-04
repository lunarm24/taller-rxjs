export interface PostReactions {
  likes: number;
  dislikes: number;
}

export interface Post {
  id: number;
  title: string;
  body: string;
  tags: string[];
  reactions: PostReactions;
  views: number;
  userId: number;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  skip: number;
  limit: number;
}
