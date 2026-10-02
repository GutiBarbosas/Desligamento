# HISTÓRICO DO PROJETO — Dashboard de Desligamentos

> **Leia este arquivo inteiro antes de fazer qualquer coisa.**
> Ele foi escrito para que qualquer instância do Claude (outra conversa ou outra conta) consiga continuar o projeto sem ter visto as conversas anteriores.
> Atualize este arquivo ao final de CADA etapa.

- **Última atualização:** 02/10/2026 (Etapa 8 — bloco 2: Impressão/PDF — **Etapa 8 concluída**)
- **Etapas concluídas:** Etapas 1 a 6, **Etapa 7 (Detalhes do colaborador — modal, `detalhes.js`)** e **Etapa 8 (Exportação: bloco 1 Excel/CSV + bloco 2 Impressão/PDF)**. **A Etapa 9 NÃO foi iniciada.**
- **Etapa 8 (exportação) — CONCLUÍDA:** bloco 1 (Excel + CSV) ✅ e bloco 2 (Impressão/PDF via `window.print()`) ✅ — ver 10g e 10h.
- **Etapa 7 — CONCLUÍDA (registro resumido):** `detalhes.js` + modal (clique no nome → `desligamentos:detalhe`; 10 campos; fecha por X, Fechar, ESC e clique fora; não altera filtros/página/ordenação). Vem pronta no ZIP da Etapa 7 e foi **preservada sem alteração** na Etapa 8. O detalhamento completo de decisões da Etapa 7 não foi escrito aqui na época; ver o próprio `detalhes.js` (comentário no topo).
- **Próxima etapa:** Etapa 9 — **não iniciada; aguardando autorização e escopo do usuário**
- **Idioma de trabalho:** Português do Brasil (o usuário escreve em PT-BR; responder em PT-BR)

---

## 1. Objetivo do projeto

Criar um **Dashboard de Desligamentos**: uma visão **simples e rápida** dos colaboradores desligados, para **apresentação ao chefe do usuário**. O usuário trabalha em uma rede de farmácias.

O dashboard deverá, no futuro, permitir visualizar:

- quantidade de desligamentos;
- período;
- loja;
- gerente;
- supervisor;
- função;
- tipo de aviso prévio;
- tempo de empresa;
- lista dos colaboradores desligados.

Funcionalidades previstas para etapas futuras (**NÃO implementadas ainda**): cards, filtros, tabela, gráficos, detalhes do colaborador, exportação.

### Regras do projeto (definidas pelo usuário)

1. O projeto é desenvolvido **POR ETAPAS**, porque o usuário usa uma conta com limite de uso. **Nunca tente fazer tudo de uma vez.**
2. Ao fim de cada etapa: apresentar o resultado, atualizar este arquivo e **parar e aguardar autorização** antes de avançar.
3. O dashboard de desligamentos deve ser **totalmente independente** do dashboard atual (pasta/repositório/arquivos separados). O dashboard atual é **apenas referência visual e técnica**.
4. **Não alterar** a planilha original nem o dashboard atual.
5. Não fazer trabalho além do pedido na etapa.

---

## 2. Arquivos existentes

Enviados pelo usuário (somente leitura — nunca modificar): `BASE_DESLIGADOS.xlsx` (fonte dos dados) e `dashboard_atualizado.zip` (dashboard atual "Registro & Venda", só referência).

Criados pelo Claude:

| Arquivo | Descrição |
|---|---|
| `HISTORICO_PROJETO.md` | Este arquivo |
| `dashboard-desligamentos/index.html` | Cabeçalho + 4 cards + **(Etapa 4)** área de filtros (8 campos, contador, botão Limpar, mensagem de vazio) + containers vazios (gráficos, tabela). Painel de diagnóstico da Etapa 2 preservado, oculto (aparece com `?diagnostico`). Carrega `config.js`, `data.js`, `filtros.js`, `tabela.js`, `chart.umd.min.js`, `graficos.js`, `app.js` (nessa ordem). **(Etapa 6)** `#areaGraficos` tem 2 painéis (`#slotGrafico1` mês, `#slotGrafico2` tempo) com `canvas#graficoMes` / `canvas#graficoTempo`, cada um com mensagem de vazio. **(Etapa 5)** `#areaTabela` agora contém a tabela (`#tabelaWrap`), a mensagem de vazio (`#tabelaVazio`) e o rodapé com contagem + paginação (`#tabelaRodape`) |
| `dashboard-desligamentos/exportacao.js` | **(Etapa 8 — bloco 1, novo)** Exportação **Excel (.xlsx) e CSV** de todos os registros filtrados. Funções puras (`montarLinhas`, `gerarCsv`, `gerarXlsx`, `nomeArquivo`, `COLUNAS`; sem DOM, testáveis em Node via `window.ExportacaoDesligamentos` / `require`) + interface: injeta a barra "N registros para exportar · Exportar: [Excel] [CSV]" logo abaixo do título da tabela (`#exportBar`), lê `window.DESLIG_STATE.filtrados` no clique e se atualiza no evento `desligamentos:filtrados`. **Sem biblioteca e sem CDN** (XLSX escrito à mão: ZIP "store" + XML). Reaproveita `TabelaDesligamentos.formatarData/formatarTempo/ordenar` |
| `dashboard-desligamentos/impressao.js` | **(Etapa 8 — bloco 2, novo)** Impressão/PDF. Funções puras (`montarLinhas`, `descreverFiltros`, `escapar`, `COLUNAS`; sem DOM, testáveis em Node via `window.ImpressaoDesligamentos` / `require`) + interface: adiciona o botão **Imprimir / PDF** ao lado de Excel/CSV (dentro de `#exportBar .export-actions`), cria a área `#areaImpressao` (irmã de `.page`, oculta na tela), monta a tabela de impressão com **todos** os `DESLIG_STATE.filtrados` em `beforeprint` e limpa em `afterprint`, e chama `window.print()`. Usa `TabelaDesligamentos` (`formatarData`, `formatarTempo`, `infoAviso`, `ordenar`) |
| `dashboard-desligamentos/graficos.js` | **(Etapa 6, novo)** Os 2 gráficos (Chart.js): funções puras `mesesDoPeriodo`, `contarPorMes`, `contarPorFaixa` (sem DOM, testáveis em Node via `window.GraficosDesligamentos` / `require`) + ligação com a página: lê `window.DESLIG_STATE.filtrados`, redesenha a cada evento `desligamentos:filtrados` |
| `dashboard-desligamentos/chart.umd.min.js` | **(Etapa 6, novo)** Chart.js **v4.5.1** (build UMD minificado, MIT, ~208 KB), arquivo local — sem CDN, funciona offline. Não editar |
| `dashboard-desligamentos/tabela.js` | **(Etapa 5, novo)** Tabela principal: funções puras `formatarData`, `formatarTempo`, `ordenar`, `paginar`, `paginasVisiveis` (sem DOM, testáveis em Node via `window.TabelaDesligamentos` / `require`) + ligação com a página: lê `window.DESLIG_STATE.filtrados`, redesenha a cada evento `desligamentos:filtrados` (voltando à página 1), trata cliques de ordenação e paginação |
| `dashboard-desligamentos/filtros.js` | **(Etapa 4, novo)** Lógica de filtragem **pura, sem DOM** (`window.FiltrosDesligamentos` / `require`): `criteriosVazios()`, `filtrar(registros, criterios)`, `opcoes(registros)`, `normalizar(texto)` |
| `dashboard-desligamentos/style.css` | Tokens do tema escuro copiados do dashboard atual + estilos do cabeçalho, cards, espaços reservados, **(Etapa 4)** filtros (`.filters-grid`, `.field`, `.btn-ghost`, `.result-count`, `.empty-msg`) e responsividade (breakpoints 1024 / 600 / 360 px) |
| `dashboard-desligamentos/config.js` | `DESLIG_CONFIG`: `SHEET_CSV_URL` (vazio por enquanto) e `LOCAL_CSV` (fallback de teste) |
| `dashboard-desligamentos/data.js` | Camada de dados: `parseCSV`, `parseData`, normalização, validação, `carregar()`. Sem DOM; funciona no navegador (`window.Desligamentos`) e no Node (`require`) |
| `dashboard-desligamentos/app.js` | Chama `carregar()`, guarda em `state`/`window.DESLIG_STATE`, preenche cabeçalho e cards (Etapa 3) e **(Etapa 4)** monta os selects, lê os campos, aplica `FiltrosDesligamentos.filtrar`, guarda o resultado em `state.filtrados`, atualiza cards/contador/mensagem e dispara o evento `desligamentos:filtrados`. Diagnóstico só com `?diagnostico` |
| `dashboard-desligamentos/dados/BASE_DESLIGADOS_teste.csv` | Cópia dos valores brutos da planilha (126 linhas) para teste; datas reais do Excel gravadas como dd/mm/aaaa, seriais mantidos. **Não é fonte oficial** |
| `dashboard-desligamentos/README.md` | Instruções de conexão e teste local |
| `dashboard-desligamentos.zip` | Pacote do projeto acima |

Ainda NÃO existem: Etapa 9 e Google Sheets. (Exportação Excel/CSV existe desde o bloco 1 da Etapa 8; detalhe do colaborador é a Etapa 7, não registrada aqui.) (Cards desde a Etapa 3, filtros desde a Etapa 4, tabela desde a Etapa 5 e 2 gráficos desde a Etapa 6.)

## 3. Análise da base — `BASE_DESLIGADOS.xlsx`

### 3.1 Estrutura geral

- **1 aba**, chamada `BASE`. Intervalo `A1:K127`.
- **126 registros** (linhas 2–127) + 1 linha de cabeçalho. **11 colunas.**
- Sem células mescladas, sem tabela/filtro do Excel, sem fórmulas, sem nomes definidos.
- **Nenhum campo vazio** em nenhuma coluna.
- **Nenhuma linha duplicada** e **nenhum COLABORADOR duplicado** (126 nomes completos únicos).

### 3.2 Colunas (ordem exata) e tipos

