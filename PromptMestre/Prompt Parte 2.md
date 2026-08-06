# MEMORIAL CLOUD

# PROMPT MESTRE — MEMORIAL ADMIN

## PARTE 2 — FUNCIONALIDADES DO PAINEL ADMINISTRATIVO

# OBJETIVO DO PAINEL

O Memorial Admin será o centro de controle de todo o sistema.

Nenhuma ação será realizada diretamente nas TVs.

Todo gerenciamento acontecerá exclusivamente através deste painel.

O sistema deve ser extremamente intuitivo.

O administrador deve conseguir criar uma homenagem em poucos cliques.

Sempre priorizar simplicidade.

Nunca adicionar telas desnecessárias.

---

# LOGIN

O acesso ao sistema ocorrerá através do Firebase Authentication.

Após autenticar o usuário:

Redirecionar automaticamente para o Dashboard.

Caso o usuário não esteja autenticado:

Redirecionar para a tela de Login.

Nunca permitir acesso às páginas internas sem autenticação.

---

# DASHBOARD

O Dashboard será a primeira tela do sistema.

Ele deverá apresentar uma visão geral das seis salas.

Cada sala deverá possuir um Card.

Cada Card deve conter:

* Nome da sala.
* Status da sala.
* Nome da homenagem ativa.
* Quantidade de fotos.
* Quantidade de vídeos.
* Playlist selecionada.
* Tempo do slide.
* Status do Player (Online/Offline).
* Última sincronização.
* Botão para gerenciar a sala.

Caso não exista homenagem:

Exibir claramente que a sala está livre.

---

# STATUS DAS SALAS

Cada sala poderá assumir apenas um estado.

Livre.

Homenagem Ativa.

Player Offline.

Sincronizando.

Esses estados devem ser representados visualmente.

---

# GERENCIAMENTO DAS SALAS

O sistema possuirá exatamente seis salas.

Cada sala será independente.

Cada sala poderá possuir apenas uma homenagem ativa.

Ao selecionar uma sala:

Abrir sua tela de gerenciamento.

---

# TELA DE GERENCIAMENTO

Esta tela será responsável por controlar completamente uma única sala.

Deverá permitir:

Criar homenagem.

Editar homenagem.

Encerrar homenagem.

Excluir homenagem.

Enviar fotos.

Enviar vídeos.

Selecionar playlist.

Alterar tempo do slide.

Visualizar status do Player.

Visualizar última sincronização.

---

# CRIAR HOMENAGEM

Ao criar uma homenagem solicitar:

Nome do falecido.

Fotos.

Vídeos opcionais.

Playlist.

Tempo do slide.

Observações.

Após salvar:

Enviar todos os dados para o Firebase.

A homenagem deverá permanecer inativa até o administrador clicar em "Iniciar".

---

# INICIAR HOMENAGEM

Ao iniciar:

Alterar o status da sala para "Homenagem Ativa".

Sincronizar automaticamente com o Player.

Nunca solicitar atualização manual.

---

# ENCERRAR HOMENAGEM

Ao encerrar:

Alterar o status da homenagem.

Informar ao Player que a sessão foi finalizada.

O Player deverá interromper a apresentação.

Após isso:

Exibir a identidade visual da funerária.

---

# EXCLUIR HOMENAGEM

A exclusão somente poderá ocorrer manualmente.

Ao excluir:

Remover informações do Firestore.

Remover arquivos do Firebase Storage.

Nunca deixar arquivos órfãos.

---

# UPLOAD DE FOTOS

Aceitar:

JPG.

PNG.

WEBP.

Quantidade máxima:

20 fotos.

O upload deverá permitir:

Selecionar múltiplos arquivos.

Arrastar e soltar.

Mostrar progresso do upload.

Mostrar miniaturas.

Após concluir:

Salvar automaticamente no Firebase Storage.

Salvar apenas as URLs no Firestore.

---

# UPLOAD DE VÍDEOS

Aceitar vídeos.

Limite:

1 minuto.

Permitir múltiplos uploads.

Mostrar progresso.

Salvar no Firebase Storage.

Salvar apenas a referência no Firestore.

---

# PLAYLISTS

O sistema possuirá uma biblioteca de playlists.

Categorias obrigatórias:

Católica.

Evangélica.

Cada playlist será composta por diversas músicas.

As músicas permanecerão armazenadas no Firebase Storage.

O administrador poderá:

Criar playlist.

Editar playlist.

Excluir playlist.

Adicionar músicas.

Remover músicas.

Selecionar playlist para uma homenagem.

Durante a reprodução:

As músicas deverão executar continuamente em loop.

Caso a playlist seja alterada durante uma homenagem:

A música atual deverá terminar.

A nova playlist iniciará automaticamente.

---

# TEMPO DOS SLIDES

Permitir apenas três opções.

5 segundos.

8 segundos.

10 segundos.

Esse valor será enviado ao Player.

---

# MONITORAMENTO

O Dashboard deverá monitorar constantemente todos os Players.

Exibir:

Player Online.

Player Offline.

Sincronizando.

Última conexão.

Última atualização.

Caso um Player fique offline:

Exibir alerta visual imediatamente.

---

# ATUALIZAÇÕES EM TEMPO REAL

Sempre utilizar Snapshot Listeners do Firestore.

Nunca utilizar polling.

Toda alteração realizada pelo administrador deverá aparecer automaticamente no Player correspondente.

---

# ALTERAÇÕES DURANTE A HOMENAGEM

Caso o administrador adicione novas fotos:

Adicionar ao final da fila.

Nunca reiniciar a apresentação.

Caso remova uma foto:

Se ainda não foi exibida:

Remover imediatamente.

Caso esteja sendo exibida:

Permitir finalizar o tempo atual.

Depois removê-la.

O mesmo comportamento deverá ocorrer para vídeos.

---

# HISTÓRICO

Todas as homenagens encerradas deverão permanecer registradas até que o administrador decida excluí-las.

Permitir pesquisa por:

Nome.

Sala.

Data.

Status.

---

# CONFIGURAÇÕES

Criar uma área para configurações gerais do sistema.

Entre elas:

Nome da funerária.

Logo da funerária.

Imagem padrão exibida quando não existir homenagem.

Configurações gerais do sistema.

Essas configurações serão utilizadas pelo Memorial Player.

---

# OBJETIVO DA EXPERIÊNCIA DO USUÁRIO

Todo o fluxo operacional deve exigir o menor número possível de cliques.

O administrador deve conseguir criar, iniciar e controlar uma homenagem rapidamente.

O sistema deve priorizar clareza, estabilidade e facilidade de uso.

Nenhuma funcionalidade deve depender de ações manuais nas TVs.

Todo o controle deve acontecer exclusivamente pelo Memorial Admin.
