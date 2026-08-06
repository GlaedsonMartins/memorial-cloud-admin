# Memorial Cloud Firebase Setup

## Projeto Atual

- Project ID: `memorial-cloud-5da8e`
- Firestore database ID: `memorialcloud`
- Web App: `Memorial Cloud Admin`

## Variaveis Locais

O arquivo `.env` local ja foi preenchido neste workspace. Para outro ambiente, use `.env.example` como base:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_ID=memorialcloud
```

## Produtos Necessarios

- Firebase Authentication com login por email/senha.
- Cloud Firestore usando o database `memorialcloud`.
- Firebase Storage com bucket inicial criado no Console.
- Um usuario administrador com custom claim `admin: true`, ou documento `users/{uid}` com `role: "ADMIN"` e `active: true`.

## Colecoes Usadas

- `rooms`
- `tributes`
- `active_sessions`
- `playlists`
- `player_status`
- `settings`
- `history`
- `users`

Ao entrar no Admin autenticado pela primeira vez, o app cria automaticamente:

- seis salas (`room-01` ate `room-06`);
- playlists base `CATOLICA` e `EVANGELICA`;
- documento `settings/general`.

Esse bootstrap exige permissao de admin. Para o primeiro acesso, defina custom claim `admin: true` no usuario inicial usando Admin SDK/Cloud Functions, ou crie manualmente em `users/{uid}`:

```json
{
  "name": "Administrador",
  "email": "email@exemplo.com",
  "role": "ADMIN",
  "active": true,
  "schemaVersion": 1
}
```

## Contrato Com O Player

O Admin escreve a sessao ativa em `active_sessions/{roomId}`. O Player deve observar esse documento com Snapshot Listener e reagir a:

- `status: PLAYING` para iniciar/atualizar;
- `status: ENDED` para encerrar;
- `lastUpdate` para sincronizar alteracoes sem reiniciar a homenagem.

Todos os arquivos ficam no Firebase Storage; o Firestore guarda somente URLs, metadados e `storagePath`.

## Deploy De Regras

Com o login feito e o projeto selecionado:

```sh
firebase.cmd deploy --only firestore:rules,storage
```

Em 05/08/2026, as regras do Firestore foram publicadas com sucesso em `memorialcloud`.
O deploy de Storage ficou pendente porque o bucket inicial ainda nao existe. Abra:

```text
https://console.firebase.google.com/project/memorial-cloud-5da8e/storage
```

Clique em `Get Started` para criar o bucket e depois rode:

```sh
firebase.cmd deploy --only storage --project memorial-cloud-5da8e
```