| # | Coluna | Conteúdo | Tipo real no Excel | Observações |
|---|---|---|---|---|
| A | `COLABORADOR` | Nome completo (MAIÚSCULAS) | texto | **63 de 126 têm espaço em branco no final** (precisa `trim`) |
| B | `NOME_RED` | Nome reduzido (ex.: `ADRIANA D.`) | texto | **Não é único** (ver 3.5) |
| C | `ADMISSÃO` | Data de admissão | **MISTO**: 118 texto `dd/mm/aaaa` + 8 datas reais | Ver 3.3 |
| D | `DOCUMENTO` | `EMPRESA` ou `EMPREGADO` | texto | Significado a confirmar (ver 3.6) |
| E | `T. AVISO PRÉVIO` | Tipo de aviso prévio | texto | 3 valores (ver 3.7) |
| F | `DATA` | Data do desligamento | **MISTO**: 124 número serial Excel + 2 texto `dd/mm/aaaa` | Ver 3.3 |
| G | `LOJA` | Número da loja | **MISTO**: 121 inteiros + 5 texto `RDS` | Ver 3.8 |
| H | `GERENTE` | Primeiro nome do gerente da loja | texto | 30 valores distintos |
| I | `SUPER` | Primeiro nome do supervisor | texto | 5 valores distintos. **A coluna se chama `SUPER`** (no dashboard atual é `SUPERVISOR`/`SUPER`) |
| J | `TEMPO` | Tempo de empresa | inteiro | **Em DIAS** (ver 3.4) |
| K | `FUNÇÃO` | Cargo | texto | 7 valores brutos (ver 3.9) |

Cabeçalhos têm acentos e pontos: `ADMISSÃO`, `T. AVISO PRÉVIO`, `FUNÇÃO` (com espaço e ponto em `T. AVISO PRÉVIO`). Cuidado ao referenciar em código.

### 3.3 Representação de DATA e ADMISSÃO (ponto crítico)

As duas colunas de data são **inconsistentes entre si e dentro de si mesmas**:

- **`ADMISSÃO`**
  - 118 células: **texto** no formato `dd/mm/aaaa` (ex.: `24/10/2022`).
  - 8 células: **datas reais do Excel** (datetime), formatadas como `mm-dd-yy` (o Excel exibe, p.ex., `02-11-26` — formato ambíguo/americano). Linhas Excel: 11, 39, 72, 74, 81, 93, 97, 126.
  - Intervalo: **01/09/2021 a 16/08/2026**.
- **`DATA`** (data do desligamento)
  - 124 células: **número serial do Excel** em formato `General` (aparecem como `46214` ao abrir a planilha — não como data). Conversão: `serial → 1899-12-30 + serial dias`.
  - 2 células: texto `dd/mm/aaaa` — linhas Excel 39 (`18/08/2026`, ELLISON ALLAN SOUSA ALVES) e 97 (`22/07/2026`, MARIA EDUARDA CARVALHO DOS SANTOS).
  - Intervalo: **06/01/2026 a 01/10/2026** (nenhuma data futura em relação a 02/10/2026).
- Desligamentos por mês (2026): jan 10 · fev 6 · mar 22 · abr 15 · mai 18 · jun 12 · jul 17 · ago 18 · set 7 · out (até dia 1º) 1. **Total 126.**
- Todos os valores foram convertidos com sucesso; **nenhuma data inválida**; **nenhuma admissão posterior ao desligamento**.

**Consequência:** o dashboard **não pode ler as datas "cruas"**. Precisa de uma etapa de **normalização** que aceite os 3 formatos (serial Excel, texto `dd/mm/aaaa`, datetime) e gere ISO `AAAA-MM-DD`. **Atenção ao interpretar sempre como dia/mês/ano** (nunca mês/dia).

### 3.4 Coluna TEMPO

- Inteiro (nenhum texto, nenhum vazio), representa **dias corridos entre ADMISSÃO e DATA**.
- **Verificado:** `TEMPO == DATA − ADMISSÃO` em **126 de 126** registros (diferença zero em todos). Portanto TEMPO é coerente e pode ser tanto usado direto quanto recalculado.
- Mín **2** · mediana **246** · máx **1801** dias (≈ 4,9 anos).
- Faixas: ≤ 30 dias: 7 · ≤ 90 dias: 31 · ≥ 365 dias: 48.
- **Não está em meses nem em anos.** Para exibir "tempo de empresa" de forma amigável será preciso converter (ex.: faixas "até 30 dias / 31–90 / 91–180 / 181–365 / 1–2 anos / 2+ anos" ou "X anos e Y meses"). **Definição das faixas é decisão pendente.**
- Por tipo de aviso (mediana de dias): Trabalhado 485 · Indenizado 132 · Término Contrato 90 (máx 90 — compatível com contrato de experiência).

### 3.5 Duplicidades

- Linhas duplicadas: **0**. COLABORADOR duplicado: **0**.
- `NOME_RED` duplicado (3 pares, pessoas diferentes):
  - `JOAO V.` → JOAO VICTOR BATISTA DOS SANTOS (loja 27) / JOAO VICTOR NASCIMENTO SOUZA (loja 14)
  - `JULIANA S.` → JULIANA SILVA DE ASSIS (loja 24) / JULIANA SILVA DOS SANTOS (loja 27)
  - `MARIA E.` → MARIA EDUARDA ALVES MORAIS (loja 15) / MARIA EDUARDA CARVALHO DOS SANTOS (loja 17)
- **Decisão:** **`NOME_RED` não pode ser usado como identificador.** Usar `COLABORADOR` (após `trim`) como chave. Não existe coluna de matrícula/ID.

### 3.6 Coluna DOCUMENTO

Valores: `EMPRESA` (89) · `EMPREGADO` (37). **Significado não confirmado pelo usuário.** Hipótese: indica **quem pediu/iniciou** o desligamento (empresa demitiu vs. empregado pediu demissão). Cruzamento com aviso prévio:

| T. AVISO PRÉVIO | EMPREGADO | EMPRESA |
|---|---|---|
| Indenizado | 35 | 21 |
| Trabalhado | 1 | 58 |
| Término Contrato | 1 | 10 |

> ⚠️ **Perguntar ao usuário** o que `DOCUMENTO` significa antes de exibir/rotular essa coluna. O usuário não a listou entre os itens do dashboard.

### 3.7 Valores de T. AVISO PRÉVIO

Apenas 3 valores, sem variações de grafia, sem vazios:

- `Trabalhado` — 59
- `Indenizado` — 56
- `Término Contrato` — 11

(Capitalização "Título" diferente das demais colunas, que são MAIÚSCULAS.)

### 3.8 Lojas

- **31 valores distintos**: números de **1 a 31, exceto a 7** (a loja 7 não aparece na base) **+ `RDS`**.
- **Tipo misto:** 121 inteiros + 5 textos `RDS`. Para filtros/ordenação é preciso tratar tudo como texto ou criar regra (números em ordem numérica, `RDS` por último).
- `RDS` (5 registros) aparenta ser um setor administrativo/escritório, não uma loja: as funções nele são ADMINISTRATIVO/ADM; gerente `RAQUEL`, supervisor `ISAAC`. **Confirmar com o usuário o que é RDS** e como rotulá-lo.
- Mais desligamentos por loja: 14 (8) · 12 (7) · 8, 10, 13, 20, 23, 26 (6 cada). Menos: loja 19 (1).
- Hierarquia: **cada loja tem exatamente 1 gerente e 1 supervisor** na base (nenhuma loja com 2 gerentes/supervisores). O gerente `RAQUEL` aparece em 2 "lojas" (9 e RDS).

### 3.9 Gerentes, supervisores e funções

**Supervisores (coluna `SUPER`) — 5:** ALYSSON 41 · MAICON 27 · MARCELLO 25 · RAFAEL 25 · ISAAC 8.

**Gerentes (30), qtde de desligados:** RAQUEL 8, BIANCA 8, NADSON 7, JULIANA 6, EMERSON 6, JESSICA 6, TARCISIO 6, ADRIANA 6, CAROL 6, WESLLEY 5, RAYANE 5, KLEBER 4, PEDRO 4, ROBSON 4, DÉBORA 4, REINANE 4, GABRIEL 4, BIVANILDO 4, HELDER 3, RAILSON 3, JAMILLE 3, ISMAELE 3, A.CARLOS 3, KEITH 3, JULIANE 2, MAILSON 2, BRUNO 2, SONIA 2, NARA 2, NIVIA 1.
- Só o primeiro nome (sem sobrenome) → **risco de homônimos** no futuro. Há `A.CARLOS` com ponto.
- Cada gerente pertence a um único supervisor.
- Atenção: `JULIANA` e `JULIANE` são gerentes diferentes (nomes parecidos, não é erro de digitação até prova em contrário).

**Funções (7 valores brutos):** BALCONISTA 69 · CAIXA 46 · AUXILIAR DE LOGISTICA 4 · ADMINISTRATIVO 3 · GERENTE 2 · FARMACEUTICO 1 · **ADM 1**.
- ⚠️ **Inconsistência:** `ADM` e `ADMINISTRATIVO` são o mesmo cargo escrito de duas formas (4 registros somados). Recomendação: **normalizar `ADM` → `ADMINISTRATIVO`** na camada de tratamento (sem alterar a planilha original).
- Sem acentos na base (`LOGISTICA`, `FARMACEUTICO`) — manter como está ou decidir se acentua na exibição.
- 2 desligados têm função `GERENTE` (ANDRE COSTA MORAIS, loja 25; DIEGO CHAVES DA SILVA, loja 30) — a coluna `GERENTE` desses registros mostra o gerente da loja (outra pessoa), então não há erro, mas pode confundir na leitura.

### 3.10 Resumo das inconsistências encontradas

| # | Problema | Impacto | Tratamento sugerido |
|---|---|---|---|
| 1 | `DATA` em 3 formatos (serial, texto, ―) | Datas aparecem como `46214` e filtros por período falham | Normalizar para ISO |
| 2 | `ADMISSÃO` em 2 formatos (texto `dd/mm/aaaa` e data real exibida `mm-dd-yy`) | Risco de inverter dia/mês | Normalizar; sempre dd/mm |
| 3 | `COLABORADOR` com espaço no final (63 linhas) | Busca/duplicidade falham | `trim()` |
| 4 | `LOJA` com tipo misto (inteiro + `RDS`) | Ordenação/filtro inconsistentes | Tratar como texto + regra de ordenação |
| 5 | `FUNÇÃO`: `ADM` vs `ADMINISTRATIVO` | Cargo contado em duplicidade | Normalizar |
| 6 | `NOME_RED` repetido (3 pares) | Não serve como chave | Usar `COLABORADOR` |
| 7 | `TEMPO` em dias | Ilegível para apresentação | Converter/agrupar em faixas |
| 8 | `DOCUMENTO` de significado incerto | Rótulo errado pode induzir erro | Confirmar com usuário |
| 9 | `RDS` não é número de loja | Pode confundir "loja" | Confirmar com usuário |
| 10 | Loja 7 ausente | Apenas observação (pode não ter desligamentos) | Nenhuma |
| 11 | Cabeçalhos com acento/ponto/espaço | Fácil errar a chave em JS | Mapear para chaves internas sem acento |

> Não foram encontrados: campos vazios, linhas duplicadas, datas inválidas, admissão posterior ao desligamento, datas futuras, divergência entre TEMPO e DATA−ADMISSÃO.

---

## 4. Análise do dashboard atual — `dashboard_atualizado.zip`

