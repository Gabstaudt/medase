# DEV-02

## Escopo

Este documento registra a integração do frontend `medase` com o backend do `smart-health-template` para o catálogo de exames e medicamentos.

O foco desta entrega foi:

- consumir as novas rotas de catálogo do backend
- usar token real de autenticação
- restringir acesso da tela ao médico
- remover a dependência de dados mock nessa área

## Tela integrada

Arquivo principal:

- [ExamsMedications.tsx](C:/Users/gabib/OneDrive/medase/src/pages/ExamsMedications.tsx)

Essa tela passou a operar com dados reais do backend.

## Integrações realizadas no frontend

### Exames

Chamadas implementadas:

- `GET /exames/`
- `POST /exames/`
- `PUT /exames/{id}`
- `DELETE /exames/{id}`

Campos usados na UI:

- `nome`
- `categoria`
- `descricao`
- `preco`
- `preparacao`
- `observacoes`
- `ativo`

### Medicamentos

Chamadas implementadas:

- `GET /medicamentos/`
- `POST /medicamentos/`
- `PUT /medicamentos/{id}`
- `DELETE /medicamentos/{id}`

Campos usados na UI:

- `nome`
- `principio_ativo`
- `dosagem`
- `forma_farmaceutica`
- `fabricante`
- `descricao`
- `contraindicacoes`
- `efeitos_colaterais`
- `ativo`

## Como a autenticação foi aplicada

O frontend já possuía login real integrado ao backend. Nesta etapa, essa autenticação passou a ser usada também no módulo de catálogo.

Arquivo base de autenticação:

- [auth.ts](C:/Users/gabib/OneDrive/medase/src/lib/auth.ts)

Pontos relevantes:

- o token é gerado em `POST /users/login`
- depois o frontend consulta `GET /users/eu`
- o token é salvo no storage
- a tela de catálogo usa `getAccessToken()` para montar o header `Authorization`

Header enviado:

```http
Authorization: Bearer <token>
```

## Restrição de acesso

O requisito definido foi: somente médico pode acessar esse módulo.

Arquivos envolvidos:

- [auth.ts](C:/Users/gabib/OneDrive/medase/src/lib/auth.ts)
- [Sidebar.tsx](C:/Users/gabib/OneDrive/medase/src/components/layout/Sidebar.tsx)
- [App.tsx](C:/Users/gabib/OneDrive/medase/src/App.tsx)

O controle ficou dividido em dois níveis:

### Navegação

Na sidebar, o item do catálogo só aparece quando:

- `backendRole === "medico"`

### Proteção de rota

Na aplicação, a rota foi protegida com:

- role interna permitida: `ADMIN`
- role real do backend exigida: `medico`

Esse desenho foi necessário porque o `medase` já mapeava `medico` do backend para `ADMIN` internamente, mas a tela precisava ficar restrita apenas ao médico real.

## Arquivos alterados no frontend

### Catálogo

- [ExamsMedications.tsx](C:/Users/gabib/OneDrive/medase/src/pages/ExamsMedications.tsx)
  - remoção do mock da tela
  - criação de chamadas reais ao backend
  - uso do token Bearer
  - formulários de cadastro e edição
  - listagem real de exames e medicamentos
  - exclusão real com confirmação

### Autenticação e autorização

- [auth.ts](C:/Users/gabib/OneDrive/medase/src/lib/auth.ts)
  - reutilização do token salvo no login
  - helpers de verificação de role real do backend
- [App.tsx](C:/Users/gabib/OneDrive/medase/src/App.tsx)
  - proteção de rota por `requiredBackendRole`
- [Sidebar.tsx](C:/Users/gabib/OneDrive/medase/src/components/layout/Sidebar.tsx)
  - item de navegação exibido apenas para médico

## Comportamento final da tela

### Carregamento

Ao abrir a tela:

1. o frontend lê o token salvo
2. faz `GET /exames/`
3. faz `GET /medicamentos/`
4. renderiza os catálogos nas abas

### Cadastro

No modal:

- `Novo exame` envia `POST /exames/`
- `Novo medicamento` envia `POST /medicamentos/`

### Edição

No modal:

- exame existente envia `PUT /exames/{id}`
- medicamento existente envia `PUT /medicamentos/{id}`

### Exclusão

Na listagem:

- exame envia `DELETE /exames/{id}`
- medicamento envia `DELETE /medicamentos/{id}`

## Dependência com o backend

Para funcionar corretamente, o frontend depende de:

- backend rodando em `VITE_API_URL`
- migration do catálogo aplicada
- token válido de usuário médico
- backend com permissão liberada para `medico` nas rotas de catálogo

## Problemas encontrados durante a integração

### 1. CORS e ambiente

Houve bloqueios iniciais por CORS e por container antigo rodando código desatualizado.

### 2. Permissão

As rotas do backend inicialmente aceitavam apenas `admin` e `superuser`. Isso foi corrigido para incluir `medico`.

### 3. Atualização do backend em Docker

Algumas mudanças não refletiam no container por causa do setup de desenvolvimento. O backend foi ajustado para usar bind mount e reload local, reduzindo a necessidade de rebuild completo.

### 4. Rota não encontrada

O `404` observado em `/exames/` não era erro do frontend; indicava backend rodando versão antiga sem os routers novos carregados.

## Fluxo ponta a ponta

1. Médico faz login no `medase`.
2. Backend gera token.
3. Frontend salva token e usuário.
4. Sidebar mostra a entrada do catálogo apenas para médico.
5. Usuário acessa a tela de exames e medicamentos.
6. A tela chama o backend com `Bearer token`.
7. Backend valida autenticação e role.
8. O catálogo é exibido e pode ser manipulado.

## Validação executada

- `npm run build` no `medase`

## Observações finais

Esta entrega cobre a integração do módulo de catálogo. Ela não substitui os históricos clínicos do paciente, que continuam sendo outro fluxo funcional dentro da aplicação.
