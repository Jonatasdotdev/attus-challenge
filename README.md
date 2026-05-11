# Attus Frontend Challenge - Gestão de Usuários

Este projeto foi desenvolvido como parte do desafio técnico para Desenvolvedor Front End (Angular) na Attus.

## Tecnologias Utilizadas

- **Angular 17+** (Monorepo Nx)
- **Angular Material** para UI/UX
- **NgRx** para gerenciamento de estado (To-do)
- **Angular Signals** para estado local (Carrinho e Lista de Usuários)
- **RxJS** para reatividade e manipulação de streams
- **TypeScript** com tipagem forte e boas práticas
- **Vitest/Jest** para testes unitários

## Estrutura do Projeto

O projeto utiliza uma arquitetura baseada em **Nx Monorepo**, separando responsabilidades em bibliotecas:

- `libs/data-access-users`: Modelos e serviços de dados.
- `libs/feature-users`: Componentes de página (Listagem, Formulário).
- `libs/ui-components`: Componentes reutilizáveis (User Card).
- `apps/user-management`: Aplicação principal.

## Como Executar

### Pré-requisitos
- Node.js (v18+)
- pnpm (recomendado) ou npm

### Instalação
```bash
pnpm install
```

### Rodar a Aplicação
```bash
npx nx serve user-management
```
Acesse em: `http://localhost:4200`

### Rodar Testes
```bash
npx nx test user-management
```


## Diferenciais Implementados
- [x] Nx Monorepo
- [x] Paginação na listagem
- [x] Validação de formato (CPF, E-mail)
- [x] Melhorias de UI (Aesthetics, Glassmorphism, Micro-animações)
