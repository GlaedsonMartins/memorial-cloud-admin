# MEMORIAL CLOUD

# DESIGN SYSTEM OFICIAL

## MEMORIAL ADMIN E MEMORIAL PLAYER

---

# 1. OBJETIVO

Este documento define o padrão visual oficial do Memorial Cloud.

Ele deverá ser utilizado pelo Codex durante o desenvolvimento de:

* Memorial Admin;
* Memorial Player;
* futuras páginas públicas;
* futuro aplicativo de envio de mensagens da família.

O objetivo é garantir uma interface:

* respeitosa;
* moderna;
* elegante;
* simples;
* profissional;
* fácil de operar;
* visualmente consistente.

O Memorial Cloud será utilizado em uma funerária.

Portanto, toda decisão visual deve respeitar o contexto sensível da aplicação.

Evitar cores agressivas, animações exageradas, textos descontraídos e elementos visuais que possam transmitir informalidade.

---

# 2. PRINCÍPIOS VISUAIS

O Design System deverá seguir cinco princípios.

## 2.1 Respeito

A interface deve transmitir serenidade, cuidado e profissionalismo.

Não utilizar:

* emojis decorativos;
* efeitos chamativos;
* ilustrações infantis;
* cores excessivamente vibrantes;
* mensagens informais.

---

## 2.2 Clareza

O administrador deve entender rapidamente o estado de cada sala.

Os principais estados devem ser visualmente claros:

* sala livre;
* homenagem ativa;
* Player online;
* Player offline;
* sincronizando;
* erro;
* upload em andamento.

---

## 2.3 Simplicidade

Evitar excesso de informações.

Evitar muitas ações em uma única tela.

Priorizar:

* hierarquia visual;
* espaçamento;
* títulos claros;
* botões objetivos;
* formulários curtos.

---

## 2.4 Consistência

Todos os componentes devem seguir o mesmo padrão.

Nunca criar estilos diferentes para componentes com a mesma função.

Exemplos:

* todos os botões primários devem ser iguais;
* todos os cards de sala devem seguir a mesma estrutura;
* todos os campos de formulário devem possuir o mesmo padrão;
* todos os modais devem possuir o mesmo comportamento.

---

## 2.5 Segurança operacional

A interface deverá reduzir o risco de erros.

Ações destrutivas devem possuir confirmação.

Exemplos:

* encerrar homenagem;
* excluir homenagem;
* remover playlist;
* excluir foto;
* excluir vídeo.

---

# 3. IDENTIDADE VISUAL

O Memorial Cloud deverá possuir uma aparência sóbria, limpa e contemporânea.

A referência visual deve combinar:

* software corporativo moderno;
* ambiente institucional;
* simplicidade operacional;
* serenidade.

Não utilizar visual excessivamente fúnebre.

Evitar telas completamente pretas no Memorial Admin.

O painel administrativo deverá possuir fundo claro e confortável.

O Memorial Player poderá utilizar fundo escuro para valorizar as fotos e vídeos.

---

# 4. PALETA DE CORES

Utilizar variáveis CSS e tokens do Tailwind.

Nunca escrever cores diretamente nos componentes.

Todas as cores devem ser centralizadas no tema.

---

# 4.1 Cores principais

## Primary

Cor principal do sistema.

Utilizar azul profundo e sóbrio.

```css
--primary: 222 47% 24%;
--primary-foreground: 0 0% 100%;
```

Uso:

* botões principais;
* links;
* elementos selecionados;
* destaques importantes;
* identidade principal do Admin.

---

## Secondary

Cor secundária neutra.

```css
--secondary: 215 20% 95%;
--secondary-foreground: 222 47% 20%;
```

Uso:

* botões secundários;
* fundos de áreas;
* filtros;
* agrupamentos.

---

## Accent

Cor de destaque elegante.

Utilizar dourado suave, sem aparência chamativa.

```css
--accent: 39 45% 62%;
--accent-foreground: 222 47% 18%;
```