### 4.1 Estrutura de arquivos (tudo na raiz, sem subpastas, de propósito, para facilitar upload no GitHub)

| Arquivo | Tamanho | Linhas | Função |
|---|---|---|---|
| `index.html` | 12,9 KB | 263 | Estrutura da página |
| `style.css` | 17 KB | 811 | Tema visual (escuro, corporativo) |
| `app.js` | 55,6 KB | 1351 | Carga de dados, filtros, ordenação, exportações, abas |
| `README.md` | 3,2 KB | 64 | Instruções (parcialmente desatualizado — cita 3 arquivos e colunas diferentes das do app.js) |

Projeto: **"Registro & Venda"** — acompanhamento de registro de ponto/venda por colaborador de uma rede de farmácias. HTML/CSS/JS **puro**, sem frameworks, sem build, sem backend. Pensado para **GitHub Pages**.

### 4.2 HTML

- Layout `app` = `aside.sidebar` (menu lateral com marca, navegação, rodapé "Fonte: planilha BASE.xlsx") + `div.main` (`header.topbar` + `main.content`).
- Duas "páginas" na mesma HTML, alternadas por hash (`#registro`, `#mensal`) via JS (`showPage`/`setupRouter`).
- Página 1: painel de **filtros** (grid de `<select>` + busca por texto) + **tabela** ordenável + botão "Exportar CSV" + estado vazio.
- Página 2 ("Acompanhamento Mensal"): filtros, painel de "Exportar Consolidado", árvore expansível Supervisor → Loja → Colaborador, "Exportar PDF".
- Ícones: **SVG inline** (sem biblioteca de ícones). Fontes via **Google Fonts** (Inter e JetBrains Mono).
- Tem menu mobile (botão hambúrguer + overlay) e botão de recolher sidebar.

### 4.3 CSS

- Tema **escuro** via variáveis em `:root`:
  - fundos: `--bg #0b0f19`, `--sidebar-bg #0d1220`, `--panel-bg #141a29`, `--panel-bg-soft #121726`
  - bordas: `--border #232b3d`, `--border-soft #1b2233`
  - texto: `--text #e7eaf3`, `--text-dim #a3abc2`, `--text-faint #6b7690`
  - cores de destaque: `--accent #4c7cf0` (azul), `--green #2fbf83`, `--red #f0576a`, `--amber #e8a33d` (+ versões `-soft` com 10% de opacidade)
  - raios: 8 / 12 / 16 px; sidebar 248 px
  - fontes: **Inter** (texto) e **JetBrains Mono** (números)
- Seções: Sidebar, Main/topbar, Panels, Exportar Consolidado, Table panel, Overlay/responsive (breakpoints 980/860/620 px), Acompanhamento Mensal (árvore, mini-gráfico da loja), Exportar PDF (`@media print` com tema claro).
- Respeita `prefers-reduced-motion`.

### 4.4 JavaScript (`app.js`)

- **Carga de dados:** `fetch()` de **CSV publicado do Google Sheets** (2 URLs fixas no topo do arquivo, `SHEET_URLS.GERAL` e `SHEET_URLS.BASE`), com cache-busting (`&t=Date.now()`) e `cache: 'no-store'`. **Não há CSV/JSON local.** Parser CSV próprio (`parseCSV`, `csvToObjects`) que respeita aspas, separador vírgula.
- **Estado:** objeto `state` (`rows`, `filtered`, `filters`, `sort`).
- **Filtros:** `<select>` populados dinamicamente com valores únicos (`uniqueSorted` + `populateSelect`), mais busca por nome (case-insensitive, pt-BR). Filtros combináveis (AND). Botão "Limpar filtros". `applyFilters()` → `applySort()` → `renderTable()`.
- **Ordenação:** clique no cabeçalho (`data-key`), asc/desc.
- **Exportações (3):**
  1. **CSV** das linhas filtradas (`;` como separador, BOM UTF-8 `\uFEFF`, aspas escapadas, decimal com vírgula) via `Blob` + `<a download>`.
  2. **XLSX "Consolidado"** gerado **no navegador sem biblioteca** (ZIP "store" + CRC32 + XML escrito à mão: `zipStore`, `buildXlsx`) — limitado a **11 colunas fixas (A–K)** do relatório de banco de horas.
  3. **PDF** via `window.print()` + CSS `@media print` (esconde sidebar/filtros e mostra um cabeçalho de impressão com data/hora).
- **Formatação:** datas ISO → `dd/mm/aaaa` (`formatDate`), loja → `Loja 05` (`lojaLabel`), `escapeHtml` para evitar injeção ao montar HTML.
- **Gráficos:** **não usa nenhuma biblioteca de gráficos.** Só há um sparkline em SVG inline (`buildLojaSparkline`) e barras/indicadores em HTML/CSS.
- **Tratamento de erro:** chip no topo ("N registros carregados às HH:MM" / "Erro ao carregar dados").

### 4.5 Padrão visual (a manter para coerência com o dashboard atual)

Tema escuro corporativo; sidebar à esquerda; topbar com breadcrumb + título + chip de status; painéis com borda fina e cantos arredondados; selects em grid; tabela com cabeçalho ordenável; selos (badges) coloridos verde/vermelho/âmbar; números em fonte mono; responsivo com menu mobile.

### 4.6 O que PODE ser reaproveitado (copiando — nunca vinculando ao projeto atual)

- Variáveis CSS / tokens de design (`:root`) e estilos de `.panel`, `.filters-grid`, `.field`, `.btn-ghost`, tabela, badges, chip de carga, `empty-state`.
- Estrutura de layout (sidebar + topbar + content) e comportamento responsivo/menu mobile.
- Funções utilitárias genéricas: `parseCSV`/`csvToObjects` (se a fonte for CSV), `uniqueSorted`, `populateSelect`, `escapeHtml`, `formatDate`, padrão `state` + `applyFilters` + `applySort` + `renderTable`.
- Padrão de **exportação CSV** (`;`, BOM UTF-8, aspas).
- Padrão de **cabeçalho de impressão + `@media print`** para PDF.
- Padrão de sparkline SVG inline (inspiração para gráficos simples sem biblioteca).

### 4.7 O que NÃO deve ser reaproveitado

- **As URLs do Google Sheets** (`SHEET_URLS`) — apontam para a planilha do dashboard atual. Usá-las poderia misturar dados/quebrar o projeto existente.
- Toda a lógica de **Registro e Venda**: colunas `NOME/LOJA/DT/DIA/STATUS_RH/VENDA`, `STATUS_RH`, R$, `DIA_LABELS`, `formatMoney`, `statusBadgeClass`.
- Toda a lógica de **Acompanhamento Mensal / banco de horas**: `BANCO`, `MÊS`, `MES_LABELS`, trimestres/semestres, `buildLoja*`, `computeColabPeriodo`, árvore Supervisor→Loja→Colaborador.
- **Exportador XLSX/Consolidado** (colunas A–K fixas, específico do banco de horas) — só reaproveitar se for necessário exportar XLSX, e então reescrevendo para as colunas de desligamentos.
- Textos, marca, ícones e menu (`Registro & Venda`, `Rede de Farmácias`, `Fonte: planilha BASE.xlsx`, itens de navegação).
- CSS específico das telas mensais e `#pageRegistro` no `@media print`.
- `lojaLabel` assume loja **numérica** (`Loja 05`) — não serve para `RDS`.
- **`README.md`** do dashboard atual (desatualizado).
- Nunca editar `app.js`, `index.html` ou `style.css` do dashboard atual.

### 4.8 Observações/riscos do dashboard atual

- `README.md` está desatualizado em relação ao `app.js` (colunas da aba GERAL diferem; README fala em 3 arquivos).
- A fonte `Google Fonts` exige internet.
- O dashboard é público se hospedado no GitHub Pages (ver risco de privacidade abaixo).

---

## 5. Decisões tomadas até agora

