# DEV-03

## Escopo

Esta documentação cobre o que foi implementado no frontend `medase` durante a DEV-03, com foco em:

- integração do CRUD de pacientes com o backend
- integração das abas clínicas do paciente
- integração com catálogos de exames e medicamentos
- anexo de exame com persistência e download
- ajustes de UX no módulo clínico do paciente

## Arquivos alterados

- [patient-api.ts](c:/Users/gabib/OneDrive/medase/src/lib/patient-api.ts)
- [patient-clinical-api.ts](c:/Users/gabib/OneDrive/medase/src/lib/patient-clinical-api.ts)
- [types.ts](c:/Users/gabib/OneDrive/medase/src/lib/types.ts)
- [PatientList.tsx](c:/Users/gabib/OneDrive/medase/src/pages/PatientList.tsx)
- [SecretaryPatients.tsx](c:/Users/gabib/OneDrive/medase/src/pages/SecretaryPatients.tsx)
- [PatientForm.tsx](c:/Users/gabib/OneDrive/medase/src/pages/PatientForm.tsx)
- [PatientDetails.tsx](c:/Users/gabib/OneDrive/medase/src/pages/PatientDetails.tsx)
- [SecretaryDashboard.tsx](c:/Users/gabib/OneDrive/medase/src/pages/SecretaryDashboard.tsx)
- [DoctorAgenda.tsx](c:/Users/gabib/OneDrive/medase/src/pages/DoctorAgenda.tsx)

## Integração de pacientes

Foi criado o cliente [patient-api.ts](c:/Users/gabib/OneDrive/medase/src/lib/patient-api.ts) para consumir o backend real de pacientes.

### Responsabilidades

- enviar `Authorization: Bearer <token>`
- consumir:
  - `GET /pacientes/`
  - `GET /pacientes/{id}`
  - `POST /pacientes/`
  - `PUT /pacientes/{id}`
  - `DELETE /pacientes/{id}`
- mapear o contrato do backend para o tipo `Patient` do frontend

### Telas integradas

- [PatientList.tsx](c:/Users/gabib/OneDrive/medase/src/pages/PatientList.tsx)
- [SecretaryPatients.tsx](c:/Users/gabib/OneDrive/medase/src/pages/SecretaryPatients.tsx)
- [PatientForm.tsx](c:/Users/gabib/OneDrive/medase/src/pages/PatientForm.tsx)
- [PatientDetails.tsx](c:/Users/gabib/OneDrive/medase/src/pages/PatientDetails.tsx)

## Integração clínica do paciente

Foi criado o cliente [patient-clinical-api.ts](c:/Users/gabib/OneDrive/medase/src/lib/patient-clinical-api.ts) para consumir:

- histórico clínico do paciente
- exames do paciente
- medicamentos do paciente
- catálogo de exames
- catálogo de medicamentos

### Endpoints consumidos

#### Histórico clínico

- `GET /pacientes/{patientId}/historico-clinico`
- `POST /pacientes/{patientId}/historico-clinico`
- `PUT /pacientes/{patientId}/historico-clinico/{historyId}`
- `DELETE /pacientes/{patientId}/historico-clinico/{historyId}`

#### Exames do paciente

- `GET /pacientes/{patientId}/exames`
- `POST /pacientes/{patientId}/exames`
- `PUT /pacientes/{patientId}/exames/{examId}`
- `DELETE /pacientes/{patientId}/exames/{examId}`

#### Medicamentos do paciente

- `GET /pacientes/{patientId}/medicamentos`
- `POST /pacientes/{patientId}/medicamentos`
- `PUT /pacientes/{patientId}/medicamentos/{medicationId}`
- `DELETE /pacientes/{patientId}/medicamentos/{medicationId}`

#### Catálogos

- `GET /exames/`
- `POST /exames/`
- `GET /medicamentos/`
- `POST /medicamentos/`

## Tela de detalhes do paciente

A tela [PatientDetails.tsx](c:/Users/gabib/OneDrive/medase/src/pages/PatientDetails.tsx) foi ampliada para operar com backend real.

### Abas

- `Histórico`
- `Exames`
- `Medicamentos`

### Regras por perfil