Uso:

* pequenos detalhes;
* ícones institucionais;
* bordas especiais;
* elementos da identidade visual;
* estados selecionados.

Não utilizar Accent como cor principal de grandes áreas.

---

# 4.2 Cores neutras

```css
--background: 210 20% 98%;
--foreground: 222 30% 16%;

--card: 0 0% 100%;
--card-foreground: 222 30% 16%;

--muted: 215 18% 94%;
--muted-foreground: 215 15% 42%;

--border: 214 18% 86%;
--input: 214 18% 86%;
```

---

# 4.3 Estados semânticos

## Sucesso

```css
--success: 148 45% 38%;
--success-foreground: 0 0% 100%;
```

Uso:

* Player online;
* upload concluído;
* operação concluída;
* sala pronta.

---

## Aviso

```css
--warning: 38 85% 55%;
--warning-foreground: 35 90% 15%;
```

Uso:

* sincronizando;
* conexão instável;
* operação incompleta;
* atenção necessária.

---

## Erro

```css
--destructive: 0 62% 50%;
--destructive-foreground: 0 0% 100%;
```

Uso:

* Player offline;
* falha de upload;
* erro;
* exclusão;
* encerramento de homenagem.

---

## Informação

```css
--info: 204 70% 45%;
--info-foreground: 0 0% 100%;
```

Uso:

* mensagens informativas;
* sincronização;
* estados auxiliares.

---

# 5. TIPOGRAFIA

Utilizar uma fonte moderna, legível e neutra.

Fonte principal recomendada:

```text
Inter
```

Fonte alternativa:

```text
system-ui
```

Configuração:

```css
font-family:
  Inter,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

---

# 5.1 Hierarquia tipográfica

## Título de página

```text
Font size: 30px
Font weight: 600
Line height: 36px
```

## Título de seção

```text
Font size: 22px
Font weight: 600
Line height: 30px
```

## Título de card

```text
Font size: 18px
Font weight: 600
Line height: 26px
```

## Texto principal

```text
Font size: 14px
Font weight: 400
Line height: 22px
```

## Texto secundário

```text
Font size: 13px
Font weight: 400
Line height: 20px
```

## Rótulo de campo

```text
Font size: 13px
Font weight: 500
Line height: 18px
```

## Texto pequeno

```text
Font size: 12px
Font weight: 400
Line height: 16px
```

---

# 5.2 Regras de texto

Evitar textos inteiramente em letras maiúsculas.

Maiúsculas podem ser utilizadas somente em:

* pequenos status;
* etiquetas;
* badges;
* códigos técnicos.

Não utilizar fontes decorativas no Memorial Admin.

No Memorial Player, o nome da funerária poderá utilizar uma fonte institucional configurável.

---

# 6. ESPAÇAMENTO

Utilizar escala consistente baseada em múltiplos de quatro.

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

Regras:

* espaçamento mínimo entre elementos: 8px;
* espaçamento entre campo e label: 6px;
* espaçamento entre campos: 16px;
* espaçamento entre seções: 32px;
* padding de cards: 20px ou 24px;
* padding principal da página: 24px ou 32px.

---

# 7. BORDAS E SOMBRAS

## Border radius

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-xl: 18px;
```

Uso:

* inputs: 8px;
* botões: 8px;
* cards: 12px;
* modais: 14px;
* imagens: 10px.

---

## Sombras

Utilizar sombras discretas.

```css
--shadow-sm:
  0 1px 2px rgba(15, 23, 42, 0.05);

--shadow-md:
  0 6px 20px rgba(15, 23, 42, 0.08);

--shadow-lg:
  0 12px 32px rgba(15, 23, 42, 0.12);
```

Nunca utilizar sombras pesadas.

---

# 8. ÍCONES

Utilizar:

```text
Lucide React
```

Regras:

