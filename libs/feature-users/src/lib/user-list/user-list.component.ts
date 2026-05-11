import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, switchMap, tap, finalize, take } from 'rxjs';

import { UserService, User } from '@attus-challenge/data-access-users';
import { UserCardComponent } from '@attus-challenge/ui-components';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'attus-user-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatPaginatorModule,
    UserCardComponent,
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  users = signal<User[]>([]);
  totalUsers = signal(0);
  loading = signal(false);
  error = signal<string | null>(null);

  searchControl = new FormControl('');
  currentPage = signal(1);
  pageSize = signal(5);

  ngOnInit() {
    this.loadUsers();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadUsers();
      });
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);

    this.userService
      .getUsers(this.currentPage(), this.pageSize(), this.searchControl.value || '')
      .pipe(
        take(1),
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (page) => {
          this.users.set(page.users);
          this.totalUsers.set(page.total);
        },
        error: () => this.error.set('Erro ao carregar usuários. Tente novamente.'),
      });
  }

  onPageChange(event: PageEvent) {
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex + 1);
    this.loadUsers();
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '500px',
      data: { mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers();
        this.snackBar.open('Usuário criado com sucesso!', 'Fechar', { duration: 3000 });
      }
    });
  }

  onEdit(user: User) {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '500px',
      data: { mode: 'edit', user },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers();
        this.snackBar.open('Usuário atualizado com sucesso!', 'Fechar', { duration: 3000 });
      }
    });
  }

  onDelete(user: User) {
    if (confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
      this.userService.deleteUser(user.id).subscribe(() => {
        this.loadUsers();
        this.snackBar.open('Usuário excluído com sucesso!', 'Fechar', { duration: 3000 });
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
