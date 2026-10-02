/* Etapa 4: carrega os dados (camada da Etapa 2), monta os filtros e atualiza cabeçalho, cards e contador.
   Gráficos e tabela ainda NÃO têm lógica — só containers em index.html.
   state.registros = base completa · state.filtrados = resultado dos filtros (usar na tabela/gráficos). */
const state = { registros: [], filtrados: [], criterios: FiltrosDesligamentos.criteriosVazios(), resumo: null, problemas: [], origem: null };

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const br = iso => (iso ? iso.split('-').reverse().join('/') : '—');
const chave = FiltrosDesligamentos.normalizar;
const fmt = n => n.toLocaleString('pt-BR');

// Cards de tipo de aviso prévio: id do card → valor do aviso (comparado sem acento/caixa).
const CARDS_AVISO = { cardTrabalhado: 'TRABALHADO', cardIndenizado: 'INDENIZADO', cardTermino: 'TERMINO CONTRATO' };

function setCard(id, valor) {
  const el = document.querySelector('#' + id + ' [data-valor]');
  if (el) el.textContent = valor === null ? '—' : fmt(valor);
}

function renderCards(registros) {
  setCard('cardTotal', registros.length);
  Object.entries(CARDS_AVISO).forEach(([id, aviso]) =>
    setCard(id, registros.filter(r => chave(r.avisoPrevio) === aviso).length));
}

/* ---------- Filtros ---------- */
const CAMPOS = { inicio: 'fInicio', fim: 'fFim', loja: 'fLoja', gerente: 'fGerente', supervisor: 'fSupervisor', funcao: 'fFuncao', aviso: 'fAviso', busca: 'fBusca' };
const el = id => document.getElementById(id);

function preencherSelect(id, todosRotulo, itens) {   // itens: [{valor, rotulo}]
  el(id).innerHTML = `<option value="">${todosRotulo}</option>` +
    itens.map(i => `<option value="${esc(i.valor)}">${esc(i.rotulo)}</option>`).join('');
}

function montarFiltros(registros) {
  const o = FiltrosDesligamentos.opcoes(registros), simples = a => a.map(v => ({ valor: v, rotulo: v }));
  preencherSelect('fLoja', 'Todas', o.lojas.map(l => ({ valor: l.valor, rotulo: l.rotulo })));
  preencherSelect('fGerente', 'Todos', simples(o.gerentes));
  preencherSelect('fSupervisor', 'Todos', simples(o.supervisores));
  preencherSelect('fFuncao', 'Todas', simples(o.funcoes));
  preencherSelect('fAviso', 'Todos', simples(o.avisos));
}

function lerCriterios() {
  const c = {};
  Object.entries(CAMPOS).forEach(([k, id]) => { c[k] = el(id).value; });
  return c;
}

function habilitarFiltros(on) {
  document.querySelectorAll('#areaFiltros input, #areaFiltros select, #areaFiltros button').forEach(x => { x.disabled = !on; });
}

function renderResultado() {
  const n = state.filtrados.length, c = state.criterios;
  el('contador').textContent = `${fmt(n)} ${n === 1 ? 'desligamento encontrado' : 'desligamentos encontrados'}`;
  const msg = el('msgVazio');
  msg.hidden = n > 0;
  msg.textContent = (c.inicio && c.fim && c.inicio > c.fim)
    ? 'A data inicial é posterior à data final.'
    : 'Nenhum desligamento encontrado para os filtros selecionados.';
}

function aplicarFiltros() {
  state.criterios = lerCriterios();
  state.filtrados = FiltrosDesligamentos.filtrar(state.registros, state.criterios);
  renderCards(state.filtrados);
  renderResultado();
  // Próximas etapas (tabela, gráficos) podem ouvir este evento ou ler state.filtrados.
  document.dispatchEvent(new CustomEvent('desligamentos:filtrados', { detail: { registros: state.filtrados, criterios: state.criterios } }));
}

function limparFiltros() {
  Object.values(CAMPOS).forEach(id => { el(id).value = ''; });
  aplicarFiltros();
}

function ligarFiltros() {
  Object.values(CAMPOS).forEach(id => {
    el(id).addEventListener(id === 'fBusca' ? 'input' : 'change', aplicarFiltros);
  });
  el('btnLimpar').addEventListener('click', limparFiltros);
}

function setStatus(tipo, texto) {
  const box = document.getElementById('statusChip');
  box.classList.remove('ok', 'erro');
  if (tipo) box.classList.add(tipo);
  document.getElementById('statusText').textContent = texto;
}

function renderDiagnostico(r) {
  const s = r.resumo;
  const linhas = [
    ['Registros', s.total], ['Período', `${br(s.periodo.inicio)} a ${br(s.periodo.fim)}`],
    ['Lojas/unidades', s.lojas], ['Gerentes', s.gerentes], ['Supervisores', s.supervisores],
    ['Funções (após normalização)', s.funcoes.join(', ')], ['Tipos de aviso', s.avisos.join(', ')],
    ['Nomes com espaço removido', s.nomesAparados], ['Funções normalizadas (ADM)', s.funcoesNormalizadas],
    ['Erros de validação', s.erros], ['Avisos de validação', s.avisosValidacao]
  ];
  document.getElementById('diagnostico').innerHTML = '<dl>' + linhas.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('') + '</dl>' +
    (r.problemas.length ? '<ul>' + r.problemas.slice(0, 20).map(p => `<li>Linha ${p.linha} · ${esc(p.campo)} · ${esc(p.detalhe)}</li>`).join('') + '</ul>' : '');
}

async function init() {
  const mostrarDiag = new URLSearchParams(location.search).has('diagnostico');
  if (mostrarDiag) document.getElementById('diagnosticoPanel').hidden = false;
  habilitarFiltros(false);
  try {
    const r = await Desligamentos.carregar(window.DESLIG_CONFIG);
    Object.assign(state, r);
    window.DESLIG_STATE = state;                       // para as próximas etapas e para depuração
    montarFiltros(r.registros);
    ligarFiltros();
    habilitarFiltros(true);
    aplicarFiltros();                                  // sem filtros: mostra todos os registros
    const base = r.origem === 'local' ? 'arquivo local de teste' : 'Google Sheets';
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setStatus('ok', `Base: ${base} · ${fmt(r.resumo.total)} registros · carregada às ${hora}`);
    if (mostrarDiag) renderDiagnostico(r);
  } catch (e) {
    console.error(e);
    setStatus('erro', 'Erro ao carregar dados');
    if (mostrarDiag) document.getElementById('diagnostico').textContent = e.message;
  }
}
document.addEventListener('DOMContentLoaded', init);