* tamanho padrão: 18px;
* tamanho pequeno: 16px;
* tamanho grande: 22px;
* espessura padrão;
* não misturar bibliotecas de ícones;
* todo botão com apenas ícone deve possuir tooltip;
* ícones não devem substituir textos em ações críticas.

Exemplos:

* Sala: DoorOpen;
* Player: Monitor;
* Foto: Image;
* Vídeo: Video;
* Música: Music;
* Playlist: ListMusic;
* Online: Wifi;
* Offline: WifiOff;
* Configuração: Settings;
* Histórico: History;
* Excluir: Trash2;
* Editar: Pencil;
* Iniciar: Play;
* Encerrar: Square;
* Atualizar: RefreshCw.

---

# 9. LAYOUT DO MEMORIAL ADMIN

O Memorial Admin deverá utilizar layout com:

* menu lateral;
* cabeçalho superior;
* área principal;
* sistema de notificações.

---

# 9.1 Menu lateral

Largura expandida:

```text
240px
```

Largura recolhida:

```text
72px
```

Itens principais:

* Dashboard;
* Salas;
* Homenagens;
* Playlists;
* Histórico;
* Configurações.

Na parte inferior:

* usuário autenticado;
* sair.

O item ativo deve ser destacado com:

* fundo suave;
* ícone em Primary;
* texto em Primary;
* indicador lateral.

---

# 9.2 Cabeçalho

O cabeçalho deverá conter:

* título da página;
* breadcrumb quando necessário;
* status geral;
* usuário logado;
* notificações.

Não adicionar elementos desnecessários.

---

# 9.3 Área principal

A área principal deverá possuir:

```text
max-width: 1600px
```

Em telas grandes, manter conteúdo centralizado.

Padding:

```text
24px no notebook
32px no desktop
```

---

# 10. DASHBOARD

O Dashboard deverá priorizar os cards das seis salas.

Layout:

```text
Desktop grande: 3 colunas
Notebook: 2 colunas
Tablet: 1 coluna
```

Cada card de sala deverá possuir:

* nome da sala;
* status da sessão;
* status do Player;
* nome da homenagem ativa;
* quantidade de fotos;
* quantidade de vídeos;
* playlist selecionada;
* tempo do slide;
* última sincronização;
* botão principal.

---

# 10.1 Card de sala livre

Exibir:

* nome da sala;
* badge “Livre”;
* status do Player;
* botão “Criar homenagem”.

Aparência:

* fundo branco;
* borda neutra;
* ícone discreto;
* sem excesso de informações.

---

# 10.2 Card de homenagem ativa

Exibir:

* badge “Em exibição”;
* nome do falecido;
* quantidade de mídias;
* playlist;
* tempo do slide;
* status do Player;
* botão “Gerenciar”.

Utilizar borda Primary suave.

Não utilizar grandes áreas coloridas.

---

# 10.3 Card de Player offline

Exibir:

* badge vermelho “Player offline”;
* horário da última conexão;
* ícone de WifiOff;
* alerta visual;
* botão “Ver detalhes”.

Não esconder o restante das informações da sala.

---

# 10.4 Card sincronizando

Exibir:

* badge amarelo;
* texto “Sincronizando”;
* ícone de carregamento;
* progresso quando disponível.

---

# 11. BADGES DE STATUS

## Sala livre

```text
Cor neutra
Texto: Livre
```

## Homenagem ativa

```text
Cor Primary
Texto: Em exibição
```

## Player online

```text
Cor Success
Texto: Online
```

## Player offline

```text
Cor Destructive
Texto: Offline
```

## Sincronizando

```text
Cor Warning
Texto: Sincronizando
```

## Encerrada

```text
Cor neutra
Texto: Encerrada
```

## Erro

```text
Cor Destructive
Texto: Erro
```

Badges devem ser pequenos e legíveis.

---

# 12. BOTÕES

Utilizar componentes do shadcn/ui adaptados ao tema.

Altura padrão:

```text
40px
```

Altura pequena:

```text
34px
```

Altura grande:

```text
46px
```

---

# 12.1 Botão Primary