- `médico` acessa histórico clínico detalhado, exames e medicamentos do paciente
- `secretária` continua com bloqueio visual dessas áreas clínicas detalhadas
- a restrição visual do frontend acompanha a restrição real do backend

## Fluxo de histórico clínico

Na aba `Histórico`, o médico pode:

- listar registros
- criar registro
- editar registro
- excluir registro

Campos manipulados:

- `titulo`
- `descricao`
- `data_registro`

## Fluxo de exames do paciente

Na aba `Exames`, o médico pode:

- listar exames vinculados ao paciente
- criar exame
- editar exame
- excluir exame

### Modos de criação

- selecionar um exame já existente no catálogo
- criar um novo exame no catálogo dentro do modal

### Campos utilizados no frontend

- `nome`
- `data_exame`
- `status`
- `resultado`
- `descricao`
- `observacoes`
- `pdf_nome`
- `pdf_url`

### Ajustes feitos

#### Persistência e edição

O shape de exame no frontend foi corrigido em [types.ts](c:/Users/gabib/OneDrive/medase/src/lib/types.ts) e [patient-clinical-api.ts](c:/Users/gabib/OneDrive/medase/src/lib/patient-clinical-api.ts):

- `description` passou a representar `descricao`
- `observations` passou a representar `observacoes`
- `pdfUrl` passou a representar `pdf_url`

Isso corrigiu a perda de dados no modal de edição.

#### Modal de edição

Foi implementada lógica para:

- reencontrar o exame no catálogo quando existir
- preencher corretamente o modo `existing` ou `new`
- manter nome, descrição, observações e anexo ao editar

#### Upload de arquivo

No modal:

- o arquivo selecionado aparece em uma caixa visível
- existe botão `X` para remover o arquivo antes de salvar
- o arquivo é lido com `FileReader` e enviado ao backend como `pdf_url`

#### Download do anexo

Na listagem:

- o anexo é exibido como link real com `download`
- isso substituiu `window.open`
- objetivo: evitar bloqueio de popup pelo navegador

#### Badge de status

O status do exame deixou de usar o badge arredondado padrão e passou a usar um visual mais quadrado, consistente com o restante da UI clínica.

## Fluxo de medicamentos do paciente

Na aba `Medicamentos`, o médico pode:

- listar medicamentos vinculados ao paciente
- criar medicamento
- editar medicamento
- excluir medicamento

### Modos de criação

- selecionar medicamento existente no catálogo
- criar novo medicamento no catálogo dentro do modal

### Campos utilizados no frontend

- `nome`
- `dosagem`
- `periodo`
- `status`
- `descricao`
- `observacoes`

## Relaxamento de obrigatoriedade no frontend

Após ajuste de UX em [PatientDetails.tsx](c:/Users/gabib/OneDrive/medase/src/pages/PatientDetails.tsx):

- em `Exame`, o único obrigatório do fluxo passou a ser o `nome`
- em `Medicamento`, o único obrigatório do fluxo passou a ser a `seleção do medicamento` existente ou o `nome` ao criar um novo

Os demais campos deixaram de bloquear o salvamento e são enviados como vazio/null quando não preenchidos.

## Agendas e uso da base real de pacientes

As telas:

- [SecretaryDashboard.tsx](c:/Users/gabib/OneDrive/medase/src/pages/SecretaryDashboard.tsx)
- [DoctorAgenda.tsx](c:/Users/gabib/OneDrive/medase/src/pages/DoctorAgenda.tsx)

foram ajustadas para operar sobre a base real de pacientes, em vez de depender apenas de mock local.

## Token e autenticação

Toda a integração desta DEV-03 assume o token gerado no login real já implementado anteriormente.

### Comportamento

- o token é obtido no login
- o token é salvo localmente
- `patient-api.ts` e `patient-clinical-api.ts` leem esse token
- cada requisição protegida envia `Authorization: Bearer <token>`

## Dependências da DEV-03

Para a DEV-03 funcionar corretamente, o backend precisa:

- estar rodando com as migrations aplicadas
- ter as rotas de pacientes, histórico clínico, exames e medicamentos disponíveis
- ter o campo `pdf_url` já presente na tabela `paciente_exames`

## Validações executadas

Durante a implementação, foi validado:

- `npm run build`

O build do `medase` compilou com sucesso após os ajustes da DEV-03.
