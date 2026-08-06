# MEMORIAL CLOUD

# GUIA DE INTEGRAÇÃO

## CONTRATO ENTRE MEMORIAL ADMIN E MEMORIAL PLAYER

# PARTE 2 — MÍDIAS, COMANDOS, SINCRONIZAÇÃO E CACHE

---

# PRINCÍPIO DE COMUNICAÇÃO

O Memorial Admin nunca envia comandos diretamente para o Player.

O Admin apenas altera documentos no Firestore.

O Player observa esses documentos e reage automaticamente.

Fluxo:

```
Memorial Admin

      ↓

Atualização Firestore

      ↓

Snapshot Listener

      ↓

Memorial Player

      ↓

Execução
```

---

# ESTRUTURA DAS MÍDIAS

Todas as mídias possuem uma referência dentro da homenagem.

O Firestore guarda somente:

* Nome do arquivo.
* Tipo.
* URL.
* Ordem.
* Data de criação.

O arquivo físico fica no Firebase Storage.

---

# ESTRUTURA DE FOTOS

Dentro da homenagem:

```text
photos
[
 {
   id,
   name,
   url,
   type,
   order,
   createdAt
 }
]
```

Exemplo:

```json
{
"id":"foto001",
"name":"joao.jpg",
"url":"storage-url",
"type":"image",
"order":1
}
```

---

# REGRAS DAS FOTOS

Quantidade máxima:

20 fotos.

Formatos:

* JPG
* PNG
* WEBP

A ordem deve ser respeitada.

Nunca:

* embaralhar;
* ordenar por nome;
* ordenar por tamanho;
* alterar automaticamente.

A ordem é definida pelo administrador.

---

# ESTRUTURA DE VÍDEOS

Dentro da homenagem:

```text
videos
[
 {
   id,
   name,
   url,
   duration,
   order,
   createdAt
 }
]
```

Exemplo:

```json
{
"id":"video001",
"name":"homenagem.mp4",
"url":"storage-url",
"duration":60,
"order":1
}
```

---

# REGRAS DOS VÍDEOS

Limite:

1 minuto.

O Player deve:

* reproduzir o vídeo completo;
* utilizar o áudio original;
* respeitar a ordem definida.

Nunca cortar o vídeo.

---

# FILA DE REPRODUÇÃO

O Player deve criar uma fila única.

Exemplo:

```
Foto 01

Foto 02

Vídeo 01

Foto 03

Vídeo 02
```

A ordem é:

1. Fotos.
2. Vídeos.

Conforme cadastrados.

---

# COMPORTAMENTO DO LOOP

Quando chegar ao final:

Retornar ao primeiro item.

Nunca parar.

Nunca fechar a apresentação.

A reprodução continuará até receber o comando de encerramento.

---

# CONFIGURAÇÃO DO SLIDE

O Admin envia:

```text
slideDuration
```

Valores permitidos:

```
5
8
10
```

O Player nunca deve aceitar outros valores.

Caso receba valor inválido:

Utilizar 5 segundos como padrão.

---

# PLAYLIST MUSICAL

A playlist é vinculada através do:

```
playlistId
```

O Player busca a playlist correspondente.

---

# REGRAS DA PLAYLIST

A playlist deve:

* iniciar automaticamente;
* tocar em sequência;
* continuar em loop.

Nunca:

* tocar sempre a mesma música;
* escolher músicas aleatórias;
* parar após terminar.

---

# CONTROLE DE ÁUDIO

Quando uma foto estiver sendo exibida:

Música continua normalmente.

Quando um vídeo iniciar:

```
PAUSAR MÚSICA
```

Executar:

```
ÁUDIO DO VÍDEO
```

Quando terminar:

```
RETOMAR MÚSICA
```

---

# SESSÃO ATIVA

O Player não observa diretamente a homenagem.

Ele observa:

```
active_sessions
```

A sessão contém tudo necessário para reprodução.

---

# ESTRUTURA DA SESSÃO

Exemplo:

```json
{
"roomId":"01",
"tributeId":"123",
"status":"PLAYING",
"playlistId":"catolica01",
"slideDuration":8,
"updatedAt":"timestamp"
}
```

---

# COMANDOS DA SESSÃO

A sessão poderá gerar os seguintes comandos:

## START

Iniciar apresentação.

---

## UPDATE

Atualizar informações.

Exemplo:

* nova foto;
* alteração de playlist;
* alteração de tempo.

---

## END

Encerrar apresentação.

---

# ATUALIZAÇÃO DURANTE EXECUÇÃO

Caso o Admin adicione uma nova foto:

O Player deve:

1. Receber atualização.
2. Comparar lista atual.
3. Adicionar novo item.
4. Continuar reprodução atual.

Nunca reiniciar a apresentação.

---

# REMOÇÃO DE MÍDIA

Caso uma mídia seja removida:

Se ainda não iniciou:

Remover da fila.

Se está sendo exibida:

Aguardar finalizar.

Depois remover.

---

# CACHE LOCAL

O Player deverá manter cache local das mídias.

Objetivo:

Permitir funcionamento sem internet.

---

# ESTRATÉGIA DE CACHE

Ao receber uma nova sessão:

Verificar:

```
Arquivo existe localmente?
```

Se sim:

Utilizar cache.

Se não:

Baixar Storage.

---

# INTERNET OFFLINE

Caso a internet caia:

Continuar:

* fotos;
* vídeos;
* músicas.

Não interromper.

Não mostrar erro.

---

# RETORNO DA INTERNET

Quando reconectar:

Executar:

1. Reconectar Firebase.
2. Atualizar Snapshot.
3. Comparar sessão atual.
4. Baixar novas mídias.
5. Remover arquivos antigos quando permitido.

---

# CONTROLE DE VERSÃO

Cada documento principal deverá possuir:

```
schemaVersion
```

Exemplo:

```json
{
"schemaVersion":1
}
```

Objetivo:

Permitir evolução futura sem quebrar Players antigos.

---

# COMPATIBILIDADE

Antes de executar uma sessão:

O Player deve verificar:

* versão do schema;
* existência das mídias;
* validade dos dados.

Caso incompatível:

Registrar erro.

Nunca travar.

---

# REGRA PRINCIPAL

O Player deve sempre conseguir responder:

"Qual é a sessão ativa desta sala?"

E então:

"Consigo reproduzir essa sessão?"

Se sim:

Executar.

Se não:

Recuperar dados ou exibir tela institucional.

---

# RESULTADO ESPERADO

O contrato de mídia garante que:

* o Admin controla tudo;
* o Player apenas executa;
* alterações chegam em tempo real;
* falhas de internet não interrompem homenagens;
* novas mídias entram sem reiniciar;
* futuras versões poderão coexistir.
