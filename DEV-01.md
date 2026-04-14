# DEV-01

## Objetivo

Este documento registra as mudanças realizadas no frontend `medase`, com foco em:

- módulo da secretária
- agenda e calendário
- pacientes da secretária
- gestão de consultas
- detalhes do paciente
- integração de login e cadastro com o backend do `smart-health-template`

## Resumo geral

O `medase` começou com autenticação mockada e fluxo interno sem integração com backend. Ao longo das alterações, o frontend passou a ter:

- área específica da secretária
- agenda da médica com visualização em calendário
- tela própria de pacientes da secretária
- fluxo de agendamento com seleção e cadastro rápido de paciente
- modal de visualização e edição de consulta
- expansão da tela do paciente com histórico, exames e medicamentos
- integração real de login e cadastro com o backend

## Módulo da secretária

### 1. Tela inicial da secretária

Arquivo principal:

- [src/pages/SecretaryDashboard.tsx](c:/Users/gabib/OneDrive/medase/src/pages/SecretaryDashboard.tsx)

Alterações implementadas:

- criação da área dedicada da secretária
- restrição de visão para o contexto da secretária
- manutenção de cards superiores de resumo
- calendário principal com modos:
  - `Day`
  - `Week`
  - `Month`
- cabeçalho com:
  - botão `Today`
  - navegação anterior/próximo
  - título do período
  - dropdown de visualização

#### Visualização mensal

Foi implementado um calendário em grade horizontal com:

- 7 colunas fixas
- cabeçalhos de domingo a sábado
- semanas em linhas sucessivas
- dias do mês anterior e seguinte para completar a grade
- eventos dentro das células do dia

#### Visualização semanal e diária

Foi implementado layout com:

- escala de horários na lateral
- colunas por dia
- eventos posicionados verticalmente por horário e duração

#### Eventos e status

Os agendamentos do calendário passaram a:

- exibir cor por status
- ser clicáveis
- abrir modal de detalhes da consulta

Status tratados visualmente:

- agendado
- confirmado
- consulta feita
- a reagendar

### 2. Lista inferior da agenda

Na parte inferior da tela da secretária foi mantida a lista de agenda para leitura mais objetiva.

Funcionalidades:

- visualização clara dos atendimentos
- botão `Editar consulta`
- integração com o modal de edição

### 3. Agendar paciente

Na tela inicial da secretária, o botão principal foi alterado para `Agendar paciente`.

Fluxo implementado:

- abre um modal
- permite selecionar paciente existente
- permite cadastrar paciente novo rapidamente
- permite definir:
  - médica
  - data
  - horário
  - observações

Esse fluxo foi concentrado na agenda da secretária, em vez de misturar cadastro de pacientes diretamente na home.

### 4. Tela de pacientes da secretária

Arquivo principal:

- [src/pages/SecretaryPatients.tsx](c:/Users/gabib/OneDrive/medase/src/pages/SecretaryPatients.tsx)

Mudanças:

- o bloco de pacientes cadastrados foi removido da home da secretária
- foi criada uma tela dedicada no menu lateral
- a navbar passou a ter:
  - `Agenda da médica`
  - `Pacientes`

Dados visíveis para a secretária:

- nome
- email
- telefone
- cpf
- data de nascimento
- tipo sanguíneo
- alergias

## Alterações na navegação e permissões

Arquivos relevantes:

- [src/App.tsx](c:/Users/gabib/OneDrive/medase/src/App.tsx)
- [src/components/layout/Sidebar.tsx](c:/Users/gabib/OneDrive/medase/src/components/layout/Sidebar.tsx)
- [src/lib/auth.ts](c:/Users/gabib/OneDrive/medase/src/lib/auth.ts)

O que foi feito:

- criação de rotas específicas para secretária
- proteção por perfil
- definição de rota padrão por papel
- separação da navegação entre `ADMIN` e `SECRETARIA`
- remoção do bloco `Status Rápido` da sidebar

Também foi criada a agenda do médico na navbar do perfil administrativo:

- [src/pages/DoctorAgenda.tsx](c:/Users/gabib/OneDrive/medase/src/pages/DoctorAgenda.tsx)

## Tela do paciente

Arquivo principal:

- [src/pages/PatientDetails.tsx](c:/Users/gabib/OneDrive/medase/src/pages/PatientDetails.tsx)

Expansões implementadas:

- aba `Histórico`
- aba `Exames`
- aba `Medicamentos`

### Histórico

Passou a mostrar:

- últimas consultas
- próximas consultas
- histórico de análises
- clique em consulta para abrir modal
- se a consulta for futura, possibilidade de reagendamento

### Exames

Funcionalidades adicionadas:

- adicionar exame
- editar exame
- excluir exame
- definir tipo de exame
- aceitar tipo digitado com `Enter`
- permitir selecionar tipo existente
- descrição
- upload mock de PDF

### Medicamentos

Funcionalidades adicionadas:

- adicionar medicamento
- editar medicamento
- excluir medicamento
- histórico de uso

Arquivos relacionados:

- [src/lib/types.ts](c:/Users/gabib/OneDrive/medase/src/lib/types.ts)
- [src/lib/store.ts](c:/Users/gabib/OneDrive/medase/src/lib/store.ts)

Esses arquivos foram expandidos para suportar:

- histórico de exames
- histórico de medicamentos
- atualização de consultas
- criação de consultas

## Tela de pacientes

Arquivo principal:

- [src/pages/PatientList.tsx](c:/Users/gabib/OneDrive/medase/src/pages/PatientList.tsx)

Ajuste realizado:

- remoção da duplicação dos botões `Filtros` e `Exportar`

## Tela de configurações

Arquivo principal:

- [src/pages/Settings.tsx](c:/Users/gabib/OneDrive/medase/src/pages/Settings.tsx)

Mudanças:

- adição da seção `Usuários do sistema`
- listagem local de usuários
- criação de usuário
- edição de usuário
- exclusão de usuário
- ativação/inativação

Observação:

- essa parte ainda está local/mock
- não foi integrada ao backend de usuários

## Autenticação e integração com backend

Arquivos principais:

- [src/lib/auth.ts](c:/Users/gabib/OneDrive/medase/src/lib/auth.ts)
- [src/pages/Login.tsx](c:/Users/gabib/OneDrive/medase/src/pages/Login.tsx)
- [src/pages/Register.tsx](c:/Users/gabib/OneDrive/medase/src/pages/Register.tsx)
- [src/lib/types.ts](c:/Users/gabib/OneDrive/medase/src/lib/types.ts)

### Estado anterior

Antes da integração:

- login era hardcoded
- cadastro criava usuário fake no `localStorage`
- não existia token real

### Estado atual

O frontend passou a usar o backend real do `smart-health-template`.

#### Login

Fluxo:

- `POST /users/login`
- recebe `access_token`
- `GET /users/eu`
- normaliza o usuário para o padrão interno do `medase`
- salva no storage:
  - `medase:access_token`
  - `medase:user`

#### Cadastro

Fluxo:

- `POST /users/`
- envia os campos básicos:
  - `email`
  - `senha`
  - `nome`
  - `telefone`
  - `role`
- para médico, envia também:
  - `registro_profissional`
  - `especialidade_principal`
  - `instituicao`
  - `universidade`
  - `ano_formacao`
  - `residencia_medica`
  - `especializacoes`
- após cadastro, faz login automático

### Normalização de roles

O backend usa roles em minúsculas:

- `user`
- `superuser`
- `admin`
- `secretaria`
- `medico`

O `medase` já tinha autorização interna baseada em:

- `ADMIN`
- `SECRETARIA`

Por isso foi feito o mapeamento:

- `secretaria` -> `SECRETARIA`
- `admin` -> `ADMIN`
- `superuser` -> `ADMIN`
- `medico` -> `ADMIN`

Isso mantém a navegação existente do `medase` funcionando sem reescrever todas as guards.

### Variáveis de ambiente

Arquivo:

- [medase/.env](c:/Users/gabib/OneDrive/medase/.env)

Configuração usada:

```env
VITE_API_URL=http://localhost:8000
```

## Problemas encontrados durante a integração

### 1. `Failed to fetch`

Causa:

- CORS não configurado no backend

Sintoma:

- navegador bloqueando requisição
- backend registrando `OPTIONS /users/ 405`

### 2. Startup do backend falhando

Causa:

- criação do primeiro `superuser` sendo barrada pela regra de permissão

Impacto no frontend:

- impossibilidade total de usar login/cadastro porque o backend nem iniciava

### 3. Enum de role incompatível

Causa:

- frontend enviava `MEDICO` e `SECRETARIA`
- backend aceitava `medico` e `secretaria`

Correção:

- ajuste do `Register.tsx` e `auth.ts` para trabalhar com o casing correto

## Arquivos do `medase` que sofreram mudanças relevantes

Autenticação e integração:

- [src/lib/auth.ts](c:/Users/gabib/OneDrive/medase/src/lib/auth.ts)
- [src/lib/types.ts](c:/Users/gabib/OneDrive/medase/src/lib/types.ts)
- [src/pages/Login.tsx](c:/Users/gabib/OneDrive/medase/src/pages/Login.tsx)
- [src/pages/Register.tsx](c:/Users/gabib/OneDrive/medase/src/pages/Register.tsx)

Secretária:

- [src/pages/SecretaryDashboard.tsx](c:/Users/gabib/OneDrive/medase/src/pages/SecretaryDashboard.tsx)
- [src/pages/SecretaryPatients.tsx](c:/Users/gabib/OneDrive/medase/src/pages/SecretaryPatients.tsx)
- [src/components/layout/Sidebar.tsx](c:/Users/gabib/OneDrive/medase/src/components/layout/Sidebar.tsx)
- [src/App.tsx](c:/Users/gabib/OneDrive/medase/src/App.tsx)

Paciente:

- [src/pages/PatientList.tsx](c:/Users/gabib/OneDrive/medase/src/pages/PatientList.tsx)
- [src/pages/PatientForm.tsx](c:/Users/gabib/OneDrive/medase/src/pages/PatientForm.tsx)
- [src/pages/PatientDetails.tsx](c:/Users/gabib/OneDrive/medase/src/pages/PatientDetails.tsx)
- [src/components/PatientTable.tsx](c:/Users/gabib/OneDrive/medase/src/components/PatientTable.tsx)

Agenda e dados:

- [src/pages/DoctorAgenda.tsx](c:/Users/gabib/OneDrive/medase/src/pages/DoctorAgenda.tsx)
- [src/lib/store.ts](c:/Users/gabib/OneDrive/medase/src/lib/store.ts)

Configurações:

- [src/pages/Settings.tsx](c:/Users/gabib/OneDrive/medase/src/pages/Settings.tsx)

## Estado atual

O `medase` ficou com:

- módulo de secretária funcional no frontend
- agenda com calendário e lista
- tela de pacientes da secretária
- edição e visualização de consultas
- detalhes clínicos do paciente expandidos
- login e cadastro conectados ao backend real

## Pendências conhecidas

- a tela `Configurações > Usuários` ainda usa mock local
- o cadastro unificado ainda cria o usuário base no backend, sem orquestrar automaticamente criação da entidade específica de `secretaria` ou `medico`
- o fluxo depende de o backend estar corretamente iniciado, com migration aplicada e CORS ativo
