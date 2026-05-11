import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { debounceTime, distinctUntilChanged, switchMap, tap, finalize, Observable, of, delay } from 'rxjs';

@Component({
  selector: 'attus-exercise-2-3',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, MatListModule],
  template: `
    <div class="exercise-container">
      <h3>2.3. RxJS — busca com debounce</h3>
      <mat-form-field appearance="outline">
        <mat-label>Pesquisar usuários...</mat-label>
        <input matInput [formControl]="searchControl">
      </mat-form-field>

      <div *ngIf="loading" class="spinner">
        <mat-spinner diameter="30"></mat-spinner>
      </div>

      <mat-list *ngIf="results$ | async as results">
        <mat-list-item *ngFor="let item of results">
          {{ item }}
        </mat-list-item>
        <mat-list-item *ngIf="results.length === 0 && !loading">
          Nenhum resultado encontrado.
        </mat-list-item>
      </mat-list>
    </div>
  `,
  styles: [`
    .exercise-container { padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin-top: 20px; }
    .spinner { display: flex; justify-content: center; padding: 10px; }
  `]
})
export class Exercise23Component implements OnInit {
  searchControl = new FormControl('');
  results$!: Observable<string[]>;
  loading = false;

  ngOnInit() {
    this.results$ = this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.loading = true),
      switchMap(term => this.mockSearch(term).pipe(
        finalize(() => this.loading = false)
      ))
    );
  }

  mockSearch(term: string | null): Observable<string[]> {
    if (!term) return of([]);
    // Simulando busca na API
    const allUsers = ['Giana Sandrini', 'João Silva', 'Maria Souza', 'José Pereira', 'Ana Costa', 'Carlos Oliveira'];
    const filtered = allUsers.filter(u => u.toLowerCase().includes(term.toLowerCase()));
    return of(filtered).pipe(delay(800));
  }
}
