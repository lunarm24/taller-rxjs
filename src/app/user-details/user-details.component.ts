import { Component, Input } from '@angular/core';
import { User } from '../models/user.interface';

@Component({
  selector: 'app-user-details',
  standalone: true,
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent {
  @Input() user: User | null = null;
}