Uso:

* salvar;
* continuar;
* iniciar homenagem;
* confirmar ação principal.

Nunca utilizar mais de um botão Primary por área principal.

---

# 12.2 Botão Secondary

Uso:

* cancelar;
* voltar;
* ações alternativas;
* filtros.

---

# 12.3 Botão Outline

Uso:

* ações auxiliares;
* abrir detalhes;
* editar;
* selecionar arquivos.

---

# 12.4 Botão Destructive

Uso exclusivo:

* excluir;
* encerrar;
* remover permanentemente.

Ações destrutivas devem exigir confirmação.

---

# 12.5 Estado de carregamento

Durante uma operação:

* desabilitar o botão;
* exibir ícone de carregamento;
* alterar o texto.

Exemplo:

```text
Salvando...
Enviando...
Encerrando...
Excluindo...
```

---

# 13. FORMULÁRIOS

Todos os formulários devem utilizar:

* React Hook Form;
* Zod;
* componentes shadcn/ui;
* mensagens de erro claras.

Campos obrigatórios devem ser identificados.

Não utilizar apenas cor para indicar erro.

Exibir mensagem abaixo do campo.

---

# 13.1 Inputs

Altura:

```text
40px
```

Estados:

* normal;
* foco;
* preenchido;
* erro;
* desabilitado.

No foco:

* borda Primary;
* ring discreto.

---

# 13.2 Select

Utilizar Select do shadcn/ui.

Exemplos:

* sala;
* playlist;
* duração do slide;
* status.

---

# 13.3 Textarea

Uso:

* observações;
* mensagens futuras;
* configurações institucionais.

Altura mínima:

```text
100px
```

---

# 13.4 Duração do slide

Exibir como seleção visual com três opções:

```text
5 segundos
8 segundos
10 segundos
```

Utilizar Radio Group ou Segmented Control.

A opção selecionada deve ser visualmente evidente.

---

# 14. UPLOAD DE FOTOS

O upload deverá possuir uma área de arrastar e soltar.

Exibir:

* ícone;
* texto principal;
* formatos aceitos;
* limite de vinte fotos;
* botão para selecionar arquivos.

Exemplo:

```text
Arraste as fotos aqui

ou selecione os arquivos no computador

JPG, PNG ou WEBP — máximo de 20 fotos
```

---

# 14.1 Miniaturas

Após selecionar:

* exibir miniatura;
* nome do arquivo;
* progresso;
* status;
* botão remover.

As miniaturas devem ser exibidas em lista ou grade simples.

Não criar editor avançado.

Não permitir reordenação por arrastar.

A ordem será a ordem de inserção.

---

# 14.2 Progresso

Cada arquivo deve possuir seu próprio progresso.

Estados:

* aguardando;
* enviando;
* concluído;
* erro.

Em erro:

* permitir tentar novamente;
* permitir remover.

---

# 15. UPLOAD DE VÍDEOS

Utilizar componente visual semelhante ao upload de fotos.

Exibir:

* nome;
* duração;
* tamanho;
* progresso;
* status.

Validar duração máxima de um minuto.

Caso ultrapasse:

```text
Este vídeo ultrapassa o limite de 1 minuto.
```

Não iniciar upload de arquivo inválido.

---

# 16. PLAYLISTS

A página de playlists deverá possuir duas seções:

* Católica;
* Evangélica.

Cada playlist deverá ser exibida em um card ou linha contendo:

* nome;
* categoria;
* quantidade de músicas;
* duração aproximada;
* status;
* editar;
* excluir.

---

# 16.1 Lista de músicas

Cada música deverá exibir:

* nome;
* duração;
* status do upload;
* botão remover.

A ordem visual é a ordem de execução.

Não é necessário drag and drop.

---

# 17. TABELAS

Utilizar tabelas apenas quando a informação realmente precisar de comparação.

Exemplos:

* histórico;
* playlists;
* usuários;
* logs.

Tabelas devem possuir:

