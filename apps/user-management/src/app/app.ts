import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserListComponent } from '@attus-challenge/feature-users';

@Component({
  imports: [UserListComponent, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
})
export class App {
  title = 'user-management';
}
