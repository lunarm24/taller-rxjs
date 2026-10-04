import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserPostsComponent } from './user-posts.component';

describe('UserPostsComponent', () => {
  let fixture: ComponentFixture<UserPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPostsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserPostsComponent);
    fixture.componentInstance.posts = [{
      id: 1,
      title: 'Publicación de prueba',
      body: 'Contenido de prueba',
      tags: [],
      reactions: { likes: 8, dislikes: 4 },
      views: 20,
      userId: 1
    }];
    fixture.detectChanges();
  });

  it('should show likes and dislikes separately', () => {
    const likes = fixture.nativeElement.querySelector('.reaction-likes') as HTMLElement;
    const dislikes = fixture.nativeElement.querySelector('.reaction-dislikes') as HTMLElement;

    expect(likes.textContent).toContain('8');
    expect(dislikes.textContent).toContain('4');
  });
});
