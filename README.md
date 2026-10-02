# Dashboard de Desligamentos

HTML/CSS/JS puro, independente do dashboard "Registro & Venda". Todos os arquivos na raiz (exceto `dados/`).

- `config.js` — URL do CSV do Google Sheets (único arquivo a editar para trocar a fonte)
- `data.js` — leitura, normalização e validação dos dados (sem DOM)
- `filtros.js` — lógica de filtragem (sem DOM)
- `tabela.js` — tabela de desligamentos: formatação, ordenação, paginação (20 por página); lê `DESLIG_STATE.filtrados`; o nome do colaborador é um botão que dispara o evento `desligamentos:detalhe`
- `detalhes.js` — modal "Detalhes do desligamento" (Etapa 7): abre ao clicar no nome, mostra 10 campos do registro exato da linha; fecha por X, "Fechar", ESC ou clique fora
- `graficos.js` — 2 gráficos (por mês e por tempo de empresa); lê `DESLIG_STATE.filtrados`
- `exportacao.js` — exportação Excel (.xlsx) e CSV de **todos** os registros filtrados (`DESLIG_STATE.filtrados`); sem biblioteca e sem CDN
- `chart.umd.min.js` — Chart.js 4.5.1 (arquivo local, sem CDN)
- `app.js`, `index.html`, `style.css` — interface (cabeçalho, 4 cards, filtros, gráficos e tabela; diagnóstico da carga em `?diagnostico`)
- `dados/BASE_DESLIGADOS_teste.csv` — cópia de teste da base (usada se `SHEET_CSV_URL` estiver vazio)

## Conectar a planilha nova
1. Crie uma planilha nova com a aba `BASE` e os cabeçalhos exatos: COLABORADOR, NOME_RED, ADMISSÃO, DOCUMENTO, T. AVISO PRÉVIO, DATA, LOJA, GERENTE, SUPER, TEMPO, FUNÇÃO.
2. Arquivo → Compartilhar → Publicar na web → aba `BASE` → formato CSV → Publicar.
3. Cole a URL em `SHEET_CSV_URL` no `config.js`.
Datas aceitas: dd/mm/aaaa, aaaa-mm-dd ou serial numérico. Recomendado: formatar ADMISSÃO e DATA como dd/mm/aaaa.

## Testar localmente
`python3 -m http.server` na pasta e abrir http://localhost:8000 (não funciona por file://).

## Impressão / PDF (Etapa 8, bloco 2)

O botão **Imprimir / PDF** (ao lado de Excel e CSV, acima da tabela) abre a impressão do navegador com **todos** os registros filtrados (não só a página atual). Para gerar PDF, escolha "Salvar como PDF" como destino. Arquivos: `impressao.js` + bloco `@media print` no final de `style.css`.
