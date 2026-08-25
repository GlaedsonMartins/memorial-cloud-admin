# Funeral Tribute Manager

Atue como um Designer UI/UX e Desenvolvedor Frontend Sênior. Crie uma aplicação Web moderna, sóbria e altamente funcional para o "Painel de Gerenciamento de Homenagens Funerárias".

---

### GUIA DE ESTILO E DIREÇÃO TÁTIL (EVITAR APARÊNCIA DE IA)

- **Importante:** Evite o visual genérico de IA (sem bordas brilhantes, sem sombras gigantes de néon, sem gradientes roxos/azuis saturados e sem cartões flutuantes exagerados).

- **Paleta de Cores (Tons de Azul Sábio e Sóbrio):**

  - Fundo Geral: Azul escuro profundo e acinzentado (`#0F172A` - Slate 900) ou Cinza Claro Corporativo (`#F8FAFC`). Crie na versão Tema Escuro Sóbrio (Dark Premium).

  - Superfícies/Cartões: Azul petróleo escuro com linhas bem definidas (`#1E293B` - Slate 800).

  - Acentos e Destaques: Azul clássico/marinho suave (`#3B82F6` ou `#2563EB`) apenas para botões principais e estados ativos.

  - Texto: Branco fosco (`#F8FAFC`) e cinza claro para textos secundários (`#94A3B8`).

- **Linhas e Estrutura:**

  - Layout limpo, plano e estruturado (Estilo Dashboard Administrativo Enterprise/SaaS Profissional).

  - Bordas sutis e bem definidas (`border 1px` em `#334155`).

  - Cantos levemente arredondados (máximo de `8px` ou `6px`), nada de cantos ultra redondos.

---

### CONTEXTO E OBJETIVO

Este painel é utilizado pelos operadores de uma funerária a partir de um computador central. O objetivo é gerenciar o conteúdo audiovisual (slideshow de fotos do ente querido e música de fundo) transmitido nas TVs de 3 salas de velório diferentes (Sala 1, Sala 2 e Sala 3), centralizando o envio.

---

### ESTRUTURA E FUNCIONALIDADES PRINCIPAIS

#### 1. Cabeçalho (Header)

- Título da empresa/aplicação: **"Gerenciador de Homenagens"**

- Indicador discreto de status geral da rede (ex: "3/3 TVs Conectadas").

- Relógio com hora e data atual no formato brasileiro.

#### 2. Visão Geral das 3 Salas (Grid Principal)

Exiba 3 Cards bem estruturados e alinhados lado a lado: **Sala 01**, **Sala 02** e **Sala 03**.

Cada Card de Sala deve conter:

- **Badge de Status com Cores Sóbrias:** 

  - *Livre/Disponível* (Cinza/Azul apagado)

  - *Em Transmissão* (Verde escuro discreto ou Azul ativo)

  - *Desconectado* (Vermelho escuro)

- **Dados do Ente Querido Atual:** Nome do falecido (ex: "Homenagem: Maria da Silva"), quantidade de fotos e nome da faixa de áudio em reprodução.

- **Área de Mini Preview:** Quadrado proporcional em tela escura exibindo a foto que está rodando na TV no momento.

- **Controles de Ação:**

  - Botão principal: **"Enviar Mídia / Configurar"**

  - Botões de atalho rápido: **Play/Pause**, **Controle de Volume** e **"Encerrar Homenagem"**.

#### 3. Modal / Painel Lateral de Upload ("Enviar Mídia")

Ao clicar em "Enviar Mídia" em uma das salas, abra uma gaveta lateral (Drawer) ou Modal limpo contendo:

1. **Identificação:** Seletor de Sala (1, 2 ou 3) e campo para o Nome do Falecido.

2. **Upload de Fotos (Drag & Drop):**

   - Área de upload de fotos (JPG, PNG).

   - Grid com miniaturas das fotos enviadas, permitindo reordenar, apagar fotos e ajustar o tempo de exibição (slider de 3 a 10s).

3. **Música de Fundo:**

   - Opção para upload de arquivo MP3.

   - Seleção rápida de playlists nativas (ex: "Clássica", "Instrumental Suave", "Sereno").

   - Player de teste rápido.

4. **Ação:** Botão azul bem visível **"Transmitir para a Sala [X]"**.

---

### ESTADO INICIAL (MOCK)

Preencha a tela com dados fictícios para teste:

- Sala 1: Transmitindo homenagem (com 4 fotos e música ativa).

- Sala 2: Livre / Disponível.

- Sala 3: Pausada.

## Memorial Cloud

Painel de gerenciamento de homenagens funerárias, mídias e salas de transmissão.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