1. Projeto **independente** do dashboard atual (pasta própria, nada compartilhado, nenhuma URL reaproveitada).
2. Desenvolvimento **por etapas**, parando após cada uma para autorização.
3. **Nunca alterar** `BASE_DESLIGADOS.xlsx` nem a planilha-fonte. Toda normalização ocorre **apenas na camada do dashboard** (`data.js`); o valor original fica em `registro.raw`.
4. `COLABORADOR` (com trim) é a chave; `NOME_RED` não é identificador. Não há matrícula.
5. Manter o padrão visual do dashboard atual (tema escuro corporativo).
6. **Carga de dados (definido pelo usuário):** **nova planilha Google Sheets**, separada da do dashboard atual, lida como CSV publicado. Meta: o usuário adiciona desligamentos na planilha e o dashboard atualiza sozinho (busca com cache-busting a cada carregamento).
7. **Privacidade:** repositório GitHub **privado**; dados de colaboradores não devem ficar públicos. ⚠️ Atenção: "Publicar na web" do Google Sheets gera uma URL acessível a quem a tiver, e essa URL ficará no `config.js` do repositório. Ver pendência 1 da seção 7.
8. **DOCUMENTO:** `EMPRESA` = desligamento iniciado pela empresa; `EMPREGADO` = iniciado pelo colaborador. É **apenas classificação da base** — o dashboard não deve fazer conclusões/análises sobre "quem causa" os desligamentos. Rótulo sugerido no futuro: "Iniciado por".
9. **RDS** é unidade/local válido, igual às lojas numeradas. **Não excluir nem recategorizar** sem autorização. Hoje: `lojaLabel` = "RDS" (valor original), `lojaOrdem` = 1000 (aparece após as lojas numeradas); lojas numéricas viram "Loja 05".
10. **Tempo de empresa:** manter o valor original em dias (`tempoDias`); a faixa é calculada só no dashboard (`faixaTempo`/`faixaTempoLabel`): Até 30 dias (≤30) · 31 a 90 · 91 a 180 · 181 a 365 · 1 a 2 anos (366–730) · Mais de 2 anos (>730). Interpretação adotada: 365 dias fica em "181 a 365"; 730 em "1 a 2 anos".
11. **Gráficos:** liberado usar **Chart.js** (autorizado pelo usuário). Ainda não incluído. Sugestão para a Etapa 6: versão fixa via CDN (cdn.jsdelivr.net/npm/chart.js@4.x) ou arquivo local `chart.umd.min.js` no projeto, se o chefe for apresentar offline.
12. **ADM = ADMINISTRATIVO** para visualização/agrupamento (mapa `FUNCAO_ALIASES` em `data.js`). Função original preservada em `funcaoOriginal`.
13. Datas: sempre interpretadas como **dia/mês/ano**; formatos aceitos: `dd/mm/aaaa`, `aaaa-mm-dd` e serial numérico. Qualquer outro formato **não é adivinhado**: gera erro de validação visível. Todo registro tem também a checagem cruzada `TEMPO == DATA − ADMISSÃO`.
14. Registros com problema **não são descartados**; são mantidos e listados em `problemas` (tipo `erro` ou `aviso`, com nº da linha da planilha).
15. **(Etapa 3)** Layout **sem sidebar**: página única de largura máxima 1280 px, centralizada — mais simples que o dashboard atual, com identidade própria. Reaproveita apenas os tokens de cor/raio do tema escuro.
16. **(Etapa 3)** Título da página: **"Desligamentos"**; subtítulo: **"Visão geral dos colaboradores desligados"**. Indicação discreta de base no canto direito do cabeçalho: `Base: arquivo local de teste · N registros · carregada às HH:MM` (troca para "Google Sheets" automaticamente quando `SHEET_CSV_URL` for preenchida). Ponto verde = carregou; vermelho = erro.
17. **(Etapa 3)** Cards: **Total de desligamentos, Trabalhado, Indenizado, Término de contrato** — contados em tempo real sobre `registros` (comparação do `avisoPrevio` sem acento/caixa). Sem percentuais nem outros indicadores. Cores: só um traço azul no card Total e um ponto de cor discreto (verde/âmbar/cinza) nos demais.
18. **(Etapa 3)** Espaços reservados (`#areaFiltros`, `#areaGraficos` com `#slotGrafico1`/`#slotGrafico2`, `#areaTabela`) são containers vazios com borda tracejada e apenas o título da seção — **sem conteúdo fictício**. A quantidade/disposição dos gráficos (2 slots) é provisória e pode mudar na Etapa 6.
19. **(Etapa 3)** Sem fontes externas (usa Inter se instalada, senão a fonte do sistema), sem animações, sem bibliotecas.
20. **(Etapa 4)** **Camada de dados (`data.js`) e `config.js` não foram alterados.** A filtragem vive em arquivo novo e separado (`filtros.js`), sem DOM, testável em Node.
21. **(Etapa 4)** **Período = intervalo de datas** (Data inicial / Data final, ambos opcionais, limites **inclusivos**), aplicado sobre a **DATA do desligamento** (`registro.data`, ISO da Etapa 2). Os campos `<input type="date">` entregam ISO `AAAA-MM-DD` e a comparação é feita como texto ISO, então **não existe conversão dd/mm ↔ mm/dd** no filtro. A tela exibe o formato do idioma do navegador (em pt-BR: dd/mm/aaaa). Só data inicial = "a partir de"; só final = "até". Se inicial > final: 0 resultados + mensagem "A data inicial é posterior à data final." (resolve a pendência 5 da seção 7; um filtro por mês isolado não foi criado — o usuário escolhe o primeiro e o último dia).
22. **(Etapa 4)** Todos os filtros combinam com **E** (todos precisam ser atendidos). Cada um vazio = "Todos"/"Todas".
23. **(Etapa 4)** As listas de opções vêm da base **inteira** e **não são interdependentes** (escolher um supervisor não reduz a lista de lojas/gerentes); combinações impossíveis simplesmente dão 0 resultados com mensagem amigável. Mantido assim por simplicidade.
24. **(Etapa 4)** Loja: valor = `registro.loja`, rótulo = `lojaLabel` ("Loja 05", "RDS"); ordem numérica com RDS por último; 31 opções (sem a loja 07, que não existe na base). Função: usa `registro.funcao` (já normalizada; "ADM" não aparece como opção, fica em ADMINISTRATIVO). Tipo de aviso: ordem fixa Trabalhado · Indenizado · Término Contrato (valores novos que apareçam na base entram depois).
25. **(Etapa 4)** Busca por colaborador: só no campo `colaborador`; ignora acento, caixa e espaços extras; é **parcial** (trecho em qualquer posição do nome); com várias palavras, **todas** precisam aparecer, em qualquer ordem ("eduarda maria" acha MARIA EDUARDA…). `NOME_RED` não entra na busca.
26. **(Etapa 4)** Cards e contador usam `state.filtrados`; sem resultado, os cards mostram 0 e aparece a mensagem "Nenhum desligamento encontrado para os filtros selecionados." dentro do painel de filtros (a tabela da Etapa 5 pode ter o próprio estado vazio). Contador no singular/plural ("1 desligamento encontrado" / "N desligamentos encontrados"). Os filtros ficam desabilitados até a carga terminar (ou se houver erro de carga).
27. **(Etapa 4)** **Contrato para a Etapa 5:** usar `window.DESLIG_STATE.filtrados` (lista já filtrada, mesma estrutura de `registros`) e/ou ouvir `document.addEventListener('desligamentos:filtrados', e => e.detail.registros)`. `state.registros` continua sendo a base completa e nunca é modificada.
28. **(Etapa 5)** Lógica da tabela em arquivo novo e separado (`tabela.js`). **`app.js`, `data.js`, `filtros.js`, `config.js` e o CSV de teste não foram alterados** (conferido byte a byte com o zip da Etapa 4). A tabela **não tem filtragem própria**: lê `window.DESLIG_STATE.filtrados` e é redesenhada pelo evento `desligamentos:filtrados` (contrato da decisão 27).
29. **(Etapa 5)** **Tempo de empresa (resolve a pendência 4 da seção 7):** mês = 30 dias, ano = 365 dias. Até 30 dias → `N dias` · de 31 dias a menos de 1 ano → `X meses e Y dias` (dias omitidos se 0) · 1 ano ou mais → `X anos e Y meses` (os dias restantes são descartados → valor aproximado; meses omitidos se 0). Singular/plural tratados (`1 dia`, `1 mês`, `1 ano`). Exemplos: 2 → 2 dias · 30 → 30 dias · 45 → 1 mês e 15 dias · 180 → 6 meses · 365 → 1 ano · 485 → 1 ano e 4 meses · 1801 → 4 anos e 11 meses. Limite: nos anos ≥ 1 os meses são limitados a 11. O valor original em dias continua em `tempoDias` e aparece ao passar o mouse sobre a célula (`title`, ex.: "485 dias"). As faixas da decisão 10 continuam existindo e não são usadas na tabela.
30. **(Etapa 5)** **T. AVISO PRÉVIO** em badges discretos (contorno e fundo translúcido): Trabalhado (verde), Indenizado (âmbar), **Término de Contrato** (cinza). O rótulo exibido é "Término de Contrato" (como o usuário escreveu); o valor da base continua "Término Contrato". Valor desconhecido aparece como está, em badge cinza.
31. **(Etapa 5)** **Colunas (ordem pedida):** COLABORADOR · DATA DO DESLIGAMENTO · LOJA · GERENTE · SUPER · FUNÇÃO · TEMPO DE EMPRESA · T. AVISO PRÉVIO. DOCUMENTO e ADMISSÃO **não** aparecem (ficam para o detalhe do colaborador). Colaborador = nome já tratado (`registro.colaborador`, sem espaços extras); o original continua em `raw`. Data = `dd/mm/aaaa` montada só por texto a partir do ISO (sem `Date` → sem inversão dia/mês). Loja = `lojaLabel` ("Loja 05" / "RDS"). Função = `registro.funcao` (ADM → ADMINISTRATIVO).
32. **(Etapa 5)** **Ordenação** (clique no cabeçalho, sem recarregar): Data, Colaborador, Loja, Função e Tempo de empresa; Gerente, Super e Aviso não ordenam. **Padrão: Data decrescente (mais recentes primeiro).** Clicar na mesma coluna inverte; coluna nova começa em A→Z/crescente (Data começa em decrescente). Loja: numéricas em ordem e RDS por último. Desempate fixo: colaborador A→Z, depois nº da linha. Valores ausentes ficam no fim. A ordenação é feita **numa cópia** (`state.filtrados` e `state.registros` nunca mudam). Mudar a ordenação volta à página 1; a ordenação escolhida **permanece** ao mudar filtros. Indicador ▲/▼ no cabeçalho + `aria-sort`.
33. **(Etapa 5)** **Paginação:** 20 por página; texto `Mostrando 1–20 de 126 desligamentos` (singular quando 1); controles `Anterior | 1 2 3 4 … 7 | Próximo` (janela: primeira, última e vizinhas da atual); controles ocultos quando só há 1 página (o texto continua). Qualquer mudança de filtro, "Limpar filtros" ou mudança de ordenação volta à página 1. Ao trocar de página, se o início da tabela saiu da tela, a página rola de volta até ele.
34. **(Etapa 5)** **Sem resultados:** a tabela, o cabeçalho e o rodapé somem e aparece só a mensagem centralizada "Nenhum desligamento encontrado para os filtros selecionados." (também quando data inicial > final; a mensagem específica desse caso continua no painel de filtros).
35. **(Etapa 5)** **Responsividade:** a tabela fica num contêiner com `overflow-x:auto` e largura mínima de 960 px; em telas estreitas só a tabela rola na horizontal, a página não. Nomes longos quebram em duas linhas; demais colunas não quebram.
36. **(Etapa 6)** Lógica dos gráficos em arquivo novo e separado (`graficos.js`). **`app.js`, `data.js`, `filtros.js`, `tabela.js`, `config.js` e o CSV de teste não foram alterados** (conferido byte a byte com o zip da Etapa 5). Os gráficos **não têm filtragem própria**: leem `window.DESLIG_STATE.filtrados` e redesenham no evento `desligamentos:filtrados` (decisão 27), junto com cards e tabela.
37. **(Etapa 6)** **Chart.js 4.5.1 como arquivo local** (`chart.umd.min.js`, na raiz), em vez de CDN — resolve a decisão 11: funciona offline na apresentação e a versão fica fixa. Nenhum framework nem outra dependência. Animações desligadas; sem fontes externas.
38. **(Etapa 6)** **Gráfico 1 — Desligamentos por mês** (barras verticais; usa `registro.mes`, derivado da DATA já normalizada em dd/mm/aaaa). **O eixo mostra todos os meses do período da base completa** (hoje Jan–Out/2026, em ordem cronológica) e **não muda ao filtrar**: meses sem registro ficam em 0, para a posição de cada mês permanecer estável. Rótulos do eixo abreviados (Jan, Fev…) para caber em tela pequena; o nome completo (Janeiro…) aparece no tooltip. Se a base passar a cobrir mais de um ano, os rótulos ganham o ano (ex.: Jan/26). Novembro e Dezembro só aparecem quando houver dados até lá.
39. **(Etapa 6)** **Gráfico 2 — Desligamentos por tempo de empresa** (barras horizontais): usa `registro.faixaTempo`, calculada em `data.js` a partir do `TEMPO` original em dias (decisão 10) — **nenhuma regra nova de faixa**. Rótulos de exibição: Até 30 dias · 31–90 dias · 91–180 dias · 181–365 dias · 1–2 anos · > 2 anos (mesma ordem; 365 dias continua em 181–365 e 730 em 1–2 anos).
40. **(Etapa 6)** **Visual:** cor das barras = `--accent` do tema; texto/grades com `--text-dim`/`--border-soft`; tooltip no estilo dos painéis; valor escrito sobre/ao lado de cada barra (barras com 0 ficam sem número); eixo de valores em inteiros. Desktop (>1024 px): painéis lado a lado; ≤1024 px: uma coluna. Altura 300 px (260 px em ≤600 px). Painéis usam o mesmo `.slot` dos demais.
41. **(Etapa 6)** **Sem resultados:** os dois painéis mostram a mensagem "Nenhum desligamento encontrado para os filtros selecionados." no lugar do gráfico. Se a biblioteca não carregar, o painel mostra "Não foi possível carregar a biblioteca de gráficos." (o resto do dashboard continua funcionando). Cada `canvas` tem `aria-label` atualizado com os valores.
42. **(Etapa 6)** ⚠️ O pedido da Etapa 6 chegou **cortado na seção 10** ("A soma pre…"): as instruções finais (soma esperada, testes e encerramento) não foram recebidas. Foram aplicados o que estava claro (validar mês e faixas contra a planilha, soma = 126) e a rotina de encerramento das etapas anteriores (testar, atualizar histórico, gerar ZIP, parar e aguardar). Se havia mais algum requisito ou teste obrigatório no trecho cortado, informar.

