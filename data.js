/* Camada de dados — Dashboard de Desligamentos.
   Lê o CSV, normaliza e valida. NUNCA altera a fonte: o original fica em
   `raw` de cada registro; todo tratamento vive apenas aqui. Sem DOM. */
(function (root) {
  'use strict';

  const COLUNAS = { COLABORADOR: 'colaborador', NOME_RED: 'nomeRed', ADMISSAO: 'admissao',
    DOCUMENTO: 'documento', T_AVISO_PREVIO: 'avisoPrevio', DATA: 'data', LOJA: 'loja',
    GERENTE: 'gerente', SUPER: 'supervisor', TEMPO: 'tempo', FUNCAO: 'funcao' };

  const FUNCAO_ALIASES = { 'ADM': 'ADMINISTRATIVO' };

  // Faixas aplicadas só na visualização. O valor em dias (tempoDias) é preservado.
  const FAIXAS_TEMPO = [
    { id: 'ate30',  label: 'Até 30 dias',      max: 30 },
    { id: '31-90',  label: '31 a 90 dias',     max: 90 },
    { id: '91-180', label: '91 a 180 dias',    max: 180 },
    { id: '181-365', label: '181 a 365 dias',  max: 365 },
    { id: '1-2a',   label: '1 a 2 anos',       max: 730 },
    { id: '2a+',    label: 'Mais de 2 anos',   max: Infinity }
  ];

  function chaveCabecalho(h) {
    return String(h).replace(/^\uFEFF/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
  }

  function parseCSV(text) {
    text = text.replace(/^\uFEFF/, '');
    const first = text.split(/\r?\n/, 1)[0] || '';
    const sep = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : ',';
    const rows = []; let row = [], f = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === sep) { row.push(f); f = ''; }
      else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
      else if (c !== '\r') f += c;
    }
    if (f.length || row.length) { row.push(f); rows.push(row); }
    return rows.filter(r => r.some(v => v.trim() !== ''));
  }

  const pad = n => String(n).padStart(2, '0');
  function isoValida(y, m, d) {
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
      ? `${y}-${pad(m)}-${pad(d)}` : null;
  }
  // Aceita dd/mm/aaaa (sempre dia/mês), aaaa-mm-dd e serial do Excel/Sheets. Outro formato → null.
  function parseData(raw) {
    const s = String(raw ?? '').trim(); let m;
    if (!s) return null;
    if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))) return isoValida(+m[3], +m[2], +m[1]);
    if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/))) return isoValida(+m[1], +m[2], +m[3]);
    if (/^\d{5}$/.test(s)) {
      const n = +s;
      if (n >= 20000 && n <= 80000) return new Date(Date.UTC(1899, 11, 30) + n * 864e5).toISOString().slice(0, 10);
    }
    return null;
  }
  const diasEntre = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);

  function faixaDoTempo(dias) {
    if (dias == null) return null;
    return FAIXAS_TEMPO.find(f => dias <= f.max);
  }
  function lojaInfo(loja) {
    return /^\d+$/.test(loja)
      ? { label: 'Loja ' + pad(+loja), ordem: +loja }
      : { label: loja, ordem: 1000 };            // RDS e outras unidades: valor original, após as numeradas
  }
  const limpa = v => String(v ?? '').replace(/\s+/g, ' ').trim();

  function processCsv(text) {
    const linhas = parseCSV(text);
    if (!linhas.length) throw new Error('CSV vazio.');
    const idx = {}; linhas[0].forEach((h, i) => { idx[chaveCabecalho(h)] = i; });
    const faltando = Object.keys(COLUNAS).filter(k => !(k in idx));
    if (faltando.length) throw new Error('Colunas ausentes na planilha: ' + faltando.join(', '));

    const problemas = [];
    const add = (linha, tipo, campo, detalhe) => problemas.push({ linha, tipo, campo, detalhe });
    const stats = { nomesAparados: 0, funcoesNormalizadas: 0 };

    const registros = linhas.slice(1).map((cols, n) => {
      const linha = n + 2;                          // nº da linha na planilha
      const raw = {}; Object.keys(COLUNAS).forEach(k => { raw[k] = cols[idx[k]] ?? ''; });

      const colaborador = limpa(raw.COLABORADOR);
      if (raw.COLABORADOR !== raw.COLABORADOR.trim()) stats.nomesAparados++;

      const funcaoOriginal = limpa(raw.FUNCAO).toUpperCase();
      const funcao = FUNCAO_ALIASES[funcaoOriginal] || funcaoOriginal;
      if (funcao !== funcaoOriginal) stats.funcoesNormalizadas++;

      const admissao = parseData(raw.ADMISSAO), data = parseData(raw.DATA);
      if (!admissao) add(linha, 'erro', 'ADMISSÃO', `data não reconhecida: "${raw.ADMISSAO}"`);
      if (!data) add(linha, 'erro', 'DATA', `data não reconhecida: "${raw.DATA}"`);

      const t = String(raw.TEMPO).trim();
      const tempoDias = /^\d+$/.test(t) ? parseInt(t, 10) : null;
      if (tempoDias === null) add(linha, 'erro', 'TEMPO', `valor inválido: "${raw.TEMPO}"`);
      if (admissao && data && tempoDias !== null) {
        const calc = diasEntre(admissao, data);
        if (calc !== tempoDias) add(linha, 'aviso', 'TEMPO', `TEMPO=${tempoDias} difere de DATA−ADMISSÃO=${calc}`);
        if (calc < 0) add(linha, 'erro', 'ADMISSÃO', 'admissão posterior ao desligamento');
      }

      const loja = limpa(raw.LOJA).toUpperCase(), li = lojaInfo(loja);
      ['COLABORADOR', 'LOJA', 'GERENTE', 'SUPER', 'FUNCAO', 'T_AVISO_PREVIO', 'DOCUMENTO']
        .forEach(k => { if (!limpa(raw[k])) add(linha, 'erro', k, 'campo vazio'); });

      const faixa = faixaDoTempo(tempoDias);
      return {
        linha, colaborador, nomeRed: limpa(raw.NOME_RED),
        admissao, data, mes: data ? data.slice(0, 7) : null,
        documento: limpa(raw.DOCUMENTO).toUpperCase(),      // EMPRESA | EMPREGADO (classificação da base)
        avisoPrevio: limpa(raw.T_AVISO_PREVIO),
        loja, lojaLabel: li.label, lojaOrdem: li.ordem,
        gerente: limpa(raw.GERENTE).toUpperCase(), supervisor: limpa(raw.SUPER).toUpperCase(),
        tempoDias, faixaTempo: faixa ? faixa.id : null, faixaTempoLabel: faixa ? faixa.label : null,
        funcao, funcaoOriginal, raw
      };
    });

    const dup = {};
    registros.forEach(r => { (dup[r.colaborador] = dup[r.colaborador] || []).push(r.linha); });
    Object.entries(dup).forEach(([nome, ls]) => { if (ls.length > 1) add(ls[0], 'aviso', 'COLABORADOR', `nome repetido nas linhas ${ls.join(', ')}`); });

    const datas = registros.map(r => r.data).filter(Boolean).sort();
    const distintos = k => [...new Set(registros.map(r => r[k]).filter(Boolean))];
    const resumo = {
      total: registros.length,
      periodo: { inicio: datas[0] || null, fim: datas[datas.length - 1] || null },
      lojas: distintos('loja').length, gerentes: distintos('gerente').length,
      supervisores: distintos('supervisor').length, funcoes: distintos('funcao').sort(),
      avisos: distintos('avisoPrevio').sort(), ...stats,
      erros: problemas.filter(p => p.tipo === 'erro').length,
      avisosValidacao: problemas.filter(p => p.tipo === 'aviso').length
    };
    return { registros, resumo, problemas };
  }

  async function carregar(cfg) {
    const url = (cfg.SHEET_CSV_URL || '').trim();
    const origem = url ? 'google-sheets' : 'local';
    const alvo = url ? url + (url.includes('?') ? '&' : '?') + 't=' + Date.now() : cfg.LOCAL_CSV;
    const res = await fetch(alvo, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Falha ao carregar (${origem}): HTTP ${res.status}`);
    return { ...processCsv(await res.text()), origem };
  }

  const api = { carregar, processCsv, parseData, faixaDoTempo, FAIXAS_TEMPO };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Desligamentos = api;
})(typeof window !== 'undefined' ? window : globalThis);
