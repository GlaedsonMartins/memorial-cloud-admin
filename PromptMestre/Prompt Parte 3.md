# MEMORIAL CLOUD

# PROMPT MESTRE — MEMORIAL ADMIN

## PARTE 3 — ARQUITETURA TÉCNICA, FIREBASE E PADRÕES DE DESENVOLVIMENTO

# ARQUITETURA GERAL

O Memorial Admin será o único sistema responsável por gravar, alterar e remover dados do Memorial Cloud.

O Memorial Player será apenas um consumidor dessas informações.

Toda regra de negócio deverá existir exclusivamente no Memorial Admin.

O Player nunca poderá conter regras de negócio.

---

# FIREBASE

Utilizar exclusivamente:

* Firebase Authentication
* Cloud Firestore
* Firebase Storage
* Firebase Hosting
* Cloud Functions (quando necessário)
* App Check
* Firestore Offline Persistence

Nunca utilizar outro banco de dados.

Nunca utilizar SQL.

Nunca utilizar APIs próprias para sincronização.

---

# ORGANIZAÇÃO DO FIRESTORE

O banco deve ser organizado de forma simples e escalável.

Criar coleções específicas para:

* Usuários (Administradores)
* Salas
* Homenagens
* Playlists
* Configurações
* Status dos Players
* Histórico

Evitar documentos excessivamente grandes.

Normalizar as informações sempre que possível.

Armazenar no Firestore apenas dados estruturados e referências às mídias.

---

# FIREBASE STORAGE

Todo arquivo deve ser armazenado no Storage.

Tipos permitidos:

* Fotos
* Vídeos
* Músicas
* Logos da funerária
* Imagens institucionais

Nunca armazenar arquivos em Base64.

Nunca armazenar binários dentro do Firestore.

---

# ESTRUTURA DAS MÍDIAS

Cada homenagem possuirá sua própria organização de arquivos.

Separar claramente:

Fotos

Vídeos

Playlist

Manter nomenclatura consistente.

Evitar duplicação de arquivos.

---

# REGRAS DAS HOMENAGENS

Cada sala poderá possuir apenas uma homenagem ativa.

Uma homenagem somente poderá assumir estados válidos.

Exemplos:

Criada

Ativa

Encerrada

Excluída

Nunca permitir estados inválidos.

---

# SINCRONIZAÇÃO

Toda alteração realizada pelo Memorial Admin deverá refletir automaticamente no Memorial Player.

Utilizar exclusivamente Snapshot Listeners.

Nunca utilizar polling.

Nunca exigir atualização manual.

---

# CACHE

O sistema deve considerar que os Players poderão ficar temporariamente sem internet.

Toda mídia enviada deverá estar preparada para funcionamento offline.

Ao restabelecer a conexão:

Sincronizar automaticamente.

---

# TRATAMENTO DE ERROS

Todo acesso ao Firebase deve possuir tratamento de erro.

Toda operação crítica deve possuir feedback visual ao administrador.

Nunca deixar o sistema em estado inconsistente.

Caso uma operação falhe:

Permitir nova tentativa.

Nunca perder informações.

---

# ESTRUTURA DO PROJETO

Organizar o projeto por responsabilidade.

Exemplo:

* app
* components
* features
* hooks
* lib
* services
* firebase
* types
* utils
* contexts
* styles

Evitar componentes gigantes.

Evitar funções muito longas.

Criar módulos reutilizáveis.

---

# COMPONENTIZAÇÃO

Cada componente deve possuir apenas uma responsabilidade.

Evitar lógica complexa dentro das páginas.

Criar componentes reutilizáveis para:

Cards

Botões

Modais

Formulários

Uploads

Listagens

Indicadores

Estados

---

# HOOKS

Toda lógica reutilizável deverá ser extraída para Hooks.

Evitar repetição.

Separar claramente interface e lógica.

---

# SERVICES

Toda comunicação com o Firebase deverá ocorrer através de Services.

Nunca acessar Firebase diretamente dentro dos componentes.

---

# TIPAGEM

Utilizar TypeScript rigorosamente.

Evitar any.

Criar interfaces e tipos bem definidos.

Compartilhar modelos entre módulos quando apropriado.

---

# PADRÕES DE CÓDIGO

Criar código limpo.

Criar código legível.

Criar código desacoplado.

Evitar duplicação.

Utilizar nomes claros.

Seguir princípios SOLID sempre que aplicável.

---

# RESPONSIVIDADE

O Memorial Admin deverá funcionar perfeitamente em:

Desktop

Notebook

Tablet

Não é prioridade para smartphones, mas o layout não deve quebrar em telas menores.

---

# PERFORMANCE

Carregar apenas as informações necessárias.

Utilizar paginação quando necessário.

Evitar leituras desnecessárias no Firestore.

Utilizar lazy loading para módulos pesados.

Pré-carregar apenas recursos essenciais.

---

# SEGURANÇA

Utilizar Firebase Authentication para proteger todas as rotas administrativas.

Criar regras de segurança no Firestore e no Storage.

Nenhum usuário não autenticado poderá acessar dados administrativos.

---

# LOGS

Registrar erros críticos.

Registrar falhas de upload.

Registrar falhas de sincronização.

Facilitar futuras manutenções.

---

# ESCALABILIDADE

Embora o sistema seja destinado inicialmente a uma única funerária com seis salas, toda a arquitetura deve ser preparada para crescimento.

Evitar qualquer implementação que limite futuras expansões.

---

# BOAS PRÁTICAS

Sempre preferir soluções simples.

Sempre priorizar estabilidade.

Sempre manter consistência entre componentes.

Sempre reutilizar código.

Sempre documentar decisões importantes.

---

# O QUE NUNCA FAZER

Nunca alterar a arquitetura sem autorização.

Nunca substituir Firebase por outra tecnologia.

Nunca mover regras de negócio para o Player.

Nunca criar sincronização manual.

Nunca armazenar arquivos dentro do Firestore.

Nunca quebrar a separação entre interface, lógica e serviços.

Nunca implementar funcionalidades fora do escopo sem justificativa.

---

# DEFINIÇÃO DE SUCESSO

O Memorial Admin será considerado concluído quando permitir:

* autenticação de administradores;
* gerenciamento das seis salas;
* criação, edição, encerramento e exclusão de homenagens;
* upload de fotos e vídeos;
* gerenciamento de playlists;
* monitoramento em tempo real dos Players;
* sincronização automática via Firebase;
* configuração da identidade visual da funerária;
* histórico de homenagens.

Todo o desenvolvimento deverá seguir rigorosamente este documento como referência principal.