43. **(Etapa 8 — bloco 1)** Exportação em arquivo novo e separado (`exportacao.js`). **`app.js`, `data.js`, `filtros.js`, `tabela.js`, `graficos.js`, `config.js`, `chart.umd.min.js` e o CSV de teste não foram alterados** (conferido com `cmp` contra o zip recebido). Para não conflitar com a Etapa 7 (que não veio no zip), a barra de exportação é **injetada por JavaScript** abaixo do título `.slot-title` de `#areaTabela`: o `index.html` só ganhou **1 linha** (`<script src="exportacao.js">`, entre `graficos.js` e `app.js`) e o `style.css` só ganhou um bloco **acrescentado** (`.export-bar`, `.export-actions`, `.export-label`, `.export-erro`).
44. **(Etapa 8 — bloco 1)** **Regra principal:** o arquivo contém **todos** os registros de `DESLIG_STATE.filtrados`, lidos no momento do clique; a paginação é só visual (testado exportando na página 2 e na última). Não existe segunda lógica de filtro. A **ordem das linhas segue a ordenação atual da tabela** (lida do `aria-sort` dos cabeçalhos; padrão = data, mais recentes primeiro) usando `TabelaDesligamentos.ordenar` numa cópia — `state.filtrados` nunca é reordenado.
45. **(Etapa 8 — bloco 1)** **Colunas (12, nesta ordem):** COLABORADOR · NOME_RED · ADMISSÃO · DATA DO DESLIGAMENTO · DOCUMENTO · T. AVISO PRÉVIO · LOJA · GERENTE · SUPER · FUNÇÃO · TEMPO DE EMPRESA · TEMPO (DIAS). DOCUMENTO sai com o valor da base (EMPRESA/EMPREGADO); o rótulo "Iniciado por" (pendência 6) **não** foi aplicado. Normalização **só na saída**: datas dd/mm/aaaa (montadas por texto a partir do ISO, sem `Date` → sem inverter dia/mês), loja "Loja 05"/"RDS", função ADM → ADMINISTRATIVO (já vem de `registro.funcao`), aviso Trabalhado/Indenizado/Término de Contrato, tempo amigável pela mesma `formatarTempo` da tabela (decisão 29), `TEMPO (DIAS)` = valor numérico original. Campo ausente (ex.: NOME_RED vazio) sai **vazio** (nunca "undefined"/"null"/"—").
46. **(Etapa 8 — bloco 1)** **Excel:** `desligamentos_AAAA-MM-DD.xlsx` (data local do computador; não informa filtros). Gerado no navegador **sem biblioteca** (nada de CDN nem de arquivo `.js` extra): ZIP sem compressão com 6 partes (`[Content_Types].xml`, `_rels/.rels`, `xl/workbook.xml`, `xl/_rels/workbook.xml.rels`, `xl/styles.xml`, `xl/worksheets/sheet1.xml`), aba única "Desligamentos", cabeçalho em negrito com fundo claro, **linha de cabeçalho congelada, filtro automático e larguras de coluna** ajustadas. **ADMISSÃO e DATA DO DESLIGAMENTO são datas reais do Excel com formato `dd/mm/yyyy`** (aparecem dd/mm/aaaa e dá para ordenar/filtrar por data); `TEMPO (DIAS)` é número; os demais são texto. Escolhido em vez de SheetJS/ExcelJS para não adicionar dependência (o dashboard atual já usa a mesma técnica).
47. **(Etapa 8 — bloco 1)** **CSV:** `desligamentos_AAAA-MM-DD.csv`, UTF-8 **com BOM**, separador **`;`** (padrão do Excel em português; mesmo padrão do dashboard atual), linhas CRLF, cabeçalho, mesmas 12 colunas/linhas do Excel (datas como texto dd/mm/aaaa, `TEMPO (DIAS)` inteiro puro). Campos com `;`, aspas ou quebra de linha são colocados entre aspas (aspas duplicadas). Texto que começa com `=`, `+`, `-`, `@` ganha um `'` na frente para o Excel não interpretar como fórmula (não ocorre na base atual).
48. **(Etapa 8 — bloco 1)** **Interface:** área discreta acima da tabela: à esquerda "N registros para exportar" (singular "1 registro"; acompanha os filtros), à direita "Exportar: [Excel] [CSV]" (estilo `.btn-ghost`, 30 px). Com 0 resultados os dois botões ficam **desabilitados** e o contador mostra "0 registros para exportar". Falha ao gerar o arquivo → mensagem "Não foi possível gerar o arquivo." no próprio painel e erro no console.

## 6. Problemas encontrados

Ver tabela da seção 3.10 (base) e seção 4.8 (dashboard). Resumo dos mais relevantes: datas em formatos mistos; espaços no final dos nomes; loja com tipo misto (`RDS`); `ADM` vs `ADMINISTRATIVO`; `TEMPO` em dias; `NOME_RED` repetido.

## 7. Itens pendentes / perguntas em aberto

Respondidos pelo usuário (ver seção 5): fonte de dados, privacidade, significado de DOCUMENTO, RDS, faixas de tempo, Chart.js, ADM.

Ainda pendentes:

1. **Criar a planilha nova no Google Sheets** (aba `BASE`, 11 cabeçalhos idênticos aos da base), publicar em CSV e colar a URL em `config.js` → `SHEET_CSV_URL`. Até lá o dashboard usa o CSV local de teste. ⚠️ Decidir se a exposição por URL publicada é aceitável (a URL não é adivinhável, mas quem a tiver vê os dados); alternativa mais restrita seria outra forma de carga — discutir se necessário.
2. **GitHub Pages em repositório privado** depende do plano do GitHub; confirmar como o chefe acessará (Pages privado, uso local, etc.).
3. Formato de datas na planilha nova: recomendado formatar `ADMISSÃO` e `DATA` como dd/mm/aaaa.
4. ~~Definir como exibir "tempo de empresa"~~ → resolvido na Etapa 5: "X anos e Y meses" / "X meses e Y dias" / "N dias" (decisão 29).
5. ~~Período: filtro por mês, intervalo de datas ou ambos~~ → resolvido na Etapa 4: intervalo de datas (decisão 21).
6. Rótulo final do campo DOCUMENTO (sugestão: "Iniciado por").
7. Teste real da conexão com o Google Sheets: **não foi possível testar** (URL ainda não existe). Parser testado apenas com CSV local.

## 8. Arquivos que NÃO devem ser alterados

- `BASE_DESLIGADOS.xlsx` (original — somente leitura)
- `dashboard_atualizado.zip` e **todo** o conteúdo: `index.html`, `style.css`, `app.js`, `README.md` do dashboard atual
- Não usar nem apontar para as URLs do Google Sheets do dashboard atual.

## 9. Resumo numérico da base (para conferência futura)

126 registros · 11 colunas · período 06/01/2026–01/10/2026 · 31 lojas distintas (1–31 sem a 7, + RDS) · 30 gerentes · 5 supervisores · 7 funções brutas (6 após normalizar ADM) · avisos: Trabalhado 59 / Indenizado 56 / Término Contrato 11 · DOCUMENTO: EMPRESA 89 / EMPREGADO 37 · TEMPO: mín 2, mediana 246, máx 1801 dias.

## 10. Próxima etapa (SOMENTE após autorização do usuário)

**Etapa 7 (não iniciada):** detalhe do colaborador (modal/painel a partir de uma linha da tabela), usando os campos que não aparecem na tabela: ADMISSÃO e DOCUMENTO (rótulo sugerido: "Iniciado por" — pendência 6 da seção 7). Continuar consumindo `DESLIG_STATE.filtrados`.

Seguintes (cada uma com autorização separada): 8 = exportação · 9 = revisão final/apresentação.

## 10b. Etapa 2 — o que foi feito (resultado)

**Modelo de registro** produzido por `data.js` (um por linha da planilha): `linha`, `colaborador` (trim), `nomeRed`, `admissao` (ISO), `data` (ISO), `mes` (AAAA-MM), `documento`, `avisoPrevio`, `loja`, `lojaLabel`, `lojaOrdem`, `gerente`, `supervisor`, `tempoDias` (original, inteiro), `faixaTempo`, `faixaTempoLabel`, `funcao` (normalizada), `funcaoOriginal`, `raw` (valores originais).
API: `Desligamentos.carregar(cfg)`, `.processCsv(texto)`, `.parseData(valor)`, `.faixaDoTempo(dias)`, `.FAIXAS_TEMPO`. Resultado: `{ registros, resumo, problemas, origem }`.
Cabeçalhos são casados por chave normalizada (sem acento/pontuação): `T. AVISO PRÉVIO` → `T_AVISO_PREVIO`. Falta de coluna obrigatória → erro explícito. Separador `,` ou `;` detectado automaticamente.

**Verificação (Node, com o CSV de teste):** 126 registros · período 06/01/2026–01/10/2026 · 31 lojas/unidades (RDS = 5 registros preservados) · 30 gerentes · 5 supervisores · funções: BALCONISTA 69, CAIXA 46, ADMINISTRATIVO 4 (3+1 ADM), AUXILIAR DE LOGISTICA 4, GERENTE 2, FARMACEUTICO 1 · aviso: Trabalhado 59, Indenizado 56, Término Contrato 11 · documento: EMPRESA 89, EMPREGADO 37 · faixas: até 30 = 7, 31–90 = 24, 91–180 = 18, 181–365 = 29, 1–2 anos = 24, mais de 2 anos = 24 (soma 126) · 63 nomes com espaço removido · **0 erros e 0 avisos de validação** (confirma dd/mm nas 8 admissões com data real e TEMPO coerente em todos).
Não testado em navegador real (apenas lógica em Node); a página `index.html` mostra o diagnóstico ao ser aberta via servidor.

