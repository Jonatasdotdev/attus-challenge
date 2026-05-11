# Respostas da Avaliação Técnica - Attus

Este documento contém as respostas detalhadas para as questões teóricas do desafio.

---

## 1. TypeScript e Qualidade de Código

### 1.1. Refatoração

**Melhorias implementadas:**
- **Tipagem Forte**: Substituição do tipo `any` por interfaces e tipos primitivos (`number`, `string`).
- **Clean Code**: Uso de modificadores de acesso no construtor para redução de boilerplate.
- **Métodos de Array**: Uso de `.find()` em vez de loops `for` manuais.
- **Encapsulamento**: Atributo `produtos` definido como `private readonly`.
- **Tratamento de Erros**: Verificação de existência do produto para evitar erros de runtime.
- **Template Literals**: Melhor legibilidade na concatenação de strings.

```typescript
export interface IProduto {
  id: number;
  descricao: string;
  quantidadeEstoque: number;
}

export class Produto implements IProduto {
  constructor(
    public id: number,
    public descricao: string,
    public quantidadeEstoque: number
  ) {}
}

export class Verdureira {
  private readonly produtos: IProduto[];

  constructor() {
    this.produtos = [
      new Produto(1, 'Maçã', 20),
      new Produto(2, 'Laranja', 0),
      new Produto(3, 'Limão', 20)
    ];
  }

  getDescricaoProduto(produtoId: number): string {
    const produto = this.findProdutoById(produtoId);
    if (!produto) {
      return 'Produto não encontrado';
    }
    return `${produto.id} - ${produto.descricao} (${produto.quantidadeEstoque}x)`;
  }

  hasEstoqueProduto(produtoId: number): boolean {
    const produto = this.findProdutoById(produtoId);
    return !!produto && produto.quantidadeEstoque > 0;
  }

  private findProdutoById(produtoId: number): IProduto | undefined {
    return this.produtos.find(p => p.id === produtoId);
  }
}
```

### 1.2. Generics e tipos utilitários

```typescript
export interface PaginaParams {
  pagina: number;
  tamanho: number;
}

export interface Pagina<T> {
  itens: T[];
  total: number;
}

/**
 * Filtra e pagina um array de dados de forma genérica.
 */
export function filtrarEPaginar<T>(
  data: T[],
  filterFn: (item: T) => boolean,
  params: PaginaParams
): Pagina<T> {
  const filtered = data.filter(filterFn);
  const start = (params.pagina - 1) * params.tamanho;
  const end = start + params.tamanho;
  const itens = filtered.slice(start, end);
  
  return {
    itens,
    total: filtered.length
  };
}

// Exemplo concreto de uso:
interface Usuario {
  id: number;
  nome: string;
}

const usuarios: Usuario[] = [
  { id: 1, nome: 'João' },
  { id: 2, nome: 'Maria' },
  { id: 3, nome: 'José' }
];

const resultado = filtrarEPaginar(
  usuarios, 
  u => u.nome.includes('Ma'), 
  { pagina: 1, tamanho: 10 }
);
```

---

## 2. Angular — Fundamentos e Reatividade

### 2.1. Change Detection e OnPush

**Problema Identificado:**
Com `ChangeDetectionStrategy.OnPush`, o Angular só verifica mudanças quando:
1. Uma `@Input` do componente é alterada.
2. Um evento (click, keyup, etc.) ocorre no próprio componente.
3. Um Observable disparado via `AsyncPipe` emite um novo valor.
4. `ChangeDetectorRef.markForCheck()` é chamado explicitamente.

No código fornecido, o `subscribe` e o `setInterval` atualizam variáveis locais, mas como estas não são eventos de UI nem inputs, o ciclo de detecção de mudanças não é disparado, deixando a tela "congelada" com o estado inicial.

**Correção Proposta (Usando ChangeDetectorRef):**

```typescript
import { ChangeDetectorRef } from '@angular/core';

// ... dentro do componente
constructor(
  private readonly pessoaService: PessoaService,
  private readonly cdr: ChangeDetectorRef // Injetando o ChangeDetectorRef
) {}

ngOnInit(): void {
  this.subscriptionBuscarPessoa = this.pessoaService.buscarPorId(1).subscribe((pessoa) => {
    this.texto = `Nome: ${pessoa.nome}`;
    this.cdr.markForCheck(); // Notifica o Angular para verificar este componente
  });

  setInterval(() => {
    this.contador++;
    this.cdr.markForCheck(); // Notifica o Angular para atualizar o contador
  }, 1000);
}
```

