/* Gráficos — Dashboard de Desligamentos (Etapa 6).
   Dois gráficos (Chart.js 4, arquivo local chart.umd.min.js):
     1) Desligamentos por mês  (barras verticais, usa registro.mes = AAAA-MM da DATA, já normalizada na Etapa 2)
     2) Desligamentos por tempo de empresa (barras horizontais, usa registro.faixaTempo calculada em data.js
        a partir do TEMPO original em dias — nenhuma regra nova de faixa é criada aqui)
   Os dados vêm SEMPRE de window.DESLIG_STATE.filtrados; não existe filtragem própria. Redesenha no evento
   'desligamentos:filtrados'. As funções de contagem não usam DOM e funcionam no Node (require). */
(function (root) {
  'use strict';

  const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const MESES_LONGOS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  // Mesmas faixas e mesma ordem de data.js (FAIXAS_TEMPO); aqui só os rótulos de exibição.
  const FAIXAS = [
    { id: 'ate30', rotulo: 'Até 30 dias' },
    { id: '31-90', rotulo: '31–90 dias' },
    { id: '91-180', rotulo: '91–180 dias' },
    { id: '181-365', rotulo: '181–365 dias' },
    { id: '1-2a', rotulo: '1–2 anos' },
    { id: '2a+', rotulo: '> 2 anos' }
  ];

  const nomeMes = (aaaamm, comAno) => {
    const [a, m] = aaaamm.split('-');
    return comAno ? `${MESES_LONGOS[+m - 1]} de ${a}` : MESES_LONGOS[+m - 1];
  };

  // Meses (AAAA-MM) do primeiro ao último mês da BASE COMPLETA, sem buracos — o eixo não muda ao filtrar.
  function mesesDoPeriodo(registros) {
    const ms = registros.map(r => r.mes).filter(Boolean).sort();
    if (!ms.length) return [];
    let [a, m] = ms[0].split('-').map(Number);
    const [fa, fm] = ms[ms.length - 1].split('-').map(Number), out = [];
    while (a < fa || (a === fa && m <= fm)) {
      out.push(`${a}-${String(m).padStart(2, '0')}`);
      if (++m > 12) { m = 1; a++; }
    }
    return out;
  }

  function contarPorMes(registros, meses) {
    const n = Object.fromEntries(meses.map(m => [m, 0]));
    registros.forEach(r => { if (r.mes in n) n[r.mes]++; });
    return meses.map(m => n[m]);
  }

  function contarPorFaixa(registros) {
    const n = Object.fromEntries(FAIXAS.map(f => [f.id, 0]));
    registros.forEach(r => { if (r.faixaTempo in n) n[r.faixaTempo]++; });
    return FAIXAS.map(f => n[f.id]);
  }

  const api = { MESES_CURTOS, MESES_LONGOS, FAIXAS, mesesDoPeriodo, contarPorMes, contarPorFaixa };

  /* ---------- Interface (só no navegador) ---------- */

  if (typeof document !== 'undefined') {
    const $ = id => document.getElementById(id);
    const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    const graficos = {};                                     // { mes: Chart, tempo: Chart }

    // Escreve o valor de cada barra (sem plugin externo) + a porcentagem sobre o total do gráfico
    // (soma das barras = desligamentos filtrados); barras com 0 ficam sem rótulo.
    const pct = (v, total) => total ? (v / total * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%' : '0,0%';
    const rotulosValor = {
      id: 'rotulosValor',
      afterDatasetsDraw(chart) {
        const { ctx } = chart, horiz = chart.options.indexAxis === 'y';
        const dados = chart.data.datasets[0].data, total = dados.reduce((a, b) => a + b, 0);
        const fonte = getComputedStyle(document.body).fontFamily;
        ctx.save();
        ctx.fillStyle = cssVar('--text-dim');
        ctx.textAlign = horiz ? 'left' : 'center';
        ctx.textBaseline = horiz ? 'middle' : 'bottom';
        chart.getDatasetMeta(0).data.forEach((barra, i) => {
          const v = dados[i];
          if (!v) return;
          const p = pct(v, total);
          if (horiz) {
            ctx.font = `600 12px ${fonte}`;
            const t1 = v.toLocaleString('pt-BR');
            ctx.fillText(t1, barra.x + 6, barra.y);
            const w = ctx.measureText(t1 + ' ').width;
            ctx.font = `400 11px ${fonte}`;
            ctx.fillText(`(${p})`, barra.x + 6 + w, barra.y);
          } else {                                           // barras verticais são estreitas: número em cima, % logo acima
            ctx.font = `600 12px ${fonte}`;
            ctx.fillText(v.toLocaleString('pt-BR'), barra.x, barra.y - 4);
            ctx.font = `400 10px ${fonte}`;
            ctx.fillText(p, barra.x, barra.y - 18);
          }
        });
        ctx.restore();
      }
    };

    function opcoes(horizontal, tituloTooltip) {
      const dim = cssVar('--text-dim'), grade = cssVar('--border-soft');
      const eixoCat = { grid: { display: false }, border: { color: cssVar('--border') }, ticks: { color: dim, font: { size: 12 } } };
      const eixoVal = { beginAtZero: true, grace: horizontal ? '24%' : '18%', border: { display: false }, grid: { color: grade }, ticks: { color: dim, precision: 0, font: { size: 12 } } };
      return {
        indexAxis: horizontal ? 'y' : 'x',
        responsive: true, maintainAspectRatio: false, animation: false,
        scales: horizontal ? { x: eixoVal, y: eixoCat } : { x: eixoCat, y: eixoVal },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: cssVar('--panel-soft'), borderColor: cssVar('--border'), borderWidth: 1,
            titleColor: cssVar('--text'), bodyColor: dim, padding: 10, displayColors: false,
            callbacks: {
              title: itens => tituloTooltip(itens[0].dataIndex),
              label: it => { const v = it.parsed[horizontal ? 'x' : 'y']; return `${v.toLocaleString('pt-BR')} ${v === 1 ? 'desligamento' : 'desligamentos'} (${pct(v, it.dataset.data.reduce((a, b) => a + b, 0))})`; }
            }
          }
        }
      };
    }

    function criar(canvasId, horizontal, rotulos, tituloTooltip) {
      return new root.Chart($(canvasId), {
        type: 'bar',
        data: { labels: rotulos, datasets: [{ data: rotulos.map(() => 0), backgroundColor: cssVar('--accent'), borderRadius: 4, maxBarThickness: horizontal ? 24 : 40 }] },
        options: opcoes(horizontal, tituloTooltip),
        plugins: [rotulosValor]
      });
    }

    function mostrar(boxId, vazioId, temDados, msg) {
      $(boxId).hidden = !temDados;
      $(vazioId).hidden = temDados;
      if (msg) $(vazioId).textContent = msg;
    }

    function render() {
      const estado = root.DESLIG_STATE;
      if (!estado) return;
      const lista = estado.filtrados || [], vazio = lista.length === 0;

      if (!root.Chart) {                                     // biblioteca não carregou: avisa em vez de painel em branco
        mostrar('graficoMesBox', 'graficoMesVazio', false, 'Não foi possível carregar a biblioteca de gráficos.');
        mostrar('graficoTempoBox', 'graficoTempoVazio', false, 'Não foi possível carregar a biblioteca de gráficos.');
        return;
      }
      const msgVazio = 'Nenhum desligamento encontrado para os filtros selecionados.';
      mostrar('graficoMesBox', 'graficoMesVazio', !vazio, msgVazio);
      mostrar('graficoTempoBox', 'graficoTempoVazio', !vazio, msgVazio);
      if (vazio) return;

      // Eixo dos meses = período da base completa (não muda com os filtros; meses sem registro ficam em 0).
      const meses = mesesDoPeriodo(estado.registros), multiAno = meses.length > 0 && meses[0].slice(0, 4) !== meses[meses.length - 1].slice(0, 4);
      const rotMes = meses.map(m => MESES_CURTOS[+m.slice(5) - 1] + (multiAno ? '/' + m.slice(2, 4) : ''));
      if (!graficos.mes) graficos.mes = criar('graficoMes', false, rotMes, i => nomeMes(graficos.mes.$meses[i], multiAno));
      if (!graficos.tempo) graficos.tempo = criar('graficoTempo', true, FAIXAS.map(f => f.rotulo), i => FAIXAS[i].rotulo);

      const gm = graficos.mes, gt = graficos.tempo;
      gm.$meses = meses;
      gm.data.labels = rotMes;
      gm.data.datasets[0].data = contarPorMes(lista, meses);
      gt.data.datasets[0].data = contarPorFaixa(lista);
      [gm, gt].forEach(g => { g.resize(); g.update(); });

      $('graficoMes').setAttribute('aria-label', 'Desligamentos por mês: ' + rotMes.map((r, i) => `${r} ${gm.data.datasets[0].data[i]}`).join(', '));
      $('graficoTempo').setAttribute('aria-label', 'Desligamentos por tempo de empresa: ' + FAIXAS.map((f, i) => `${f.rotulo} ${gt.data.datasets[0].data[i]}`).join(', '));
    }

    document.addEventListener('desligamentos:filtrados', render);
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.GraficosDesligamentos = api;
})(typeof window !== 'undefined' ? window : globalThis);