## 10c. Etapa 3 — o que foi feito (resultado)

**Alterado:** `index.html`, `style.css`, `app.js` (reescritos por completo) e `README.md` (uma linha da descrição). `config.js` e `data.js` **não foram tocados** (conferido por diff com o zip da Etapa 2). O painel provisório de diagnóstico da Etapa 2 **não foi apagado**: ficou oculto e aparece com `?diagnostico` na URL.
**Estrutura da página:** cabeçalho (título, subtítulo, indicação de base) → 4 cards → área de Filtros → área de Gráficos (2 slots) → área da Tabela ("Colaboradores desligados").
**Ganchos para as próximas etapas:** `window.DESLIG_STATE.registros` continua sendo a fonte; containers `#areaFiltros`, `#slotGrafico1`, `#slotGrafico2`, `#areaTabela` (corpo = `.slot-body`).
**Responsividade:** cards em 4 colunas (>1024 px) → 2 colunas (≤1024 px) → 1 coluna (≤360 px); gráficos lado a lado → empilhados (≤1024 px); espaçamentos e tamanho do número reduzidos em ≤600 px.

**Testes realizados** (Chromium headless via Playwright, servidor `python3 -m http.server`, CSV local de teste):

| Teste | Resultado |
|---|---|
| Registros carregados | ✅ 126 |
| Card Total | ✅ 126 |
| Card Trabalhado | ✅ 59 |
| Card Indenizado | ✅ 56 |
| Card Término de contrato | ✅ 11 |
| Erros de JavaScript (pageerror, console.error, requisições falhas) em todas as larguras | ✅ nenhum |
| Layout em 1440 / 1024 / 768 / 480 / 375 / 320 px | ✅ sem rolagem horizontal; nenhum card/área ultrapassa a largura |
| Colunas dos cards por largura | ✅ 4 (1440) · 2 (1024, 768, 480, 375) · 1 (320) |
| Modo `?diagnostico` | ✅ 126 registros, período 06/01/2026–01/10/2026, 31 lojas, 30 gerentes, 5 supervisores |
| Inspeção visual (captura em 1440 px) | ✅ hierarquia e espaçamento adequados |

**Não testado:** abertura via `file://` (o `fetch` do CSV local exige servidor — já documentado); conexão com Google Sheets (URL ainda não existe); navegadores diferentes de Chromium; nas larguras menores a ausência de quebra foi verificada por medição (sem estouro horizontal), sem inspeção visual das capturas.

## 10d. Etapa 4 — o que foi feito (resultado)

**Arquivos alterados:** `index.html` (painel de filtros no lugar do container vazio + `<script src="filtros.js">`), `style.css` (estilos dos filtros, apenas acrescentados), `app.js` (reescrito por completo com a lógica de UI dos filtros), `README.md`, `HISTORICO_PROJETO.md`. **Arquivo novo:** `filtros.js`. **Não alterados:** `data.js`, `config.js`, `dados/BASE_DESLIGADOS_teste.csv`. A regra `.slot-body-sm` do CSS ficou sem uso (mantida, sem prejuízo).
**Campos:** Data inicial · Data final · Loja · Gerente · Supervisor · Função · Tipo de aviso · Colaborador (busca) + botão **Limpar filtros** + contador "N desligamentos encontrados". Grade de 4 colunas (>1024 px) → 2 (≤1024 px) → 1 (≤360 px).
**Não implementado (como pedido):** tabela, gráficos, exportação, modal, Google Sheets.

**Testes realizados** (Chromium headless/Playwright; CSV local de teste). Os valores esperados foram calculados **de forma independente, direto de `BASE_DESLIGADOS.xlsx`** (script Python próprio, com a mesma regra dd/mm/aaaa), e comparados com o resultado exibido na tela. **51 checagens, 0 falhas, 0 erros de JavaScript.**

| # | Teste | Resultado |
|---|---|---|
| 1 | Sem filtros | ✅ 126 (cards 126/59/56/11; contador "126 desligamentos encontrados") |
| 2–4 | Trabalhado / Indenizado / Término Contrato | ✅ 59 / 56 / 11 |
| 5 | Período: setembro/2026 | ✅ 7 · agosto 18 · 18/08 isolado 2 (inclui o registro cuja DATA está em texto) · 01/10 isolado 1 (limite inclusivo) · só inicial 01/09 → 8 · só final 31/01 → 10 |
| 6 | Loja 14 → 8 · RDS → 5 · 32 opções (Todas + 31), "Loja 01" primeira, "RDS" última, sem Loja 07 | ✅ |
| 7 | Supervisor MARCELLO → 25 · Gerente RAQUEL → 8 | ✅ |
| 8 | Função ADMINISTRATIVO → 4 (ADM agrupado; "ADM" não é opção) · BALCONISTA → 69 | ✅ |
| 9 | Busca parcial: "maria" → 4 · "MARIA EDU" → 2 · "eduarda maria" → 2 · "  joão  " (acento/espaços) → 2 · trecho no meio do nome | ✅ |
| 10 | Combinações: MARCELLO+BALCONISTA+Trabalhado → 8 · ALYSSON+CAIXA+mar–mai → 3 · **Loja 05+MARCELLO+BALCONISTA (exemplo do pedido) → 1** | ✅ |
| 11 | Limpar filtros (após 5 filtros ativos) | ✅ 8 controles zerados, 126 registros, cards 126/59/56/11, mensagem oculta |
| 12 | Cards acompanham os filtros (soma dos 3 tipos = total, em todas as combinações) | ✅ |
| 13 | Nenhum resultado (Loja 14 + ISAAC · busca "zzzz" · data inicial > final) | ✅ cards 0/0/0/0, contador "0 desligamentos encontrados", mensagem amigável |
| — | Singular/plural do contador · evento `desligamentos:filtrados` (ISAAC → 8) · base completa intacta (126) · `?diagnostico` continua funcionando | ✅ |
| — | Layout em 1440 / 1024 / 768 / 480 / 375 / 320 px | ✅ sem rolagem horizontal nem elementos estourando; filtros em 4 → 2 → 1 colunas; capturas de 1280 (estado vazio) e 375 px inspecionadas visualmente |

**Observações / não testado:** (a) o Chromium de teste usa idioma en-US, por isso os campos de data apareceram como `mm/dd/yyyy`; em navegador pt-BR aparecem como dd/mm/aaaa — o valor interno é sempre ISO, sem risco de inversão; (b) seletor de data nativo e abertura de listas em celular real não foram testados; (c) navegadores diferentes de Chromium e `file://` não testados; (d) conexão com Google Sheets continua não testada (URL inexistente).

## 10e. Etapa 5 — o que foi feito (resultado)

**Arquivos alterados:** `index.html` (tabela no lugar do container vazio de `#areaTabela` + `<script src="tabela.js">`; só 2 linhas antigas trocadas, o resto acrescentado), `style.css` (apenas acrescentado: tabela, badges, paginação), `README.md`, `HISTORICO_PROJETO.md`. **Arquivo novo:** `tabela.js`. **Não alterados (conferido com `cmp` contra o zip da Etapa 4):** `app.js`, `data.js`, `filtros.js`, `config.js`, `dados/BASE_DESLIGADOS_teste.csv`. A regra `.slot-body-lg` do CSS ficou sem uso (mantida, sem prejuízo).
**Não implementado (como pedido):** gráficos, exportação, modal/detalhe, Google Sheets, novos indicadores.

**Testes realizados** (Chromium headless/Playwright em `python3 -m http.server`, CSV local de teste). Os valores esperados foram calculados **direto de `BASE_DESLIGADOS.xlsx`** por script Python independente (datas dd/mm/aaaa, rótulos de loja, ADM→ADMINISTRATIVO, regra de tempo reimplementada), e comparados com o texto exibido nas células. **43 checagens, 0 falhas, 0 erros de JavaScript.**

| # | Teste | Resultado |
|---|---|---|
| 1 | Sem filtros | ✅ 126 (contador 126; "Mostrando 1–20 de 126 desligamentos") |
| 2 | Primeira página | ✅ 20 linhas; cabeçalhos na ordem pedida; "Anterior" desabilitado, página 1 ativa |
| 3 | Última página | ✅ página 7 com 6 linhas ("Mostrando 121–126 de 126"); "Próximo" desabilitado |
| — | Conteúdo completo | ✅ as 126 linhas (percorrendo as 7 páginas) iguais à planilha em data, loja, gerente, super, função, tempo e aviso |
| 4 | Ordenação por data | ✅ padrão = mais recentes primeiro (01/10/2026 → 06/01/2026) em todas as páginas; clique inverte; `aria-sort` correto; ordenar na página 3 volta à página 1 |
| 5 | Ordenação por colaborador | ✅ A→Z e Z→A nas 126 linhas |
| 6 | Ordenação por função | ✅ A→Z e Z→A (ADMINISTRATIVO … GERENTE) |
| 7 | Ordenação por tempo | ✅ crescente (2 → 1801 dias) e decrescente; **loja** 01…31 com RDS por último; `state.filtrados`/`registros` não mudam ao ordenar (126, `raw` e `tempoDias` preservados) |
| 8 | Poucos registros | ✅ supervisor ISAAC = 8 linhas, sem controles de paginação |
| 9 | Exatamente 20 | ✅ Indenizado de 01/02 a 30/04/2026 (20 na planilha) = 20 linhas, 1 página, sem controles |
| 10 | Mais de 20 | ✅ BALCONISTA = 69 → páginas 20/20/20/9, "Mostrando 61–69 de 69"; mudar filtro estando na página 3 → volta à página 1 |
| 11 | Combinação de filtros | ✅ MARCELLO+BALCONISTA+Trabalhado = 8 · mar–mai+ALYSSON+CAIXA = 3 (mesmos nomes da planilha); cards acompanham |
| 12 | Limpar filtros | ✅ volta a 126, página 1 (inclusive saindo da página 5), cards 126 |
| 13 | Nenhum resultado | ✅ Loja 14+ISAAC: só a mensagem centralizada, sem tabela/rodapé; data inicial > final idem; ao limpar a tabela volta |
| 14 | Datas | ✅ 126 em dd/mm/aaaa iguais à planilha, incluindo as 2 datas gravadas como texto (18/08/2026 e 22/07/2026) e as 78 com dia ≤ 12 (risco de inversão) |
| 15 | Loja/RDS | ✅ 121 "Loja NN" (2 dígitos) + 5 "RDS"; sem Loja 07; filtro RDS = 5 |
| 16 | ADM → ADMINISTRATIVO | ✅ nenhuma célula "ADM"; 4 ADMINISTRATIVO; o registro que era ADM (THAIS PEREIRA DE SOUSA SANTOS) aparece como ADMINISTRATIVO |
| 17 | TEMPO | ✅ 126/126 iguais ao esperado; exemplos 2, 30, 45, 180, 365, 485 (+31, 60, 730, 1801) corretos; dias originais no `title` |
| 18 | Três tipos de aviso | ✅ Trabalhado 59 · Indenizado 56 · Término de Contrato 11, com badges verde/âmbar/cinza |
| — | Nomes | ✅ sem espaços extras (63 originais com espaço no final preservados em `raw`) |
| — | Paginação (janelas) | ✅ `1 2 3 4 … 7` · `1 … 4 5 6 7` · `1 … 9 10 11 … 20` etc. |
| — | Layout em 1440 / 1024 / 768 / 480 / 375 / 320 px | ✅ sem rolagem horizontal da página; a tabela rola só dentro do próprio contêiner a partir de 1024 px; capturas de 1440 e 375 px inspecionadas visualmente |
| — | Erros de JS / requisições falhas | ✅ nenhum |

