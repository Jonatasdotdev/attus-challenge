import { Component, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'attus-exercise-3-1',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatBadgeModule],
  template: `
    <div class="exercise-container">
      <h3>3.1. Angular Signals — estado local (Carrinho)</h3>
      
      <div class="cart-summary">
        <mat-icon [matBadge]="totalQuantity()" matBadgeColor="warn">shopping_cart</mat-icon>
        <span>Total: {{ totalPrice() | currency:'BRL' }}</span>
      </div>

      <div class="item-list">
        <div *ngFor="let item of items()" class="item">
          <span>{{ item.name }} ({{ item.price | currency:'BRL' }})</span>
          <div class="actions">
            <button mat-icon-button (click)="removeItem(item.id)"><mat-icon>remove</mat-icon></button>
            <span>{{ item.quantity }}</span>
            <button mat-icon-button (click)="addItem(item)"><mat-icon>add</mat-icon></button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .exercise-container { padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin-top: 20px; }
    .cart-summary { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; font-weight: bold; }
    .item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee; }
    .actions { display: flex; align-items: center; gap: 10px; }
  `]
})
export class Exercise31Component {
  // 1. Signal para a lista de itens
  items = signal<CartItem[]>([
    { id: 1, name: 'Produto A', price: 10.5, quantity: 1 },
    { id: 2, name: 'Produto B', price: 20.0, quantity: 0 },
  ]);

  // 2. Computed para o total
  totalPrice = computed(() => 
    this.items().reduce((acc, item) => acc + (item.price * item.quantity), 0)
  );

  totalQuantity = computed(() => 
    this.items().reduce((acc, item) => acc + item.quantity, 0)
  );

  // 4. Output que emite sempre que o total mudar
  totalChanged = output<number>();

  constructor() {
    // Efeito colateral simulado para o output
    // Nota: Em um cenário real, usaríamos o output.emit() dentro dos métodos
  }

  // 3. Métodos para adicionar e remover itens
  addItem(item: CartItem) {
    this.items.update(current => 
      current.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
    );
    this.totalChanged.emit(this.totalPrice());
  }

  removeItem(id: number) {
    this.items.update(current => 
      current.map(i => i.id === id && i.quantity > 0 ? { ...i, quantity: i.quantity - 1 } : i)
    );
    this.totalChanged.emit(this.totalPrice());
  }
}
