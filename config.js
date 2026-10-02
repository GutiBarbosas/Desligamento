/* Configuração do Dashboard de Desligamentos.
   ÚNICO arquivo que precisa ser editado para trocar a fonte de dados. */
window.DESLIG_CONFIG = {
  // URL do CSV publicado da NOVA planilha de desligamentos (aba BASE).
  // Google Sheets → Arquivo → Compartilhar → Publicar na web → aba BASE → CSV.
  // Enquanto estiver vazio, o dashboard usa o arquivo local de teste abaixo.
  SHEET_CSV_URL: '',

  // Fallback de teste (cópia dos dados da BASE_DESLIGADOS.xlsx). Exige servidor
  // (GitHub Pages ou `python3 -m http.server`); não funciona via file://.
  LOCAL_CSV: 'dados/BASE_DESLIGADOS_teste.csv'
};