* cabeçalho fixo quando necessário;
* linhas com bom espaçamento;
* ações no final;
* paginação;
* busca;
* estado vazio;
* carregamento.

Não utilizar tabelas para os cards das salas.

---

# 18. MODAIS E DIÁLOGOS

Utilizar Dialog ou AlertDialog do shadcn/ui.

Modais devem possuir:

* título;
* descrição;
* conteúdo;
* botão cancelar;
* botão confirmar.

---

# 18.1 Confirmação de exclusão

Exemplo:

```text
Excluir homenagem?

Esta ação removerá os dados e arquivos da homenagem permanentemente.
```

Botão:

```text
Excluir homenagem
```

---

# 18.2 Confirmação de encerramento

Exemplo:

```text
Encerrar homenagem?

A apresentação será interrompida imediatamente na televisão da sala.
```

Botão:

```text
Encerrar apresentação
```

---

# 19. NOTIFICAÇÕES

Utilizar Toast ou Sonner.

Tipos:

* sucesso;
* erro;
* aviso;
* informação.

Exemplos:

```text
Homenagem criada com sucesso.

Fotos enviadas com sucesso.

Player da Sala 2 está offline.

Não foi possível concluir o upload.
```

Não exibir notificações excessivas.

Operações em lote devem gerar apenas uma notificação final.

---

# 20. ESTADOS DE CARREGAMENTO

Utilizar Skeleton para carregamento inicial.

Não utilizar spinner em toda a tela sempre que possível.

Spinner deve ser utilizado em:

* botões;
* operações pontuais;
* carregamento rápido.

Skeleton deve ser utilizado em:

* cards;
* tabelas;
* listas;
* dashboard.

---

# 21. ESTADOS VAZIOS

Toda página sem dados deve possuir estado vazio.

Exemplos:

## Sem homenagem

```text
Nenhuma homenagem cadastrada nesta sala.
```

## Sem playlists

```text
Nenhuma playlist cadastrada.
```

## Sem histórico

```text
Nenhuma homenagem encerrada encontrada.
```

Adicionar ação útil quando necessário.

---

# 22. ESTADOS DE ERRO

Mensagens devem ser claras.

Nunca mostrar mensagens técnicas do Firebase diretamente ao usuário.

Errado:

```text
FirebaseError: permission-denied
```

Correto:

```text
Você não possui permissão para realizar esta operação.
```

Em erros recuperáveis:

* explicar;
* permitir tentar novamente;
* manter os dados preenchidos.

---

# 23. RESPONSIVIDADE DO MEMORIAL ADMIN

O foco principal será:

* desktop;
* notebook;
* tablet.

Breakpoints recomendados:

```text
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

Em telas menores:

* menu lateral se transforma em Drawer;
* cards ficam em uma coluna;
* botões podem ocupar largura total;
* tabelas podem permitir rolagem horizontal.

Não remover funcionalidades importantes em telas menores.

---

# 24. ACESSIBILIDADE

Seguir boas práticas de acessibilidade.

Obrigatório:

* contraste adequado;
* navegação por teclado;
* labels em campos;
* foco visível;
* aria-label em botões de ícone;
* mensagens de erro associadas aos campos;
* não depender apenas de cor;
* tamanho mínimo de toque de 40px;
* suporte a leitores de tela nas ações principais.

---

# 25. ANIMAÇÕES

Utilizar Framer Motion somente quando agregar clareza.

Permitido:

* fade suave;
* expansão de modal;
* entrada discreta de cards;
* transição de estado;
* indicador de sincronização.

Duração recomendada:

```text
150ms a 250ms
```

Nunca utilizar:

* bounce;
* movimentos longos;
* animações decorativas;
* efeitos chamativos;
* transições que atrasem a operação.

---

# 26. MEMORIAL PLAYER

O Memorial Player deve possuir identidade visual diferente do Admin.

Ele não é uma interface administrativa.

Ele é uma experiência de apresentação em tela cheia.

---

# 26.1 Fundo

O Player deverá utilizar fundo escuro.

Padrão:

```css
background: #000000;
```

Pode utilizar fundo institucional configurável quando nenhuma homenagem estiver ativa.

---

# 26.2 Exibição de fotos

As fotos devem ocupar a maior área possível.

Utilizar:

```css
object-fit: contain;
```

Nunca cortar partes importantes da imagem por padrão.

Centralizar horizontal e verticalmente.

Não exibir:

* molduras;
* botões;
* barras;
* indicadores;
* nomes de arquivos;
* informações técnicas.

---

# 26.3 Exibição de vídeos

Utilizar:

```css
object-fit: contain;
```

O vídeo deve ficar centralizado.

Controles nativos devem permanecer ocultos.

Não permitir interação do usuário.

---

# 26.4 Transição entre fotos

Utilizar fade ou crossfade suave.

Duração recomendada:

```text
700ms a 1200ms
```

Não utilizar:

* slide lateral rápido;
* zoom agressivo;
* rotação;
* efeitos chamativos.

---

# 26.5 Tela institucional

Quando não houver homenagem ativa, exibir:

* logo da funerária;
* nome da funerária;
* imagem institucional opcional.

Layout:

* centralizado;
* elegante;
* minimalista;
* fundo escuro ou institucional;
* sem mensagens técnicas.

Não exibir:

```text
Aguardando dados do Firebase
Sem sessão
Player conectado
```

---

# 26.6 Cursor

Ocultar o cursor após poucos segundos sem movimento.

Ao mover o mouse, o cursor poderá aparecer temporariamente.

---

# 26.7 Tela cheia

O Player deve ser configurado para modo Kiosk no navegador.

A aplicação web não deve tentar simular o modo Kiosk com elementos visuais.

O sistema deve ocupar:

```css
width: 100vw;
height: 100vh;
overflow: hidden;
```

---

# 26.8 Falhas de mídia

Caso uma mídia falhe:

* não exibir mensagem técnica na TV;
* tentar carregar novamente;
* pular para a próxima mídia;
* registrar o erro internamente.

A televisão nunca deverá exibir:

* stack trace;
* URL;
* código de erro;
* tela de navegador.

---

# 27. FUTURA EXIBIÇÃO DE MENSAGENS

O Player deverá estar preparado para futuramente exibir mensagens enviadas pelo aplicativo da família.

O layout futuro deverá conter:

* mensagem;
* nome de quem escreveu.

Exemplo visual:

```text
“Seu carinho permanecerá para sempre em nossos corações.”

