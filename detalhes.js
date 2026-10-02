/* Detalhes do desligamento — Dashboard de Desligamentos (Etapa 7, reconstruída).
   Fluxo: clique no nome (tabela.js) → evento 'desligamentos:detalhe' { registro } → detalhes.js → modal.
   • O registro recebido é o OBJETO EXATO da linha clicada (nunca localizado pelo nome: nomes podem se repetir).
   • Não tem lógica de filtro, ordenação ou paginação, não lê nem altera a fonte de dados e não altera o registro.
   • Formatação idêntica à da tabela (formatarData, formatarTempo e infoAviso de TabelaDesligamentos).
   • Todo valor entra no DOM com textContent (texto seguro, nunca HTML).
   • Abrir/fechar não recarrega nada: filtros, página, ordenação, cards e gráficos ficam como estão.
   montarCampos() é pura (sem DOM) e funciona no Node (require). */
(function (root) {
  'use strict';

  const T = root.TabelaDesligamentos || (typeof require !== 'undefined' ? require('./tabela.js') : null);
  if (!T) throw new Error('detalhes.js precisa de tabela.js carregado antes.');

  const texto = v => { const s = String(v ?? '').trim(); return s || '—'; };

  // Os 10 campos do modal, na ordem pedida. 'aviso' indica que o valor sai como badge (mesmo da tabela).
  function montarCampos(r) {
    const aviso = T.infoAviso(r.avisoPrevio);
    return [
      { id: 'nomeRed',   rotulo: 'Nome RED',       valor: texto(r.nomeRed) },
      { id: 'admissao',  rotulo: 'Admissão',       valor: T.formatarData(r.admissao) },
      { id: 'data',      rotulo: 'Desligamento',   valor: T.formatarData(r.data) },
      { id: 'documento', rotulo: 'Documento',      valor: texto(r.documento) },                  // classificação da base (EMPRESA/EMPREGADO)
      { id: 'aviso',     rotulo: 'Aviso prévio',   valor: texto(aviso.rotulo), cor: aviso.cor },
      { id: 'loja',      rotulo: 'Loja',           valor: texto(r.lojaLabel) },                  // "Loja 05" / "RDS"
      { id: 'gerente',   rotulo: 'Gerente',        valor: texto(r.gerente) },
      { id: 'super',     rotulo: 'Super',          valor: texto(r.supervisor) },
      { id: 'funcao',    rotulo: 'Função',         valor: texto(r.funcao) },                     // ADM já vem como ADMINISTRATIVO
      { id: 'tempo',     rotulo: 'Tempo de empresa', valor: r.tempoDias == null ? '—' : T.formatarTempo(r.tempoDias) }
    ];
  }

  const api = { montarCampos };

  /* ---------- Interface (só no navegador) ---------- */

  if (typeof document !== 'undefined') {
    const el = (tag, cls, txt) => {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (txt != null) n.textContent = txt;
      return n;
    };

    let overlay = null, dialogo = null, lista = null, btnX = null, btnFechar = null;
    let retorno = null;            // elemento que tinha o foco antes de abrir (volta para ele ao fechar)
    let apertouFora = false, soltouFora = false;   // o mouse foi pressionado/solto no fundo escuro? (evita fechar ao arrastar uma seleção)

    function construir() {
      overlay = el('div', 'det-overlay');
      overlay.id = 'detOverlay';
      overlay.hidden = true;

      dialogo = el('div', 'det-dialog');
      dialogo.setAttribute('role', 'dialog');
      dialogo.setAttribute('aria-modal', 'true');
      dialogo.setAttribute('aria-labelledby', 'detTitulo');

      const topo = el('div', 'det-head');
      const titulo = el('h2', 'det-title', 'Detalhes do desligamento');
      titulo.id = 'detTitulo';
      btnX = el('button', 'det-x', '×');
      btnX.type = 'button';
      btnX.setAttribute('aria-label', 'Fechar');
      topo.append(titulo, btnX);

      lista = el('dl', 'det-lista');

      const rodape = el('div', 'det-foot');
      btnFechar = el('button', 'btn-ghost', 'Fechar');
      btnFechar.type = 'button';
      rodape.append(btnFechar);

      dialogo.append(topo, lista, rodape);
      overlay.append(dialogo);
      document.body.append(overlay);

      btnX.addEventListener('click', fechar);
      btnFechar.addEventListener('click', fechar);

      // Clique fora: só fecha se o mouse foi pressionado E solto no fundo escuro.
      // Selecionar texto no modal e soltar fora (ou o inverso) gera 'click' no fundo, mas um dos dois lados foi dentro → não fecha.
      overlay.addEventListener('pointerdown', e => { apertouFora = e.target === overlay; soltouFora = false; });
      overlay.addEventListener('pointerup', e => { soltouFora = e.target === overlay; });
      overlay.addEventListener('click', e => {
        if (e.target === overlay && apertouFora && soltouFora) fechar();
        apertouFora = soltouFora = false;
      });

      // Teclado: ESC fecha; Tab fica preso entre os dois botões enquanto o modal está aberto.
      document.addEventListener('keydown', e => {
        if (overlay.hidden) return;
        if (e.key === 'Escape') { e.preventDefault(); fechar(); return; }
        if (e.key === 'Tab') {
          const foco = [btnX, btnFechar], i = foco.indexOf(document.activeElement);
          const prox = e.shiftKey ? (i <= 0 ? foco.length - 1 : i - 1) : (i === foco.length - 1 ? 0 : i + 1);
          e.preventDefault();
          foco[prox].focus();
        }
      });
    }

    function preencher(registro) {
      lista.replaceChildren();
      montarCampos(registro).forEach(c => {
        const dt = el('dt', null, c.rotulo);
        const dd = el('dd', 'det-valor');
        if (c.id === 'aviso') dd.append(el('span', 'badge badge-' + c.cor, c.valor));
        else dd.textContent = c.valor;
        lista.append(dt, dd);
      });
    }

    function abrir(registro, origem) {
      if (!registro) return;
      if (!overlay) construir();
      retorno = origem || document.activeElement;
      preencher(registro);
      overlay.hidden = false;
      lista.scrollTop = 0;
      overlay.scrollTop = 0;
      btnFechar.focus();
    }

    function fechar() {
      if (!overlay || overlay.hidden) return;
      overlay.hidden = true;
      apertouFora = soltouFora = false;
      if (retorno && document.contains(retorno)) retorno.focus({ preventScroll: true });
      retorno = null;
    }

    document.addEventListener('desligamentos:detalhe', e => abrir(e.detail && e.detail.registro, e.detail && e.detail.origem));

    api.abrir = abrir;
    api.fechar = fechar;
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DetalhesDesligamento = api;
})(typeof window !== 'undefined' ? window : globalThis);
