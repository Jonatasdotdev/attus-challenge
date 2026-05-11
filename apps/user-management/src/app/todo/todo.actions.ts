import { createActionGroup, emptyProps, props } from '@ngrx/store';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export const TodoActions = createActionGroup({
  source: 'Todo API',
  events: {
    'Load Todos': emptyProps(),
    'Load Todos Success': props<{ todos: Todo[] }>(),
    'Load Todos Error': props<{ error: string }>(),
    'Toggle Todo Complete': props<{ id: string }>(),
  }
});
