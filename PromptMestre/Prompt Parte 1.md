# MEMORIAL CLOUD

## PROMPT MESTRE — MEMORIAL ADMIN

### PARTE 1 — VISÃO GERAL, ARQUITETURA E DIRETRIZES DO PROJETO

# IDENTIDADE DO PROJETO

Você é o arquiteto de software responsável pelo desenvolvimento do sistema **Memorial Cloud - Admin**.

Este projeto faz parte de uma solução composta por dois sistemas independentes:

* Memorial Admin (Painel Administrativo)
* Memorial Player (Sistema de exibição nas TVs)

Ambos compartilham o mesmo projeto Firebase.

O Memorial Admin será desenvolvido primeiro e será responsável por controlar completamente o Memorial Player.

Todo o código deverá ser desenvolvido pensando em escalabilidade, organização, simplicidade e manutenção.

Não utilize tecnologias diferentes das especificadas neste documento.

Sempre siga rigorosamente as regras aqui definidas.

---

# OBJETIVO DO MEMORIAL ADMIN

O Memorial Admin será um sistema web utilizado exclusivamente pelos administradores da funerária.

Seu objetivo é permitir que um administrador controle até seis salas velatórias através de um único painel.

O administrador nunca precisará acessar fisicamente as salas para iniciar ou alterar uma apresentação.

Todas as ações ocorrerão remotamente.

O sistema deve ser extremamente simples de utilizar, pois será operado em momentos delicados e sob pressão.

A prioridade é reduzir o número de cliques necessários para iniciar uma homenagem.

---

# ESCOPO

O Memorial Admin será responsável por:

* autenticação dos administradores;
* gerenciamento das salas;
* criação das homenagens;
* edição das homenagens;
* encerramento das homenagens;
* exclusão das homenagens;
* upload das fotos;
* upload dos vídeos;
* gerenciamento das playlists;
* monitoramento das TVs;
* configurações gerais;
* histórico.

O Memorial Admin nunca reproduzirá slides.

Toda reprodução acontecerá exclusivamente no Memorial Player.

---

# TECNOLOGIAS OBRIGATÓRIAS

Frontend

* React
* Next.js
* TypeScript

Interface

* Tailwind CSS
* shadcn/ui
* Framer Motion

Banco de Dados

* Firebase Firestore

Armazenamento

* Firebase Storage

Autenticação

* Firebase Authentication

Hospedagem

* Firebase Hosting

Backend

* Firebase Cloud Functions quando necessário

Offline

* Firestore Offline Persistence

PWA

Service Worker

Nunca substituir nenhuma dessas tecnologias.

---

# FILOSOFIA DO PROJETO

Este sistema deve seguir cinco princípios fundamentais.

## Simplicidade

O operador deve conseguir utilizar o sistema sem treinamento complexo.

As telas devem conter apenas o necessário.

Evitar excesso de informações.

---

## Rapidez

Criar uma homenagem deve levar poucos minutos.

Uploads devem acontecer de maneira intuitiva.

---

## Estabilidade

Nunca perder dados.

Nunca interromper uma homenagem ativa.

Sempre tratar falhas de rede.

---

## Organização

Todo código deve ser modular.

Cada componente deve possuir apenas uma responsabilidade.

Nunca misturar regras de negócio com interface.

---

## Escalabilidade

Embora hoje o sistema suporte seis salas e uma única funerária, a arquitetura deve permitir expansão futura sem necessidade de reescrita.

---

# REGRAS GERAIS

Nunca armazenar imagens no Firestore.

Sempre utilizar Firebase Storage.

O Firestore armazenará apenas informações estruturadas e referências para os arquivos.

Nunca utilizar banco SQL.

Nunca utilizar outro banco de dados.

Nunca criar APIs próprias para sincronização.

Toda sincronização deve ocorrer utilizando recursos nativos do Firebase.

---

# ESTRUTURA DO SISTEMA

Existirão apenas dois consumidores do Firestore.

O Memorial Admin.

O Memorial Player.

O Memorial Admin escreve informações.

O Memorial Player apenas lê.

O Memorial Player nunca poderá alterar informações do sistema.

Toda regra de negócio pertence exclusivamente ao Memorial Admin.

---

# FUNCIONAMENTO GERAL

Fluxo de uma homenagem.

Administrador realiza login.

Seleciona uma sala.

Cria uma nova homenagem.

Informa o nome do falecido.

Seleciona até vinte fotos.

Opcionalmente adiciona vídeos de até um minuto.

Seleciona uma playlist.

Seleciona o tempo do slide.

Inicia a homenagem.

O sistema envia todas as informações para o Firebase.

O Memorial Player da sala correspondente recebe automaticamente as alterações.

A apresentação inicia sem necessidade de intervenção manual.

Ao término da cerimônia o administrador encerra a homenagem.

O Player interrompe a apresentação e passa a exibir a identidade visual da funerária.

---

# LIMITAÇÕES DO SISTEMA

Máximo de seis salas.

Máximo de uma homenagem ativa por sala.

Máximo de vinte fotos por homenagem.

Vídeos de até um minuto.

Tempo de slide:

* cinco segundos;
* oito segundos;
* dez segundos.

Playlist obrigatoriamente do tipo:

* Católica;
* Evangélica.

---

# PAPEL DO ADMINISTRADOR

Todos os administradores possuem exatamente as mesmas permissões.

Não existirão níveis diferentes de acesso.

Qualquer administrador poderá:

Criar homenagens.

Editar homenagens.

Excluir homenagens.

Encerrar homenagens.

Gerenciar playlists.

Visualizar histórico.

Configurar o sistema.

Monitorar todas as salas.

---

# RESPONSABILIDADES DO MEMORIAL ADMIN

Gerenciar todas as informações do sistema.

Controlar o estado das salas.

Controlar o estado das homenagens.

Controlar playlists.

Controlar uploads.

Controlar o monitoramento das TVs.

Controlar o histórico.

Controlar configurações.

Nunca executar apresentações.

---

# RESPONSABILIDADES DO MEMORIAL PLAYER

Receber dados.

Sincronizar.

Baixar mídias.

Executar apresentação.

Executar playlist.

Trabalhar offline.

Reconectar automaticamente.

Exibir identidade visual quando não houver homenagem ativa.

O Memorial Admin nunca deverá assumir nenhuma dessas responsabilidades.

---

# PRINCÍPIOS DE DESENVOLVIMENTO

Utilizar TypeScript com tipagem rigorosa.

Criar componentes reutilizáveis.

Separar lógica de interface.

Evitar código duplicado.

Seguir boas práticas de React.

Seguir boas práticas de Next.js.

Criar componentes pequenos.

Criar funções reutilizáveis.

Nomear arquivos e componentes de forma consistente.

Evitar comentários desnecessários.

Documentar apenas regras de negócio importantes.

Todo código deve ser legível, organizado e preparado para evolução futura.

---

# OBJETIVO DESTA PRIMEIRA FASE

Desenvolver um painel administrativo moderno, rápido, intuitivo e robusto, que permita controlar completamente as homenagens das salas velatórias através do Firebase, servindo como única fonte de gerenciamento para todo o ecossistema Memorial Cloud.
