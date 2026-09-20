# Sessões administrativas

O login usa persistência local do Firebase. Um identificador salvo no navegador representa
o perfil daquele navegador; abas compartilham o identificador e as operações de autenticação
usam Web Locks quando disponíveis. Outro navegador, perfil ou origem do site é outro dispositivo.
Limpar os dados do site ou usar navegação privada pode remover a persistência.

O último email autenticado fica salvo localmente, mesmo após sair. A senha não é salva pelo aplicativo.

## Registros e desconexão

- Banco existente: `memorialcloud` (Enterprise, Native API, atualizações em tempo real).
- Caminho: `admin_sessions/{uid}/devices/{deviceId}`.
- Campos: `deviceId`, `sessionId`, `browser`, `system`, `state`, `createdAt`, `lastSeen`, `endedAt`.
- `syncAdminDeviceSession` registra/migra ou retoma o login e atualiza a atividade.
- `endAdminDeviceSession` encerra somente a geração de sessão selecionada, de forma idempotente.
- Somente o proprietário administrativo ativo pode ler; gravações diretas pelo cliente são negadas.
- Os registros encerrados permanecem para impedir que uma retomada os reative automaticamente.
- Novo login explícito substitui a sessão daquele navegador. Sessões existentes são migradas ao abrir o painel.

A interface usa snapshots em tempo real porque precisa observar a desconexão remota, além da
validação a cada minuto e ao recuperar foco/conexão. Navegador fechado continua listado como
conectado, com a data do último acesso; essa lista não representa presença online.

Esta funcionalidade encerra o acesso pelo aplicativo ao sincronizar/reabrir. Conforme o escopo
aprovado, não revoga refresh tokens nem altera a autorização de todos os serviços do Firebase.
Os dispositivos Memorial Player continuam na coleção `devices`, separados desta funcionalidade.

## Verificação

```powershell
npm.cmd test
node node_modules/typescript/bin/tsc --noEmit
npm.cmd run build:firebase
```

Os testes de integração exigem o emulador Firestore em `127.0.0.1:8180`, com Java 21,
projeto `demo-memorial-sessions`, edição Enterprise e as regras de `firestore.rules`.
Use `-Duser.language=en -Duser.country=US` no Java para evitar o erro de mensagens
localizadas do emulador 1.22.0. Os testes recusam conexão fora do emulador local.

```powershell
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8180'
npm.cmd run test:sessions
```

Cobertura: migração concorrente entre abas, dispositivos independentes, encerramento e novo
login, requisição atrasada de encerramento, isolamento de contas, regras de leitura/escrita,
acesso dos Players, indisponibilidade de rede e armazenamento local.

## Publicação

O build comum mantém o destino existente. `build:firebase` gera o shell SPA `index.html`
necessário ao rewrite do Firebase Hosting, usando o servidor Node apenas para pré-renderização.

Publicar primeiro o backend e confirmar que ambas as funções estão ativas:

```powershell
firebase.cmd deploy --only "functions:syncAdminDeviceSession,functions:endAdminDeviceSession,firestore:rules" --project memorial-cloud-5da8e
npm.cmd run build:firebase
firebase.cmd deploy --only hosting --project memorial-cloud-5da8e
```

`validateAdminSession` permanece disponível para versões anteriores do frontend.
