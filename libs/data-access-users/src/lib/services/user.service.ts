import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, map, of, tap } from 'rxjs';
import { User, UserPage } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private users: User[] = [
    {
      id: '1',
      name: 'Giana Sandrini',
      email: 'giana@attornatus.com.br',
      cpf: '123.456.789-00',
      phone: '(11) 98888-8888',
      phoneType: 'CELULAR',
    },
  ];

  private users$ = new BehaviorSubject<User[]>(this.users);

  getUsers(page: number, size: number, searchTerm: string = ''): Observable<UserPage> {
    return this.users$.asObservable().pipe(
      delay(800), // Simulate network latency
      map((users) => {
        const filtered = users.filter((u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const start = (page - 1) * size;
        const end = start + size;
        return {
          users: filtered.slice(start, end),
          total: filtered.length,
        };
      })
    );
  }

  getUserById(id: string): Observable<User | undefined> {
    return of(this.users.find((u) => u.id === id)).pipe(delay(300));
  }

  createUser(user: Omit<User, 'id'>): Observable<User> {
    const newUser = { ...user, id: Math.random().toString(36).substring(2, 9) };
    this.users = [...this.users, newUser];
    this.users$.next(this.users);
    return of(newUser).pipe(delay(500));
  }

  updateUser(id: string, userData: Partial<User>): Observable<User> {
    this.users = this.users.map((u) => (u.id === id ? { ...u, ...userData } : u));
    this.users$.next(this.users);
    const updated = this.users.find((u) => u.id === id)!;
    return of(updated).pipe(delay(500));
  }

  deleteUser(id: string): Observable<void> {
    this.users = this.users.filter((u) => u.id !== id);
    this.users$.next(this.users);
    return of(undefined).pipe(delay(500));
  }
}