### 2.2. RxJS — eliminando subscriptions aninhadas

**Refatoração:**

```typescript
ngOnInit(): void {
  const pessoaId = 1;

  this.pessoaService.buscarPorId(pessoaId).pipe(
    switchMap(pessoa => 
      this.pessoaService.buscarQuantidadeFamiliares(pessoa.id).pipe(
        map(qtd => ({ pessoa, qtd }))
      )
    ),
    takeUntil(this.destroy$) // Evita memory leaks (assumindo Subject no OnDestroy)
  ).subscribe(({ pessoa, qtd }) => {
    this.texto = `Nome: ${pessoa.nome} | familiares: ${qtd}`;
  });
}
```

**Explicação da escolha:**
Utilizei o `switchMap` porque ele é ideal para fluxos onde uma nova requisição depende do resultado da anterior. Além disso, se o `pessoaId` mudasse rapidamente, o `switchMap` cancelaria a requisição de familiares anterior e iniciaria a nova, evitando condições de corrida (race conditions).

### 2.4. Performance — OnPush e trackBy

- **Por que trackBy melhora performance?** 
  Por padrão, o Angular usa a identidade do objeto para rastrear itens em uma lista. Se a lista for recarregada (mesmo que os dados sejam os mesmos), o Angular destrói e recria todos os elementos do DOM. O `trackBy` permite informar um identificador único (ex: `id`), fazendo com que o Angular apenas mova ou atualize o elemento existente, reduzindo drasticamente o custo de manipulação do DOM.
  
- **Como OnPush reduz ciclos de detecção?**
  Com `Default`, qualquer evento em qualquer lugar da aplicação dispara a verificação em todos os componentes da árvore. O `OnPush` faz com que o Angular "pule" a verificação deste componente e de seus filhos, a menos que ele saiba explicitamente que algo mudou (Input ou evento interno), economizando CPU e melhorando a fluidez da UI.

- **Impacto da estratégia Default em listas grandes?**
  Em listas com centenas de itens, qualquer interação (como digitar em um campo de busca) faria o Angular percorrer cada item da lista para verificar mudanças, mesmo que nada tenha mudado neles. Isso causa lentidão (lag) perceptível na interface.

---

## 3. Gerenciamento de Estado

### 3.1. Angular Signals — estado local (Carrinho)

Implementação utilizando `signal`, `computed` e `output`:

```typescript
@Component({
  selector: 'app-cart',
  standalone: true,
  template: `...`
})
export class CartComponent {
  // 1. Signal para a lista de itens
  items = signal<CartItem[]>([
    { id: 1, name: 'Produto A', price: 10.5, quantity: 1 }
  ]);

  // 2. Computed para o total (quantidade x preço)
  totalPrice = computed(() => 
    this.items().reduce((acc, item) => acc + (item.price * item.quantity), 0)
  );

  // 3. Output que emite sempre que o total mudar
  totalChanged = output<number>();

  // 4. Métodos para adicionar e remover itens
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
```

### 3.2. Gerenciamento de Estado com NgRx (To-do)

**Actions:**
```typescript
export const TodoActions = createActionGroup({
  source: 'Todo API',
  events: {
    'Load Todos': emptyProps(),
    'Load Todos Success': props<{ todos: Todo[] }>(),
    'Load Todos Error': props<{ error: string }>(),
    'Toggle Todo Complete': props<{ id: string }>(),
  }
});
```

**Reducer:**
```typescript
export const todoReducer = createReducer(
  initialState,
  on(TodoActions.loadTodosSuccess, (state, { todos }) => ({ ...state, todos, loading: false })),
  on(TodoActions.toggleTodoComplete, (state, { id }) => ({
    ...state,
    todos: state.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
  }))
);
```

**Selectors:**
```typescript
export const selectAllTodos = createSelector(selectTodoState, (state) => state.todos);
export const selectPendingTodos = createSelector(selectAllTodos, (todos) => todos.filter(t => !t.completed));
```

**Effect:**
```typescript
loadTodos$ = createEffect(() =>
  this.actions$.pipe(
    ofType(TodoActions.loadTodos),
    switchMap(() => this.http.get<Todo[]>('/api/todos').pipe(
      map(todos => TodoActions.loadTodosSuccess({ todos })),
      catchError(error => of(TodoActions.loadTodosError({ error: error.message })))
    ))
  )
);
```
