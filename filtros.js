/* Lógica de filtragem — Dashboard de Desligamentos (Etapa 4). Sem DOM; funciona no navegador
   (window.FiltrosDesligamentos) e no Node (require). Não altera os registros da camada de dados.
   As datas dos registros (r.data) já são ISO AAAA-MM-DD, normalizadas na Etapa 2; os campos de
   data da tela também entregam ISO, então a comparação é feita direto como texto (sem risco de
   inverter dia e mês). */
(function (root) {
  'use strict';

  // Ordem fixa dos tipos de aviso nas opções; valores não previstos entram depois.
  const AVISOS = ['Trabalhado', 'Indenizado', 'Término Contrato'];

  // Sem acento, sem diferença de caixa, sem espaços nas pontas.
  const normalizar = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();

  // '' em um critério = sem filtro (equivale a "Todos"/campo vazio).
  const criteriosVazios = () => ({ inicio: '', fim: '', loja: '', gerente: '', supervisor: '', funcao: '', aviso: '', busca: '' });

  // Todos os critérios preenchidos valem ao mesmo tempo (E).
  function filtrar(registros, c) {
    const termos = normalizar(c.busca).split(/\s+/).filter(Boolean);
    const aviso = normalizar(c.aviso);
    return registros.filter(r => {
      if (c.inicio && !(r.data && r.data >= c.inicio)) return false;
      if (c.fim && !(r.data && r.data <= c.fim)) return false;
      if (c.loja && r.loja !== c.loja) return false;
      if (c.gerente && r.gerente !== c.gerente) return false;
      if (c.supervisor && r.supervisor !== c.supervisor) return false;
      if (c.funcao && r.funcao !== c.funcao) return false;           // r.funcao já é a função normalizada (ADM → ADMINISTRATIVO)
      if (aviso && normalizar(r.avisoPrevio) !== aviso) return false;
      if (termos.length) {                                           // busca parcial: todas as palavras digitadas devem aparecer no nome
        const nome = normalizar(r.colaborador);
        if (!termos.every(t => nome.includes(t))) return false;
      }
      return true;
    });
  }

  // Opções dos selects, montadas a partir da base carregada.
  function opcoes(registros) {
    const unicos = k => [...new Set(registros.map(r => r[k]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const lojas = new Map();
    registros.forEach(r => { if (r.loja && !lojas.has(r.loja)) lojas.set(r.loja, { valor: r.loja, rotulo: r.lojaLabel, ordem: r.lojaOrdem }); });
    const avisosBase = [...new Set(registros.map(r => r.avisoPrevio).filter(Boolean))];
    const extras = avisosBase.filter(a => !AVISOS.some(x => normalizar(x) === normalizar(a)));
    return {
      lojas: [...lojas.values()].sort((a, b) => a.ordem - b.ordem || a.valor.localeCompare(b.valor, 'pt-BR')),
      gerentes: unicos('gerente'), supervisores: unicos('supervisor'), funcoes: unicos('funcao'),
      avisos: [...AVISOS, ...extras]
    };
  }

  const api = { criteriosVazios, filtrar, opcoes, normalizar };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FiltrosDesligamentos = api;
})(typeof window !== 'undefined' ? window : globalThis);
