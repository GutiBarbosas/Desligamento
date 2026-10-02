/* Impressão / PDF — Dashboard de Desligamentos (Etapa 8, bloco 2).
   Fluxo: DESLIG_STATE.filtrados → impressao.js → #areaImpressao (tabela própria de impressão) → window.print().
   • Imprime TODOS os registros filtrados (a paginação da tabela da tela é só visual e não é alterada).
   • A área de impressão é montada no momento da impressão (botão ou Ctrl+P, via evento 'beforeprint') e
     removida em 'afterprint'. Na tela fica sempre oculta; só aparece em @media print (ver style.css).
   • Ordem das linhas = ordenação atualmente escolhida na tabela (lida do aria-sort dos cabeçalhos).
   • Sem lógica de filtro própria, sem biblioteca de PDF: o usuário escolhe "Salvar como PDF" no diálogo do navegador.
   • Não altera registros, filtros, página, ordenação, exportação nem o modal de detalhes.
   As funções puras (montarLinhas, descreverFiltros, escapar) não usam DOM e funcionam no Node (require). */
(function (root) {
  'use strict';

  const T = root.TabelaDesligamentos || (typeof require !== 'undefined' ? require('./tabela.js') : null);
  if (!T) throw new Error('impressao.js precisa de tabela.js carregado antes.');

  const escapar = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const vazio = v => (v == null || String(v).trim() === '' ? '—' : String(v));
  const plural = (n, um, varios) => `${n.toLocaleString('pt-BR')} ${n === 1 ? um : varios}`;

  // As 8 colunas pedidas, na ordem da tabela da tela. Mesmas regras de apresentação (formatarData/formatarTempo/infoAviso).
  const COLUNAS = [
    { titulo: 'Colaborador',           get: r => vazio(r.colaborador), cls: 'p-nome' },
    { titulo: 'Data do desligamento',  get: r => T.formatarData(r.data), cls: 'p-nowrap' },
    { titulo: 'Loja',                  get: r => vazio(r.lojaLabel), cls: 'p-nowrap' },
    { titulo: 'Gerente',               get: r => vazio(r.gerente) },
    { titulo: 'Super',                 get: r => vazio(r.supervisor) },
    { titulo: 'Função',                get: r => vazio(r.funcao) },
    { titulo: 'Tempo de empresa',      get: r => (r.tempoDias == null ? '—' : T.formatarTempo(r.tempoDias)), cls: 'p-nowrap' },
    { titulo: 'T. aviso prévio',       get: r => vazio(T.infoAviso(r.avisoPrevio).rotulo), cls: 'p-nowrap' }
  ];

  // Linhas (matriz de textos) de TODOS os registros, ordenadas como na tabela. ordenar() trabalha numa cópia.
  function montarLinhas(lista, chave, dir) {
    return T.ordenar(lista || [], chave || 'data', dir || 'desc').map(r => COLUNAS.map(c => c.get(r)));
  }

  // Resumo curto dos filtros aplicados (vazio = nenhum filtro). 'registros' serve para achar o rótulo da loja ("Loja 05").
  function descreverFiltros(c, registros) {
    if (!c) return '';
    const partes = [];
    const br = T.formatarData;
    if (c.inicio && c.fim) partes.push(`Período: ${br(c.inicio)} a ${br(c.fim)}`);
    else if (c.inicio) partes.push(`A partir de ${br(c.inicio)}`);
    else if (c.fim) partes.push(`Até ${br(c.fim)}`);
    if (c.loja) {
      const reg = (registros || []).find(r => r.loja === c.loja);
      partes.push(`Loja: ${reg ? reg.lojaLabel : c.loja}`);
    }
    if (c.gerente) partes.push(`Gerente: ${c.gerente}`);
    if (c.supervisor) partes.push(`Super: ${c.supervisor}`);
    if (c.funcao) partes.push(`Função: ${c.funcao}`);
    if (c.aviso) partes.push(`Aviso prévio: ${T.infoAviso(c.aviso).rotulo}`);
    if (c.busca && String(c.busca).trim()) partes.push(`Colaborador: "${String(c.busca).trim()}"`);
    return partes.join(' · ');
  }

  const api = { COLUNAS, montarLinhas, descreverFiltros, escapar };

  /* ---------- Interface (só no navegador) ---------- */

  if (typeof document !== 'undefined') {
    const $ = id => document.getElementById(id);
    const estado = () => root.DESLIG_STATE || { filtrados: [], registros: [], criterios: null };

    // Mesma ordem que o usuário vê na tabela (cabeçalho com aria-sort); padrão: data, mais recentes primeiro.
    function ordemDaTabela() {
      const th = document.querySelector('#tabelaWrap th[aria-sort="ascending"], #tabelaWrap th[aria-sort="descending"]');
      return th && th.dataset.col
        ? { chave: th.dataset.col, dir: th.getAttribute('aria-sort') === 'ascending' ? 'asc' : 'desc' }
        : { chave: 'data', dir: 'desc' };
    }

    // Área de impressão: irmã de .page (fora dela), oculta na tela por CSS.
    let area = $('areaImpressao');
    if (!area) {
      area = document.createElement('section');
      area.id = 'areaImpressao';
      area.className = 'print-area';
      area.setAttribute('aria-hidden', 'true');
      document.body.appendChild(area);
    }

    function montarArea() {
      const s = estado(), lista = s.filtrados || [], o = ordemDaTabela();
      const linhas = montarLinhas(lista, o.chave, o.dir);
      const filtros = descreverFiltros(s.criterios, s.registros);
      const agora = new Date(), p = n => String(n).padStart(2, '0');
      const emitido = `Emitido em ${p(agora.getDate())}/${p(agora.getMonth() + 1)}/${agora.getFullYear()} às ${p(agora.getHours())}:${p(agora.getMinutes())}`;
      area.innerHTML =
        '<header class="print-head">' +
          '<h1>Desligamentos</h1>' +
          '<p class="print-sub">Visão geral dos colaboradores desligados</p>' +
          `<p class="print-count">${plural(lista.length, 'desligamento encontrado', 'desligamentos encontrados')}</p>` +
          (filtros ? `<p class="print-filtros">Filtros: ${escapar(filtros)}</p>` : '') +
          `<p class="print-emitido">${escapar(emitido)}</p>` +
        '</header>' +
        (lista.length
          ? '<table class="print-tbl"><thead><tr>' + COLUNAS.map(c => `<th scope="col">${escapar(c.titulo)}</th>`).join('') + '</tr></thead><tbody>' +
            linhas.map(l => '<tr>' + l.map((v, i) => `<td${COLUNAS[i].cls ? ` class="${COLUNAS[i].cls}"` : ''}>${escapar(v)}</td>`).join('') + '</tr>').join('') +
            '</tbody></table>'
          : '<p class="print-vazio">Nenhum desligamento encontrado para os filtros selecionados.</p>');
    }

    function limparArea() { area.innerHTML = ''; }

    // Ctrl+P / menu do navegador também passam por aqui, então a impressão nunca sai com a área vazia.
    window.addEventListener('beforeprint', montarArea);
    window.addEventListener('afterprint', limparArea);

    // Botão "Imprimir / PDF" ao lado de Excel e CSV (barra criada por exportacao.js, que carrega antes).
    const acoes = document.querySelector('#exportBar .export-actions');
    if (acoes) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-ghost';
      btn.id = 'btnImprimir';
      btn.textContent = 'Imprimir / PDF';
      btn.disabled = true;
      acoes.appendChild(btn);
      const atualizar = () => { btn.disabled = (estado().filtrados || []).length === 0; };
      btn.addEventListener('click', () => {
        try { window.print(); }                  // dispara 'beforeprint' (monta a área) e 'afterprint' (limpa)
        catch (e) { console.error(e); }
      });
      document.addEventListener('desligamentos:filtrados', atualizar);
    }
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.ImpressaoDesligamentos = api;
})(typeof window !== 'undefined' ? window : globalThis);