Maria Oliveira
```

Regras:

* fundo discreto;
* texto centralizado;
* fonte legível;
* sem animações excessivas;
* duração configurável;
* respeitar limite de caracteres.

Essa funcionalidade não deverá ser implementada no MVP, apenas prevista no Design System.

---

# 28. NOMENCLATURA DOS COMPONENTES

Utilizar nomes em inglês no código.

Exemplos:

```text
RoomCard
RoomStatusBadge
PlayerStatusBadge
TributeForm
PhotoUploader
VideoUploader
PlaylistSelector
SlideDurationSelector
ConfirmDeleteDialog
EmptyState
LoadingState
InstitutionalScreen
MediaRenderer
ImageSlide
VideoSlide
```

Textos visíveis ao usuário devem estar em português.

---

# 29. ESTRUTURA SUGERIDA DE COMPONENTES

```text
components/
├── ui/
├── layout/
├── dashboard/
├── rooms/
├── tributes/
├── uploads/
├── playlists/
├── monitoring/
├── feedback/
└── player/
```

Componentes genéricos devem ficar em:

```text
components/ui
```

Componentes específicos devem ficar em sua funcionalidade correspondente.

---

# 30. TOKENS DO TAILWIND

Centralizar os tokens em:

```text
globals.css
tailwind.config.ts
```

Não duplicar valores.

Criar tokens para:

* cores;
* radius;
* sombras;
* espaçamentos;
* tipografia;
* estados.

---

# 31. TEMA ESCURO

O Memorial Admin deverá utilizar tema claro como padrão.

Tema escuro no Admin não é obrigatório no MVP.

O Memorial Player utilizará fundo escuro independentemente do tema do sistema operacional.

Não implementar troca de tema no MVP.

---

# 32. LOGOTIPO

O sistema deverá aceitar o logotipo da funerária.

Formatos:

* PNG;
* WEBP;
* SVG, quando seguro.

O Admin deverá exibir o logo:

* no menu lateral;
* na tela de login;
* em configurações.

O Player deverá exibir o logo somente na tela institucional.

Não sobrepor o logo às fotos ou vídeos durante a homenagem.

---

# 33. TELA DE LOGIN

A tela de login deverá ser simples.

Estrutura:

* logotipo;
* nome Memorial Cloud;
* campo de e-mail;
* campo de senha;
* botão entrar;
* mensagem de erro.

Não incluir:

* cadastro público;
* login social;
* animações grandes;
* informações promocionais.

A tela deve transmitir segurança e profissionalismo.

---

# 34. PADRÃO DE LINGUAGEM

Todos os textos da interface devem ser:

* claros;
* respeitosos;
* diretos;
* profissionais.

Utilizar:

```text
Criar homenagem
Iniciar apresentação
Encerrar apresentação
Adicionar fotos
Selecionar playlist
Player offline
Última sincronização
```

Evitar:

```text
Bora começar
Mandar fotos
Derrubar sessão
Matar apresentação
```

---

# 35. REGRAS IMUTÁVEIS

Nunca utilizar visual infantil.

Nunca utilizar cores neon.

Nunca utilizar gradientes chamativos.

Nunca utilizar animações exageradas.

Nunca utilizar emojis como ícones do sistema.

Nunca exibir mensagens técnicas ao usuário.

Nunca exibir controles no Memorial Player.

Nunca sobrepor informações administrativas às fotos.

Nunca cortar imagens por padrão.

Nunca usar mais de uma biblioteca de ícones.

Nunca criar componentes visualmente inconsistentes.

Nunca alterar as cores diretamente dentro de componentes.

Nunca criar uma interface excessivamente carregada.

---

# 36. CRITÉRIOS DE CONCLUSÃO

O Design System será considerado corretamente implementado quando:

* todas as telas utilizarem os mesmos tokens;
* todos os botões seguirem o mesmo padrão;
* todos os formulários possuírem validação visual consistente;
* todos os estados das salas forem claros;
* todos os Players possuírem aparência limpa;
* a tela institucional estiver correta;
* a interface funcionar em desktop, notebook e tablet;
* o contraste estiver adequado;
* as ações críticas possuírem confirmação;
* carregamentos, erros e estados vazios estiverem tratados;
* nenhum texto técnico do Firebase aparecer para o usuário;
* o Memorial Admin e o Memorial Player possuírem identidades coerentes, mas adequadas às suas funções.

---

# 37. ORDEM DE IMPLEMENTAÇÃO

O Codex deverá implementar o Design System nesta ordem:

1. Tokens globais.
2. Tipografia.
3. Cores.
4. Componentes básicos do shadcn/ui.
5. Botões.
6. Inputs e formulários.
7. Badges.
8. Cards.
9. Modais.
10. Uploads.
11. Layout administrativo.
12. Dashboard.
13. Player.
14. Responsividade.
15. Acessibilidade.
16. Refinamento visual.

---

# 38. DOCUMENTO OFICIAL

Este documento é a referência visual oficial do Memorial Cloud.

Toda nova tela, componente ou funcionalidade deverá respeitar estas regras.

Caso exista dúvida visual durante o desenvolvimento, priorizar:

1. clareza;
2. respeito;
3. simplicidade;
4. consistência;
5. estabilidade operacional.

O Codex não deverá criar estilos fora deste padrão sem autorização explícita.