**Observações / não testado:** (a) o texto "Mostrando…" e os botões `Anterior/Próximo` ficam abaixo da tabela; em ≤ 375 px o botão Próximo quebra para a linha de baixo; (b) os campos de data nativos dependem do idioma do navegador (valor interno sempre ISO); (c) navegadores diferentes de Chromium, toque em celular real e `file://` não testados; (d) conexão com Google Sheets continua não testada (URL inexistente).

## 10f. Etapa 6 — o que foi feito (resultado)

**Arquivos novos:** `graficos.js`, `chart.umd.min.js` (Chart.js 4.5.1). **Alterados:** `index.html` (2 painéis de gráfico no lugar dos containers vazios + 2 `<script>`; 4 linhas antigas trocadas), `style.css` (apenas acrescentado: `.chart-box`, `.chart-empty` e altura menor em ≤600 px), `README.md`, `HISTORICO_PROJETO.md`. **Não alterados (conferido com `cmp` contra o zip da Etapa 5):** `app.js`, `data.js`, `filtros.js`, `tabela.js`, `config.js`, `dados/BASE_DESLIGADOS_teste.csv`.
**Não implementado (como pedido):** detalhe do colaborador, exportação, novos gráficos/indicadores, Google Sheets.

**Valores da base completa, derivados direto de `BASE_DESLIGADOS.xlsx` por script Python independente (e iguais aos dados dos gráficos):**
- Por mês (Jan→Out): 10 · 6 · 22 · 15 · 18 · 12 · 17 · 18 · 7 · 1 = **126**
- Por tempo: Até 30 dias 7 · 31–90 dias 24 · 91–180 dias 18 · 181–365 dias 29 · 1–2 anos 24 · > 2 anos 24 = **126**

**Testes realizados** (Chromium headless/Playwright, CSV local de teste; os dados reais de cada gráfico foram lidos de `Chart.getChart(...)` e comparados com a planilha). **29 checagens, 0 falhas, 0 erros de JS.** Regressão: os **43 testes da Etapa 5 continuam 43/43**.

| # | Teste | Resultado |
|---|---|---|
| 1–2 | Base completa: por mês e por tempo | ✅ iguais à planilha; ambos somam 126 |
| 3–4 | Rótulos | ✅ Jan…Out em ordem cronológica; 6 faixas na ordem e com os nomes pedidos; ids e ordem idênticos a `FAIXAS_TEMPO` de `data.js` |
| — | Tipo e títulos | ✅ mês = barras verticais; tempo = barras horizontais; títulos "Desligamentos por mês" / "Desligamentos por tempo de empresa" |
| 5 | Gerente RAQUEL | ✅ 8 registros; meses e faixas iguais à planilha |
| 6 | Loja 14 (8) e RDS (5) | ✅ iguais à planilha (RDS preservada) |
| 7 | Período 01/03–31/05 (55) e só setembro (7) | ✅ |
| 8 | Combinações (MARCELLO+BALCONISTA+Trabalhado = 8; ALYSSON+CAIXA+mar–mai = 3), ADMINISTRATIVO (4, ADM agrupado), Término Contrato (11), busca "maria" | ✅ gráficos = planilha; cards e linhas da tabela batem |
| 9 | Limpar filtros | ✅ gráficos voltam aos 126 |
| 10 | Nenhum resultado | ✅ os dois painéis mostram a mensagem; depois de limpar, voltam corretos e visíveis (sem canvas "achatado") |
| 11 | Eixo estável | ✅ continua Jan…Out ao filtrar (ex.: ISAAC), meses sem registro = 0 |
| 12 | Cards + tabela + gráficos | ✅ atualizam juntos (gerente BIANCA = 8) |
| 13 | Registros intactos | ✅ 126, `raw` e `tempoDias` preservados |
| 14 | Tooltip | ✅ "Janeiro"; "1 desligamento" / "10 desligamentos" |
| 15–17 | Layout em 1440 / 1024 / 768 / 480 / 375 / 320 px | ✅ sem rolagem horizontal da página; lado a lado em 1440 e coluna única de 1024 para baixo; canvas sempre dentro do painel. Capturas de 1440 e 375 px inspecionadas visualmente |
| 18 | Erros de JS / requisições falhas | ✅ nenhum |

**Observações / não testado:** (a) o teste de ADM→ADMINISTRATIVO e de RDS é indireto (via filtros), pois essas colunas não são usadas diretamente nos gráficos; (b) o campo de data nativo do Chromium de teste aparece em formato en-US, mas o valor interno é ISO; (c) navegadores diferentes de Chromium, toque em celular real e `file://` não testados (como antes, é preciso servidor local); (d) conexão com Google Sheets continua não testada; (e) ver decisão 42 sobre o pedido cortado.

## 10g. Etapa 8 — bloco 1 (Excel + CSV) — o que foi feito (resultado)

**Arquivos novos:** `exportacao.js`. **Alterados:** `index.html` (+1 linha: `<script src="exportacao.js">`), `style.css` (apenas acrescentado o bloco "Exportação Excel/CSV (Etapa 8)"), `README.md` (+1 linha), `HISTORICO_PROJETO.md`. **Não alterados (conferido com `cmp`):** `app.js`, `data.js`, `filtros.js`, `tabela.js`, `graficos.js`, `config.js`, `chart.umd.min.js`, `dados/BASE_DESLIGADOS_teste.csv`. **Biblioteca adicionada: nenhuma.**
**Não implementado (como pedido):** PDF/impressão, Etapa 9.
**⚠️ Pendência desta etapa: impressão/PDF (bloco 2 da Etapa 8).** A Etapa 8 **não está finalizada**.

**Testes** (Chromium headless/Playwright, CSV local de teste, em `python3 -m http.server`). Os valores esperados vieram **direto de `BASE_DESLIGADOS.xlsx`** por script Python independente (datas dd/mm/aaaa, rótulo de loja, ADM→ADMINISTRATIVO, aviso, regra de tempo reimplementada) e foram comparados com o conteúdo **lido de volta dos arquivos baixados** (openpyxl para `.xlsx`; `csv` + decodificação UTF-8 para `.csv`), registro a registro, nas **12 colunas** (não só a contagem). **149 checagens, 0 falhas, 0 erros de JavaScript.**

| # | Teste | Resultado |
|---|---|---|
| 1 | Sem filtros | ✅ 126 no Excel e no CSV; 12 colunas de todos os registros iguais à planilha; Excel = CSV linha a linha |
| 2 | RDS | ✅ 5 registros, coluna LOJA = "RDS" |
| 3 | BALCONISTA | ✅ 69 |
| 4 | Indenizado | ✅ 56 |
| 5 | Combinações | ✅ MARCELLO+BALCONISTA+Trabalhado = 8 · ALYSSON+CAIXA+mar–mai = 3 · busca "maria" = 4 |
| 6 | Exportar na **página 2** (BALCONISTA, 21–40 de 69) | ✅ arquivo com **69** (não 20), Excel e CSV; continua na página 2 |
| 7 | Exportar na **última página** (61–69 de 69) | ✅ arquivo com **69** (não 9), Excel e CSV |
| 8 | Limpar filtros | ✅ contador e arquivos voltam a 126 |
| 9 | Ordenar e exportar | ✅ data ↓ (padrão), tempo ↑/↓ (estando na pág. 3), colaborador A→Z, loja (Loja 01 … RDS por último), função, e filtrado+ordenado+pág. 2: a ordem do arquivo = ordem da tabela (percorridas todas as páginas) |
| 10 | Datas | ✅ admissão e desligamento dd/mm/aaaa iguais à planilha nos 126 (inclui 85 com dia ≤ 12 e as 2 gravadas como texto: 18/08/2026 e 22/07/2026); no Excel são datas reais com formato `dd/mm/yyyy` |
| 11 | RDS | ✅ 5 "RDS"; demais "Loja NN" de 2 dígitos; sem Loja 07 |
| 12 | ADM → ADMINISTRATIVO | ✅ nenhuma célula "ADM"; ADMINISTRATIVO = 4; THAIS PEREIRA DE SOUSA SANTOS (era ADM) correta |
| 13 | Término de Contrato | ✅ 11 (Trabalhado 59 · Indenizado 56) |
| 14 | Acentos | ✅ cabeçalhos ADMISSÃO/FUNÇÃO/PRÉVIO, nomes acentuados, "Término", "mês"; BOM `EF BB BF`; sem mojibake |
| 15 | NOME_RED vazio | ✅ a base real não tem nenhum vazio; testado numa **cópia sintética** do CSV (2 NOME_RED vazios + gerente com `=…` e com aspas/`;`): célula vazia no Excel, campo vazio no CSV com 12 campos em todas as linhas, texto especial preservado, `=` neutralizado no CSV |
| 16 | Conteúdo | ✅ 12 colunas × 126 registros iguais à planilha; `TEMPO (DIAS)` é número no Excel e inteiro no CSV; exemplos de tempo (2, 30, 45, 180, 365, 485, 1801 dias) corretos |
| — | Dados internos intactos | ✅ 126 registros, ADM=1 (`funcaoOriginal`), "Término Contrato"=11, RDS=5, `tempoDias` inteiro, datas ISO; `state.filtrados` não é reordenado pela exportação |
| — | 0 resultados / 1 resultado | ✅ 0: botões desabilitados e "0 registros para exportar"; 1: "1 registro para exportar" |
| — | Integridade do `.xlsx` | ✅ ZIP íntegro (6 partes); abre no openpyxl **e no LibreOffice** (126 linhas lidas, valores corretos) |
| — | Layout em 1440 / 1024 / 768 / 480 / 375 / 320 px | ✅ sem rolagem horizontal da página; barra de exportação visível e dentro da tela; capturas de 1440 e 375 px inspecionadas |
| — | Console | ✅ 0 erros JavaScript, 0 requisições falhas |

