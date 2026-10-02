/* Exportação Excel/CSV — Dashboard de Desligamentos (Etapa 8, bloco 1).
   Fluxo: DESLIG_STATE.filtrados → exportacao.js → arquivo.
   • Exporta TODOS os registros filtrados (a paginação da tabela é só visual) e não tem lógica de filtro própria.
   • A ordem das linhas segue a ordenação atualmente escolhida na tabela (lida do aria-sort dos cabeçalhos).
   • A normalização (datas dd/mm/aaaa, "Loja 05", tempo amigável, avisos) acontece só aqui, na saída:
     os registros internos nunca são alterados (ADM, Término Contrato, RDS e tempo numérico continuam como estão).
   • Excel (.xlsx) gerado no navegador, sem biblioteca e sem CDN (ZIP "store" + XML escrito à mão). CSV com BOM UTF-8 e ";".
   As funções puras (montarLinhas, gerarCsv, gerarXlsx) não usam DOM e funcionam no Node (require). */
(function (root) {
  'use strict';

  // Regras de apresentação compartilhadas com a tabela (formatarData / formatarTempo / ordenar).
  const T = root.TabelaDesligamentos || (typeof require !== 'undefined' ? require('./tabela.js') : null);
  if (!T) throw new Error('exportacao.js precisa de tabela.js carregado antes.');

  const norm = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
  const AVISOS = { 'TRABALHADO': 'Trabalhado', 'INDENIZADO': 'Indenizado', 'TERMINO CONTRATO': 'Término de Contrato' };
  const rotuloAviso = v => AVISOS[norm(v)] || String(v ?? '');          // valor desconhecido sai como está

  /* ---------- Colunas (ordem pedida) ----------
     tipo: 'texto' | 'data' (ISO AAAA-MM-DD na linha; formatada na saída) | 'inteiro' */
  const COLUNAS = [
    { titulo: 'COLABORADOR',          tipo: 'texto',   get: r => r.colaborador },
    { titulo: 'NOME_RED',             tipo: 'texto',   get: r => r.nomeRed },
    { titulo: 'ADMISSÃO',             tipo: 'data',    get: r => r.admissao },
    { titulo: 'DATA DO DESLIGAMENTO', tipo: 'data',    get: r => r.data },
    { titulo: 'DOCUMENTO',            tipo: 'texto',   get: r => r.documento },
    { titulo: 'T. AVISO PRÉVIO',      tipo: 'texto',   get: r => rotuloAviso(r.avisoPrevio) },
    { titulo: 'LOJA',                 tipo: 'texto',   get: r => r.lojaLabel },          // "Loja 05" / "RDS"
    { titulo: 'GERENTE',              tipo: 'texto',   get: r => r.gerente },
    { titulo: 'SUPER',                tipo: 'texto',   get: r => r.supervisor },
    { titulo: 'FUNÇÃO',               tipo: 'texto',   get: r => r.funcao },             // ADM já vem como ADMINISTRATIVO
    { titulo: 'TEMPO DE EMPRESA',     tipo: 'texto',   get: r => (r.tempoDias == null ? '' : T.formatarTempo(r.tempoDias)) },
    { titulo: 'TEMPO (DIAS)',         tipo: 'inteiro', get: r => (r.tempoDias == null ? null : r.tempoDias) }   // valor original
  ];

  const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
  const dataBR = iso => (ISO.test(iso || '') ? T.formatarData(iso) : '');   // só texto: sem inverter dia/mês
  const vazio = v => v == null || v === '';

  // Uma linha por registro, na ordem recebida. Não altera os registros.
  function montarLinhas(registros) {
    return registros.map(r => COLUNAS.map(c => c.get(r)));
  }

  /* ---------- CSV ---------- */

  function celulaCsv(v, col) {
    if (vazio(v)) return '';
    if (col.tipo === 'inteiro') return String(v);
    if (col.tipo === 'data') return dataBR(v);
    let s = String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;                                // evita que o Excel interprete o texto como fórmula
    return /[";\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  // ";" como separador (padrão do Excel em português), CRLF e BOM UTF-8 para abrir com acentos corretos.
  function gerarCsv(linhas) {
    const cab = COLUNAS.map(c => c.titulo).join(';');
    const corpo = linhas.map(l => l.map((v, i) => celulaCsv(v, COLUNAS[i])).join(';'));
    return '\uFEFF' + [cab, ...corpo].join('\r\n') + '\r\n';
  }

  /* ---------- XLSX (sem biblioteca) ---------- */

  const xmlEsc = s => String(s)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // ISO → número de série do Excel (dias desde 30/12/1899).
  function serialExcel(iso) {
    const m = ISO.exec(iso || '');
    return m ? Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 864e5) + 25569 : null;
  }

  const letra = i => String.fromCharCode(65 + i);                            // 12 colunas: A–L

  function celulaXml(ref, v, col) {
    if (vazio(v)) return '';
    if (col.tipo === 'inteiro') return Number.isFinite(+v) ? `<c r="${ref}" s="3"><v>${+v}</v></c>` : '';
    if (col.tipo === 'data') { const n = serialExcel(v); return n == null ? '' : `<c r="${ref}" s="2"><v>${n}</v></c>`; }
    return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`;
  }

  function larguraColuna(linhas, i) {
    const col = COLUNAS[i];
    let max = col.titulo.length;
    for (const l of linhas) {
      const v = l[i];
      const n = vazio(v) ? 0 : col.tipo === 'data' ? 10 : String(v).length;
      if (n > max) max = n;
    }
    return Math.min(45, max) + 3;
  }

  function planilhaXml(linhas) {
    const ultima = linhas.length + 1;
    const cols = COLUNAS.map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${larguraColuna(linhas, i)}" customWidth="1"/>`).join('');
    const cab = COLUNAS.map((c, i) => `<c r="${letra(i)}1" s="1" t="inlineStr"><is><t>${xmlEsc(c.titulo)}</t></is></c>`).join('');
    const corpo = linhas.map((l, k) => {
      const n = k + 2;
      return `<row r="${n}">${l.map((v, i) => celulaXml(letra(i) + n, v, COLUNAS[i])).join('')}</row>`;
    }).join('');
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      `<dimension ref="A1:${letra(COLUNAS.length - 1)}${ultima}"/>` +
      '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
      `<cols>${cols}</cols><sheetData><row r="1">${cab}</row>${corpo}</sheetData>` +
      `<autoFilter ref="A1:${letra(COLUNAS.length - 1)}${ultima}"/></worksheet>`;
  }

  const ESTILOS_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<numFmts count="1"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/></numFmts>' +
    '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
    '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
    '<fill><patternFill patternType="solid"><fgColor rgb="FFD9E1F2"/><bgColor indexed="64"/></patternFill></fill></fills>' +
    '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="4">' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>' +
    '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="center"/></xf>' +
    '<xf numFmtId="1" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
    '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';

  const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const PACOTE = {
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      `<Relationship Id="rId1" Type="${REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${REL}">` +
      '<sheets><sheet name="Desligamentos" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      `<Relationship Id="rId1" Type="${REL}/worksheet" Target="worksheets/sheet1.xml"/>` +
      `<Relationship Id="rId2" Type="${REL}/styles" Target="styles.xml"/></Relationships>`,
    'xl/styles.xml': ESTILOS_XML
  };

  const TAB_CRC = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t;
  })();
  function crc32(b) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < b.length; i++) c = TAB_CRC[(c ^ b[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  // ZIP sem compressão (método 0): arquivos pequenos, formato aceito pelo Excel.
  function zipStore(arquivos) {                                              // [{ nome, dados: Uint8Array }]
    const enc = new TextEncoder(), agora = new Date();
    const hora = (agora.getHours() << 11) | (agora.getMinutes() << 5) | (agora.getSeconds() >> 1);
    const dia = ((agora.getFullYear() - 1980) << 9) | ((agora.getMonth() + 1) << 5) | agora.getDate();
    const partes = [], central = [];
    let pos = 0;
    for (const { nome, dados } of arquivos) {
      const nm = enc.encode(nome), crc = crc32(dados), tam = dados.length;
      const loc = new Uint8Array(30 + nm.length), dl = new DataView(loc.buffer);
      dl.setUint32(0, 0x04034b50, true); dl.setUint16(4, 20, true); dl.setUint16(6, 0x0800, true); dl.setUint16(8, 0, true);
      dl.setUint16(10, hora, true); dl.setUint16(12, dia, true); dl.setUint32(14, crc, true);
      dl.setUint32(18, tam, true); dl.setUint32(22, tam, true); dl.setUint16(26, nm.length, true); dl.setUint16(28, 0, true);
      loc.set(nm, 30);
      const cen = new Uint8Array(46 + nm.length), dc = new DataView(cen.buffer);
      dc.setUint32(0, 0x02014b50, true); dc.setUint16(4, 20, true); dc.setUint16(6, 20, true); dc.setUint16(8, 0x0800, true);
      dc.setUint16(10, 0, true); dc.setUint16(12, hora, true); dc.setUint16(14, dia, true); dc.setUint32(16, crc, true);
      dc.setUint32(20, tam, true); dc.setUint32(24, tam, true); dc.setUint16(28, nm.length, true);
      dc.setUint32(42, pos, true);
      cen.set(nm, 46);
      partes.push(loc, dados); central.push(cen);
      pos += loc.length + tam;
    }
    const tamCentral = central.reduce((s, c) => s + c.length, 0);
    const fim = new Uint8Array(22), df = new DataView(fim.buffer);
    df.setUint32(0, 0x06054b50, true); df.setUint16(8, arquivos.length, true); df.setUint16(10, arquivos.length, true);
    df.setUint32(12, tamCentral, true); df.setUint32(16, pos, true);
    const todos = [...partes, ...central, fim];
    const out = new Uint8Array(todos.reduce((s, p) => s + p.length, 0));
    let o = 0;
    for (const p of todos) { out.set(p, o); o += p.length; }
    return out;
  }

  function gerarXlsx(linhas) {
    const enc = new TextEncoder();
    const arquivos = Object.entries(PACOTE).map(([nome, xml]) => ({ nome, dados: enc.encode(xml) }));
    arquivos.push({ nome: 'xl/worksheets/sheet1.xml', dados: enc.encode(planilhaXml(linhas)) });
    return zipStore(arquivos);
  }

  /* ---------- Nome do arquivo ---------- */

  function nomeArquivo(ext, data) {                                          // desligamentos_AAAA-MM-DD.ext (data local)
    const d = data || new Date(), p = n => String(n).padStart(2, '0');
    return `desligamentos_${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.${ext}`;
  }

  const api = { COLUNAS, montarLinhas, gerarCsv, gerarXlsx, nomeArquivo };

  /* ---------- Interface (só no navegador) ---------- */

  if (typeof document !== 'undefined') {
    const $ = id => document.getElementById(id);
    const area = $('areaTabela');
    const titulo = area && area.querySelector('.slot-title');

    if (titulo) {
      const barra = document.createElement('div');
      barra.className = 'export-bar';
      barra.id = 'exportBar';
      barra.innerHTML =
        '<p class="result-count" id="exportInfo" aria-live="polite">—</p>' +
        '<div class="export-actions"><span class="export-label">Exportar:</span>' +
        '<button type="button" class="btn-ghost" id="btnExportXlsx" disabled>Excel</button>' +
        '<button type="button" class="btn-ghost" id="btnExportCsv" disabled>CSV</button></div>' +
        '<p class="export-erro" id="exportErro" role="alert" hidden></p>';
      titulo.insertAdjacentElement('afterend', barra);

      const filtrados = () => (root.DESLIG_STATE && root.DESLIG_STATE.filtrados) || [];

      function atualizar() {
        const n = filtrados().length;
        $('exportInfo').textContent = `${n.toLocaleString('pt-BR')} ${n === 1 ? 'registro' : 'registros'} para exportar`;
        $('btnExportXlsx').disabled = $('btnExportCsv').disabled = n === 0;
        $('exportErro').hidden = true;
      }

      // Mesma ordem que o usuário vê na tabela (cabeçalho com aria-sort); padrão: data, mais recentes primeiro.
      function ordemDaTabela() {
        const th = document.querySelector('#tabelaWrap th[aria-sort="ascending"], #tabelaWrap th[aria-sort="descending"]');
        return th && th.dataset.col
          ? { chave: th.dataset.col, dir: th.getAttribute('aria-sort') === 'ascending' ? 'asc' : 'desc' }
          : { chave: 'data', dir: 'desc' };
      }

      function baixar(conteudo, tipo, nome) {
        const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
        const a = document.createElement('a');
        a.href = url; a.download = nome;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }

      function exportar(formato) {
        try {
          const lista = filtrados();                                          // TODOS os filtrados, não só a página atual
          if (!lista.length) return;
          const o = ordemDaTabela();
          const linhas = montarLinhas(T.ordenar(lista, o.chave, o.dir));      // ordenar() trabalha numa cópia
          if (formato === 'xlsx') baixar(gerarXlsx(linhas), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', nomeArquivo('xlsx'));
          else baixar(gerarCsv(linhas), 'text/csv;charset=utf-8', nomeArquivo('csv'));
          $('exportErro').hidden = true;
        } catch (e) {
          console.error(e);
          $('exportErro').textContent = 'Não foi possível gerar o arquivo.';
          $('exportErro').hidden = false;
        }
      }

      $('btnExportXlsx').addEventListener('click', () => exportar('xlsx'));
      $('btnExportCsv').addEventListener('click', () => exportar('csv'));
      document.addEventListener('desligamentos:filtrados', atualizar);
    }
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.ExportacaoDesligamentos = api;
})(typeof window !== 'undefined' ? window : globalThis);
