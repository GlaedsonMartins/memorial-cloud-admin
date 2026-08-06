# MEMORIAL CLOUD

# GUIA DE INTEGRAÇÃO

## CONTRATO ENTRE MEMORIAL ADMIN E MEMORIAL PLAYER

# PARTE 3 — FLUXOS, SEGURANÇA, EVENTOS E CONCLUSÃO

---

# FLUXO COMPLETO DE UMA HOMENAGEM

Este é o fluxo oficial do sistema.

Nenhuma implementação deve fugir deste processo.

---

# ETAPA 1 — CRIAÇÃO

Administrador acessa o Memorial Admin.

Seleciona uma sala disponível.

Cria uma nova homenagem.

Informa:

* Nome do falecido.
* Fotos.
* Vídeos.
* Playlist.
* Tempo do slide.

---

# ETAPA 2 — ARMAZENAMENTO

O Memorial Admin:

1. Faz upload das mídias no Firebase Storage.
2. Obtém as URLs.
3. Cria o documento da homenagem.
4. Salva as referências no Firestore.

Resultado:

A homenagem existe, mas ainda não está sendo exibida.

---

# ETAPA 3 — INÍCIO DA HOMENAGEM

Quando o administrador clicar em iniciar:

O sistema deve:

1. Validar os dados.
2. Verificar se a sala está livre.
3. Criar uma Active Session.
4. Alterar o status da sala.
5. Informar ao Player.

---

# ETAPA 4 — RECEBIMENTO PELO PLAYER

O Player:

1. Recebe atualização do Firestore.
2. Identifica sua sala.
3. Busca a sessão ativa.
4. Verifica mídias.
5. Baixa arquivos necessários.
6. Inicia apresentação.

---

# ETAPA 5 — EXECUÇÃO

Durante a homenagem:

O Player:

* Executa fotos.
* Executa vídeos.
* Controla áudio.
* Mantém playlist.
* Atualiza heartbeat.
* Monitora conexão.

---

# ETAPA 6 — ENCERRAMENTO

Quando o administrador encerrar:

O sistema:

1. Atualiza a sessão.
2. Altera status para encerrada.
3. Player recebe evento.
4. Reprodução é finalizada.
5. Tela institucional aparece.

---

# EVENTOS DO SISTEMA

Os eventos representam mudanças importantes.

---

# EVENTO: HOMENAGEM_INICIADA

Origem:

Memorial Admin.

Destino:

Memorial Player.

Ação:

Iniciar apresentação.

---

# EVENTO: HOMENAGEM_ATUALIZADA

Origem:

Memorial Admin.

Destino:

Memorial Player.

Ação:

Sincronizar alterações.

Exemplos:

* Nova foto.
* Novo vídeo.
* Nova playlist.
* Novo tempo.

---

# EVENTO: HOMENAGEM_ENCERRADA

Origem:

Memorial Admin.

Destino:

Memorial Player.

Ação:

Finalizar reprodução.

---

# EVENTO: PLAYER_ONLINE

Origem:

Memorial Player.

Destino:

Firebase.

Ação:

Atualizar status.

---

# EVENTO: PLAYER_OFFLINE

Origem:

Sistema de monitoramento.

Destino:

Memorial Admin.

Ação:

Gerar alerta.

---

# SEGURANÇA DO FIREBASE

A segurança deve respeitar a separação entre sistemas.

---

# ADMIN

Pode:

Ler dados administrativos.

Criar homenagens.

Editar homenagens.

Excluir homenagens.

Gerenciar playlists.

Alterar configurações.

---

# PLAYER

Pode:

Ler apenas informações necessárias.

Atualizar somente seu próprio status.

Nunca modificar homenagens.

Nunca modificar sessões.

Nunca modificar playlists.

---

# REGRAS DE ACESSO

Usuários não autenticados:

Sem acesso.

Administradores:

Acesso completo.

Players:

Acesso limitado ao funcionamento.

---

# PROTEÇÃO DO STORAGE

Arquivos devem possuir regras.

Admin:

Pode enviar.

Pode remover.

Player:

Pode apenas ler arquivos necessários.

---

# MONITORAMENTO DOS PLAYERS

Cada Player deverá enviar heartbeat.

Exemplo:

```json
{
"playerId":"tv01",
"roomId":"01",
"online":true,
"lastHeartbeat":"timestamp",
"currentState":"PLAYING"
}
```

---

# CONSIDERAR OFFLINE

Um Player será considerado offline quando:

Não enviar heartbeat dentro do intervalo definido.

O intervalo deve ser configurável.

---

# RECUPERAÇÃO

Caso um Player fique offline:

Quando retornar:

Deve:

* Reconectar Firebase.
* Recuperar sessão ativa.
* Restaurar reprodução.
* Atualizar status.

---

# FUTURO — APLICATIVO DA FAMÍLIA

O sistema deverá estar preparado para uma futura expansão.

Será criado um aplicativo separado.

A única função será:

Permitir que uma pessoa envie uma mensagem de homenagem.

Dados enviados:

* Nome de quem escreveu.
* Mensagem.

---

# FLUXO FUTURO

Aplicativo:

↓

Firebase

↓

Aprovação do administrador

↓

Sessão ativa

↓

Player

↓

Exibição na TV

---

# REGRA FUTURA

Essa funcionalidade não deve alterar o funcionamento atual.

O Player deve ser preparado para futuramente receber mensagens adicionais.

---

# VERSIONAMENTO

Todos os documentos principais devem possuir:

```text
schemaVersion
```

Quando uma alteração estrutural acontecer:

Criar nova versão.

Nunca quebrar Players existentes.

---

# PADRÃO DE NOMES

Utilizar nomes consistentes.

Coleções:

snake_case.

Campos:

camelCase.

Exemplos:

```text
active_sessions

player_status

createdAt

updatedAt
```

---

# PADRÃO DE DATAS

Todos os horários devem utilizar:

Firebase Timestamp.

Nunca salvar datas como texto.

---

# PADRÃO DE IDS

Utilizar IDs gerados pelo Firebase.

Nunca utilizar nomes como identificadores.

---

# PRINCÍPIOS FINAIS

O Memorial Admin controla.

O Firebase sincroniza.

O Memorial Player executa.

Essa separação nunca deve ser quebrada.

---

# CRITÉRIOS DE INTEGRAÇÃO COMPLETA

A integração será considerada concluída quando:

* Admin cria uma homenagem.
* Firebase recebe os dados.
* Player identifica sua sessão.
* Player baixa mídias.
* Player inicia reprodução.
* Playlist funciona corretamente.
* Vídeos possuem áudio próprio.
* Alterações chegam em tempo real.
* Cache funciona offline.
* Reconexão funciona.
* Encerramento funciona.
* Dashboard identifica status dos Players.
* Nenhuma ação manual é necessária nas TVs.

---

# DOCUMENTO OFICIAL

Este documento é o contrato oficial entre Memorial Admin e Memorial Player.

Toda implementação deve respeitar estas regras.

Qualquer alteração futura deve preservar compatibilidade.

O objetivo final é construir um sistema confiável, simples, escalável e preparado para evolução.
