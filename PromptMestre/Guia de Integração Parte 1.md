# MEMORIAL CLOUD

# GUIA DE INTEGRAÇÃO

## CONTRATO ENTRE MEMORIAL ADMIN E MEMORIAL PLAYER

# PARTE 1 — ARQUITETURA, FIREBASE E ESTRUTURA GERAL

---

# OBJETIVO DESTE DOCUMENTO

Este documento define como os sistemas:

* Memorial Admin
* Memorial Player

devem se comunicar.

Ele é a fonte oficial das regras de integração.

Nenhum dos dois sistemas deve criar estruturas próprias fora deste padrão.

Toda alteração futura deverá manter compatibilidade com este contrato.

---

# ARQUITETURA GERAL

O Memorial Cloud será dividido em dois sistemas independentes.

## Memorial Admin

Responsável por:

* Criar homenagens.
* Gerenciar salas.
* Enviar mídias.
* Gerenciar playlists.
* Controlar sessões.
* Configurar identidade visual.
* Monitorar Players.

O Admin escreve dados.

---

## Memorial Player

Responsável por:

* Ler dados.
* Baixar mídias.
* Executar apresentações.
* Informar seu status.

O Player somente consome dados.

---

# FLUXO PRINCIPAL

A comunicação seguirá este fluxo:

```
Administrador

      ↓

Memorial Admin

      ↓

Firebase

      ↓

Sessão Ativa

      ↓

Memorial Player

      ↓

Televisão
```

O Player nunca conversa diretamente com o Admin.

Toda comunicação obrigatoriamente passa pelo Firebase.

---

# PRINCÍPIO FUNDAMENTAL

O Firebase é a única fonte oficial de verdade do sistema.

Caso exista conflito entre informações locais do Player e informações do Firebase:

O Firebase sempre vence.

---

# PROJETO FIREBASE

Utilizar:

* Firebase Authentication
* Cloud Firestore
* Firebase Storage
* Firebase Hosting
* Firebase Cloud Functions quando necessário

---

# FIRESTORE

O Firestore será responsável por armazenar:

* Usuários.
* Salas.
* Homenagens.
* Sessões ativas.
* Playlists.
* Configurações.
* Status dos Players.
* Histórico.

---

# STORAGE

O Firebase Storage será responsável por armazenar:

* Fotos.
* Vídeos.
* Músicas.
* Logos.
* Imagens institucionais.

Nunca armazenar arquivos diretamente no Firestore.

---

# ESTRUTURA PRINCIPAL DO FIRESTORE

A estrutura base será:

```
/
├── users
│
├── rooms
│
├── tributes
│
├── active_sessions
│
├── playlists
│
├── player_status
│
├── settings
│
└── history
```

---

# COLEÇÃO USERS

Responsável pelos administradores.

Exemplo:

```
users
 |
 └── userId
```

Campos:

```
name
email
createdAt
active
```

Todos os usuários possuem o mesmo nível de acesso.

Não existirão cargos diferentes.

---

# COLEÇÃO ROOMS

Representa as salas físicas da funerária.

Cada sala possui exatamente um Player.

Exemplo:

```
rooms
 |
 └── roomId
```

Campos:

```
name

number

playerId

active

createdAt
```

Exemplo:

```
Sala 01

Sala 02

Sala 03

...

Sala 06
```

---

# REGRAS DAS SALAS

Obrigatório:

* Máximo de 6 salas.
* Uma sala possui apenas um Player.
* Uma sala possui apenas uma sessão ativa.
* Uma sala nunca pode executar duas homenagens simultaneamente.

---

# COLEÇÃO TRIBUTES

Representa uma homenagem criada pelo administrador.

Exemplo:

```
tributes
 |
 └── tributeId
```

Campos principais:

```
name

roomId

photos

videos

playlistId

slideDuration

createdAt

createdBy

status
```

---

# RESPONSABILIDADE DAS TRIBUTES

A homenagem representa os dados permanentes.

Ela não representa o que está sendo reproduzido naquele momento.

Ela contém:

* Informações do ente querido.
* Lista de mídias.
* Preferências.
* Configurações.

---

# COLEÇÃO ACTIVE_SESSIONS

Esta é a camada criada para comunicação com o Player.

Ela representa a reprodução atual.

Exemplo:

```
active_sessions
 |
 └── roomId
```

Campos:

```
roomId

tributeId

status

startedAt

endedAt

playlistId

slideDuration

lastUpdate
```

---

# RESPONSABILIDADE DA ACTIVE_SESSION

A sessão informa ao Player:

"O que deve estar acontecendo agora."

Exemplo:

```
Sala 01

Sessão ativa

Homenagem João Silva

Playlist Católica

Slide 8 segundos

Status reproduzindo
```

---

# ESTADOS DA SESSÃO

A sessão poderá possuir:

```
WAITING

PLAYING

ENDING

ENDED
```

---

# FLUXO DE CRIAÇÃO

Quando o administrador cria uma homenagem:

1. Criar Tribute.
2. Fazer upload das mídias.
3. Salvar referências.
4. Criar Active Session.
5. Alterar sala para ativa.
6. Player recebe atualização.

---

# FLUXO DE ENCERRAMENTO

Quando o administrador encerra:

1. Atualizar Active Session.
2. Alterar status para ENDED.
3. Player recebe comando.
4. Player interrompe apresentação.
5. Player exibe logo da funerária.

---

# COLEÇÃO PLAYLISTS

Responsável pela biblioteca musical.

Estrutura:

```
playlists

   └── playlistId
```

Campos:

```
name

category

tracks

createdAt
```

Categorias:

```
CATOLICA

EVANGELICA
```

---

# TRACKS

Cada música terá:

```
name

url

duration

order
```

A ordem deve ser preservada.

---

# COLEÇÃO PLAYER_STATUS

Responsável pelo monitoramento.

Cada Player possuirá um documento.

Exemplo:

```
player_status

      └── playerId
```

Campos:

```
roomId

online

lastHeartbeat

currentState

appVersion

lastSync
```

---

# HEARTBEAT

Cada Player deve enviar sinais periódicos informando que está ativo.

Caso o heartbeat pare:

O Admin deverá considerar o Player offline.

---

# COLEÇÃO SETTINGS

Configurações gerais.

Campos:

```
companyName

logoUrl

defaultScreen

updatedAt
```

Essas informações serão utilizadas quando não existir homenagem ativa.

---

# REGRA FINAL DE INTEGRAÇÃO

O Memorial Admin cria e controla.

O Firebase armazena e sincroniza.

O Memorial Player executa.

Nenhum sistema deve ultrapassar sua responsabilidade.
