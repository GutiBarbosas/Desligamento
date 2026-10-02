/* Tabela de desligamentos — Dashboard de Desligamentos (Etapa 5).
   Lê SEMPRE a lista já filtrada (window.DESLIG_STATE.filtrados) — não existe segunda lógica de filtro.
   Atualiza quando os filtros mudam (evento 'desligamentos:filtrados'), voltando para a página 1.
   As funções puras (formatarTempo, formatarData, ordenar, paginar, paginasVisiveis) não usam DOM e
   funcionam no Node (require). Nunca altera os registros: a ordenação trabalha numa cópia. */
(function (root) {
  'use strict';

  const POR_PAGINA = 20;
  const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });
  const norm = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
  const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

  /* ---------- Formatação (só visualização; os valores originais ficam nos registros) ---------- */

  // dd/mm/aaaa a partir do ISO AAAA-MM-DD, só com texto (sem Date → sem risco de inverter dia/mês).
  function formatarData(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? `${m[3]}/${m[2]}/${m[1]}` : '—';
  }

  // Regra: mês = 30 dias, ano = 365 dias.
  //  • até 30 dias        → "N dias"
  //  • 31 dias a < 1 ano  → "X meses e Y dias" (dias omitidos se 0)
  //  • 1 ano ou mais      → "X anos e Y meses" (dias descartados → aproximado; meses omitidos se 0)
  function formatarTempo(dias) {
    if (dias == null) return '—';
    if (dias <= 30) return plural(dias, 'dia', 'dias');
    const anos = Math.floor(dias / 365), resto = dias - anos * 365;
    const meses = Math.min(11, Math.floor(resto / 30));
    if (anos) return [plural(anos, 'ano', 'anos'), meses && plural(meses, 'mês', 'meses')].filter(Boolean).join(' e ');
    const d = resto - meses * 30;
    return [plural(meses, 'mês', 'meses'), d && plural(d, 'dia', 'dias')].filter(Boolean).join(' e ');
  }

  // Rótulo e cor do badge por tipo de aviso (valor da base comparado sem acento/caixa).
  const AVISOS = {
    'TRABALHADO': { rotulo: 'Trabalhado', cor: 'green' },
    'INDENIZADO': { rotulo: 'Indenizado', cor: 'amber' },
    'TERMINO CONTRATO': { rotulo: 'Término de Contrato', cor: 'grey' }
  };
  const infoAviso = valor => AVISOS[norm(valor)] || { rotulo: valor || '—', cor: 'grey' };

  /* ---------- Ordenação ---------- */

  // v = valor usado na ordenação; d = desempate extra (opcional).
  const CHAVES = {
    data: { v: r => (r.data ? +r.data.replace(/-/g, '') : null) },       // ISO → número AAAAMMDD
    colaborador: { v: r => r.colaborador },
    loja: { v: r => r.lojaOrdem, d: r => r.lojaLabel },                  // numéricas em ordem, RDS depois
    funcao: { v: r => r.funcao },
    tempo: { v: r => r.tempoDias }
  };
  const DIR_INICIAL = { data: 'desc' };                                   // demais colunas começam em 'asc'

  // Valores ausentes ficam sempre no fim.
  function comparar(x, y) {
    if (x == null || y == null) return x == null && y == null ? 0 : x == null ? 1 : -1;
    return typeof x === 'string' ? collator.compare(x, y) : x - y;
  }

  function ordenar(registros, chave, dir) {
    const k = CHAVES[chave] || CHAVES.data, f = dir === 'asc' ? 1 : -1;
    return registros.slice().sort((a, b) => {
      const va = k.v(a), vb = k.v(b);
      let c = comparar(va, vb);
      if (c && va != null && vb != null) c *= f;
      if (!c && k.d) c = comparar(k.d(a), k.d(b)) * f;
      // Desempate fixo (colaborador A→Z, depois linha) mantém a ordem estável e previsível.
      return c || comparar(a.colaborador, b.colaborador) || a.linha - b.linha;
    });
  }

  /* ---------- Paginação ---------- */

  function paginar(lista, pagina, porPagina) {
    const total = lista.length, totalPaginas = Math.max(1, Math.ceil(total / porPagina));
    const p = Math.min(Math.max(1, pagina | 0), totalPaginas), ini = (p - 1) * porPagina;
    return { itens: lista.slice(ini, ini + porPagina), pagina: p, totalPaginas, total,
             de: total ? ini + 1 : 0, ate: Math.min(ini + porPagina, total) };
  }

  // Números de página a mostrar: 1, vizinhas da atual, última e '…' nos buracos.
  function paginasVisiveis(atual, total) {
    const s = new Set([1, total, atual - 1, atual, atual + 1]);
    if (atual <= 3) [2, 3, 4].forEach(n => s.add(n));
    if (atual >= total - 2) [total - 3, total - 2, total - 1].forEach(n => s.add(n));
    const nums = [...s].filter(n => n >= 1 && n <= total).sort((a, b) => a - b), out = [];
    nums.forEach((n, i) => {
      if (i && n - nums[i - 1] === 2) out.push(n - 1);       // buraco de 1 página: mostra a página em vez de '…'
      else if (i && n - nums[i - 1] > 2) out.push('…');
      out.push(n);
    });
    return out;
  }

  const api = { POR_PAGINA, formatarData, formatarTempo, ordenar, paginar, paginasVisiveis, infoAviso };

  /* ---------- Interface (só no navegador) ---------- */

  if (typeof document !== 'undefined') {
    const $ = id => document.getElementById(id);
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const ui = { chave: 'data', dir: 'desc', pagina: 1, itens: [] };      // padrão: mais recentes primeiro · itens = registros da página visível

    function linha(r, i) {
      const a = infoAviso(r.avisoPrevio);
      return `<tr>
        <td class="col-nome"><button type="button" class="nome-btn" data-idx="${i}" aria-haspopup="dialog">${esc(r.colaborador)}</button></td>
        <td class="col-num">${formatarData(r.data)}</td>
        <td class="col-nowrap">${esc(r.lojaLabel)}</td>
        <td>${esc(r.gerente)}</td>
        <td>${esc(r.supervisor)}</td>
        <td>${esc(r.funcao)}</td>
        <td class="col-nowrap" title="${r.tempoDias == null ? '' : r.tempoDias + ' dias'}">${formatarTempo(r.tempoDias)}</td>
        <td class="col-nowrap"><span class="badge badge-${a.cor}">${esc(a.rotulo)}</span></td>
      </tr>`;
    }

    function renderPager(p) {
      const btn = (n, txt, off) => `<button type="button" class="pager-btn" data-pagina="${n}"${off ? ' disabled' : ''}>${txt}</button>`;
      const nums = paginasVisiveis(p.pagina, p.totalPaginas).map(n => n === '…'
        ? '<span class="pager-gap" aria-hidden="true">…</span>'
        : `<button type="button" class="pager-btn${n === p.pagina ? ' is-active' : ''}" data-pagina="${n}"${n === p.pagina ? ' aria-current="page"' : ''}>${n}</button>`);
      $('paginacao').innerHTML = btn(p.pagina - 1, 'Anterior', p.pagina === 1) + nums.join('') + btn(p.pagina + 1, 'Próximo', p.pagina === p.totalPaginas);
      $('paginacao').hidden = p.totalPaginas <= 1;                        // 1 página só: sem controles
    }

    function render() {
      const lista = (root.DESLIG_STATE && root.DESLIG_STATE.filtrados) || [];
      const vazio = lista.length === 0;
      $('tabelaWrap').hidden = vazio;
      $('tabelaRodape').hidden = vazio;
      $('tabelaVazio').hidden = !vazio;
      if (vazio) return;                                                  // sem resultados: só a mensagem, sem tabela vazia

      const p = paginar(ordenar(lista, ui.chave, ui.dir), ui.pagina, POR_PAGINA);
      ui.pagina = p.pagina;
      ui.itens = p.itens;
      $('tabelaCorpo').innerHTML = p.itens.map(linha).join('');
      $('tabelaInfo').textContent = `Mostrando ${p.de}–${p.ate} de ${p.total.toLocaleString('pt-BR')} ${p.total === 1 ? 'desligamento' : 'desligamentos'}`;
      renderPager(p);
      document.querySelectorAll('#tabelaWrap th[data-col]').forEach(th => {
        th.setAttribute('aria-sort', th.dataset.col === ui.chave ? (ui.dir === 'asc' ? 'ascending' : 'descending') : 'none');
      });
    }

    // Filtros mudaram (ou "Limpar filtros"): volta para a página 1 e redesenha.
    document.addEventListener('desligamentos:filtrados', () => { ui.pagina = 1; render(); });

    $('tabelaWrap').addEventListener('click', e => {
      const b = e.target.closest('[data-ordem]');
      if (!b) return;
      const chave = b.dataset.ordem;
      if (chave === ui.chave) ui.dir = ui.dir === 'asc' ? 'desc' : 'asc';
      else { ui.chave = chave; ui.dir = DIR_INICIAL[chave] || 'asc'; }
      ui.pagina = 1;
      render();
    });

    // Clique no nome → evento 'desligamentos:detalhe' (consumido por detalhes.js). O registro vem da posição na página
    // visível (mesmo objeto de DESLIG_STATE.filtrados), nunca de uma busca pelo nome (nomes podem se repetir).
    $('tabelaCorpo').addEventListener('click', e => {
      const b = e.target.closest('[data-idx]');
      const registro = b && ui.itens[+b.dataset.idx];
      if (registro) document.dispatchEvent(new CustomEvent('desligamentos:detalhe', { detail: { registro, origem: b } }));
    });

    $('paginacao').addEventListener('click', e => {
      const b = e.target.closest('[data-pagina]');
      if (!b || b.disabled) return;
      ui.pagina = +b.dataset.pagina;
      render();
      const topo = $('areaTabela');
      if (topo.getBoundingClientRect().top < 0) topo.scrollIntoView({ block: 'start' });   // volta ao início da tabela se ela saiu da tela
    });
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TabelaDesligamentos = api;
})(typeof window !== 'undefined' ? window : globalThis);
