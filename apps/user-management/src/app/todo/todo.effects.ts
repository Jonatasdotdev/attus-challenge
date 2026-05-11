import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { map, switchMap, catchError, delay } from 'rxjs/operators';
import { TodoActions, Todo } from './todo.actions';

@Injectable()
export class TodoEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);

  loadTodos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodoActions.loadTodos),
      switchMap(() => {
        // Simulando chamada HTTP
        const mockTodos: Todo[] = [
          { id: '1', title: 'Estudar Angular', completed: false },
          { id: '2', title: 'Fazer o desafio Attus', completed: true },
        ];
        return of(mockTodos).pipe(
          delay(1000),
          map((todos) => TodoActions.loadTodosSuccess({ todos })),
          catchError((error) => of(TodoActions.loadTodosError({ error: error.message })))
        );
      })
    )
  );
}