**Observações / não testado:** (a) **não foi testado no Microsoft Excel** (só openpyxl e LibreOffice) — abrir um arquivo exportado no Excel e conferir; (b) o download em si foi validado no Chromium headless; Safari/Firefox/celular real não testados; (c) `file://` continua não funcionando (precisa de servidor, como antes); (d) o `.xlsx` não é comprimido (ZIP "store"): ~25 KB para 126 linhas; (e) ver aviso no topo sobre a Etapa 7 ausente neste histórico.

## 10h. Etapa 8 — bloco 2 (Impressão / PDF) — o que foi feito (resultado)

**Objetivo:** botão **Imprimir / PDF** que imprime TODOS os registros atualmente filtrados (não só a página de 20 da tela), usando a impressão do navegador ("Salvar como PDF"). Sem biblioteca de PDF.

**Implementação**
- **`impressao.js` (novo)** — ver tabela da seção 2. O botão chama `window.print()`; a área de impressão é montada no evento `beforeprint` (vale também para Ctrl+P / menu do navegador) e esvaziada em `afterprint`.
- **`index.html` (alterado)** — só 1 linha: `<script src="impressao.js">` logo após `exportacao.js`.
- **`style.css` (alterado)** — bloco novo no fim: `.print-area { display:none }` na tela e `@media print`.
- **Preservados sem alteração:** `exportacao.js` (idêntico byte a byte ao recebido), `detalhes.js`, `tabela.js`, `app.js`, `filtros.js`, `graficos.js`, `data.js`, `config.js`, `chart.umd.min.js`, dados.

**Regras `@media print` (style.css)**
- `@page { size: A4 landscape; margin: 12mm 10mm }`; fundo branco, texto preto, fonte Arial 10pt.
- Esconde `.page` inteira (cabeçalho da tela, cards, filtros, botões, gráficos, tabela da tela, paginação, nomes clicáveis) e `.det-overlay` (modal). Só `#areaImpressao` aparece.
- Tabela de impressão: `thead { display: table-header-group }` (cabeçalho repete em cada página), `tr { break-inside: avoid }` (não corta linha), cabeçalho do relatório com `break-after: avoid` (sem título isolado), zebra leve.

**O que sai na impressão:** título **Desligamentos**, subtítulo **Visão geral dos colaboradores desligados**, **"N desligamentos encontrados"** (N = total filtrado), linha discreta "Filtros: ..." (só se houver filtro; ex.: `Função: BALCONISTA · Aviso prévio: Indenizado`), "Emitido em dd/mm/aaaa às hh:mm" e a tabela com 8 colunas: COLABORADOR · DATA DO DESLIGAMENTO · LOJA · GERENTE · SUPER · FUNÇÃO · TEMPO DE EMPRESA · T. AVISO PRÉVIO. Mesmas regras de apresentação da tela (dd/mm/aaaa, `Loja 05`/`RDS`, ADMINISTRATIVO, tempo amigável, aviso normalizado). Sem DOCUMENTO nem campos do modal.

**Regra principal / paginação:** a impressão lê `window.DESLIG_STATE.filtrados` (a lista completa) — nunca as linhas da tabela da tela. A paginação da tela (20/página), a ordenação e os filtros **não são alterados**. A ordem das linhas impressas segue a ordenação atual da tabela (lida do `aria-sort`, igual ao `exportacao.js`). Com 0 resultados o botão fica desabilitado.

**Testes (Playwright + Chromium, `window.print` interceptado e `page.pdf()` real):** **68 aprovados · 0 falhas**.
- Casos 1–9: 126 (sem filtro) · 69 (BALCONISTA) · 5 (RDS) · 56 (INDENIZADO) · combinação (BALCONISTA + Indenizado = 26) · página 2 → 126 · última página (6 linhas na tela) → 126 · filtro + ordenação (A→Z, Z→A, tempo) → 69 na ordem certa · limpar filtros → 126.
- Etapa 7: abrir/fechar modal (X, Fechar, ESC), filtro e página preservados, imprimir depois do modal; modal não renderiza em `@media print`.
- `@media print`: filtros, gráficos, paginação, barra de exportação, cards, botão e nomes clicáveis não renderizam; thead repete; linhas sem quebra interna.
- PDF real (A4 paisagem, sem disparar `beforeprint` manualmente, na página 2 da tabela): 126 registros em 7 páginas, cabeçalho da tabela repetido nas 7 páginas, sem DOCUMENTO/botões. PDF com BALCONISTA: 69 registros, 3 páginas.
- Excel e CSV re-testados com página 2 aberta: 126 · 69 · 5 · 26 linhas (= `DESLIG_STATE.filtrados`).
- Responsividade 1440/1024/768/480/320 px: sem rolagem horizontal da página; botão visível; área de impressão oculta na tela.
- Console: 0 erros JS, 0 recursos quebrados.

**Limitações / não testado**
- O diálogo de impressão em si (Chrome/Edge/Firefox/Safari, impressora física) não foi testado: foi testado o resultado do `@media print` e o PDF gerado pelo Chromium. Em "Mais configurações" do navegador, deixar **Gráficos de fundo** é opcional (sem ele a zebra/cabeçalho cinza podem sair mais claros) e **Cabeçalhos e rodapés** pode ser desmarcado para uma folha mais limpa.
- A repetição do cabeçalho e a regra de não cortar linhas dependem do navegador (suportado no Chromium; Firefox/Safari costumam respeitar).
- Não há numeração de páginas própria (depende do rodapé do navegador).
- A linha "Filtros:" mostra os filtros aplicados em texto; a busca por colaborador aparece entre aspas.


## 11. Instruções para continuar em outra conversa/conta

1. Peça ao usuário para anexar novamente `BASE_DESLIGADOS.xlsx` e `dashboard_atualizado.zip` (os uploads não persistem entre conversas) **e este `HISTORICO_PROJETO.md`**.
2. Leia este arquivo por completo antes de agir.
3. Estado atual: Etapas 1 a 6 documentadas (ver 10b a 10f), Etapa 7 concluída (registro resumido no topo), **Etapa 8 concluída (bloco 1 Excel/CSV em 10g; bloco 2 Impressão/PDF em 10h)**; **nada pendente na Etapa 8**; a **Etapa 9 não foi iniciada**. Peça também o `dashboard-desligamentos.zip` mais recente (contém `filtros.js`, `tabela.js`, `graficos.js` e `chart.umd.min.js`). Não refaça a análise (Etapa 1) — apenas confirme rapidamente que a planilha tem 126 linhas e as 11 colunas da seção 3.2; se o número mudar, a base foi atualizada: reanalise só as diferenças e registre aqui.
4. Confirme com o usuário **qual etapa autorizar** e resolva as pendências da seção 7 relevantes para ela.
5. Trabalhe **uma etapa por vez**, de forma enxuta (conta com limite de uso): não gere código além do que a etapa pede, não reescreva arquivos inteiros sem necessidade, evite releituras desnecessárias.
6. Ao fim de cada etapa: resumir o que foi feito, **atualizar este arquivo** (seções 2, 5, 6, 7, 10 e um registro no log abaixo) e **parar aguardando autorização**.
7. Nunca alterar a planilha original nem o dashboard atual. Falar em PT-BR.

## 12. Log de etapas

| Etapa | Data | Status | Resumo |
|---|---|---|---|
| 1 — Análise | 02/10/2026 | ✅ Concluída | Análise completa da base (126 registros, 11 colunas) e do dashboard atual; criado este histórico. Nada implementado. |
| 2 — Estrutura + camada de dados + conexão preparada | 02/10/2026 | ✅ Concluída | Projeto `dashboard-desligamentos/` criado; `data.js` normaliza/valida (126 registros, 0 erros); conexão Google Sheets preparada em `config.js` (URL ainda vazia). Sem cards/filtros/gráficos/tabela. |
| 3 — Layout base + cabeçalho + cards | 02/10/2026 | ✅ Concluída | Cabeçalho "Desligamentos", 4 cards (126 / 59 / 56 / 11, conferidos em navegador), containers vazios de filtros/gráficos/tabela, tema escuro responsivo. Sem filtros, gráficos, tabela, exportação ou modal. 0 erros de JS; sem estouro de layout de 320 a 1440 px. |
| 4 — Filtros | 02/10/2026 | ✅ Concluída | 8 filtros combináveis (período por data do desligamento, loja incl. RDS, gerente, supervisor, função normalizada, tipo de aviso, busca parcial), Limpar filtros, contador, mensagem de vazio; cards seguem os filtros. Novo `filtros.js`; `data.js`/`config.js` intactos. 51 checagens contra valores calculados da planilha, 0 falhas, 0 erros de JS. |
| 5 — Tabela | 02/10/2026 | ✅ Concluída | Tabela principal com 8 colunas, tempo de empresa amigável (dias preservados), badges de aviso, ordenação (data/colaborador/loja/função/tempo; padrão mais recentes), paginação de 20, estado vazio, rolagem horizontal só na tabela. Consome `DESLIG_STATE.filtrados`. Novo `tabela.js`; `app.js`/`data.js`/`filtros.js`/`config.js` intactos. 43 checagens contra a planilha, 0 falhas, 0 erros de JS. |
| 6 — Gráficos | 02/10/2026 | ✅ Concluída | 2 gráficos Chart.js 4.5.1 (local): Desligamentos por mês (barras verticais, Jan–Out) e por tempo de empresa (barras horizontais, 6 faixas de `data.js`). Consomem `DESLIG_STATE.filtrados`; vazio tratado; lado a lado no desktop, coluna única ≤1024 px. Novos `graficos.js` e `chart.umd.min.js`; `app.js`/`data.js`/`filtros.js`/`tabela.js`/`config.js` intactos. 29 checagens contra a planilha + 43 de regressão, 0 falhas, 0 erros de JS. |
| 7 — Detalhe do colaborador | — | ❓ Não registrada neste arquivo | O usuário informou que está concluída, mas o histórico/zip recebidos pararam na Etapa 6. Registrar a partir do projeto dele. |
| 8 — Exportação (Excel/CSV + Impressão/PDF) | 02/10/2026 | ✅ Concluída | Bloco 1: `exportacao.js` (.xlsx e .csv com **todos** os filtrados). Bloco 2: `impressao.js` + `@media print` (A4 paisagem, **todos** os filtrados, cabeçalho repetido, sem elementos interativos); 68 testes aprovados / 0 falhas. Ver 10g e 10h |
| 9 — (a definir) | — | ⏸️ **Não iniciada** | Aguardando autorização e escopo do usuário |
