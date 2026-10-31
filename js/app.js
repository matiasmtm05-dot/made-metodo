// Made · Método — aplicación principal (sin dependencias, enrutado por #hash)
import * as S from './store.js';
import * as E from './engine.js';
import { PILARES, PREGUNTAS, KPIS, ESCALA, PROTOCOLOS, TIPOS, MUNICIPIOS, DIAS, CANALES, pilar, pregunta, kpi } from './data.js';
import { lineaKpi, radar, anillo } from './charts.js';

const $app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const logo = (kind, cls = '', label = 'Made Studio') =>
  `<svg class="logo ${cls}" role="img" aria-label="${label}"><use href="#logo-${kind}"/></svg>`;
const ico = {
  eye: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  back: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
  doc: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
  plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
};

const ui = { q: {}, confirmar: null };
let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
const go = h => { if (location.hash === h) render(); else location.hash = h; };
const parseNum = v => { if (v === null || v === undefined) return null; const s = String(v).trim().replace(/\s/g, '').replace(',', '.'); if (s === '') return null; const n = Number(s); return Number.isFinite(n) ? n : null; };
const fecha = iso => new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
const iniciales = s => (s || '?').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

// ---------------- Estructura ----------------
function layout(user, body, current = '') {
  const nav = user.rol === 'consultora'
    ? [['#/panel', 'Panel', 'panel'], ['#/nuevo', 'Nuevo negocio', 'nuevo']]
    : [['#/mi-negocio', 'Mi negocio', 'mi'], ['#/mi-negocio/diagnostico', 'Diagnóstico', 'diag'], [`#/informe/${user.negocioId}`, 'Informe', 'informe']];
  return `
  <header class="top"><div class="wrap">
    <a class="brand" href="${user.rol === 'consultora' ? '#/panel' : '#/mi-negocio'}">${logo('icon')}<div><b>Made</b><span>Método · made for you</span></div></a>
    <nav aria-label="Principal">${nav.map(([h, t, id]) => `<a href="${h}" ${current === id ? 'aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
    <div class="user"><span class="avatar" aria-hidden="true">${esc(iniciales(user.nombre))}</span>
      <span class="who"><b>${esc(user.nombre)}</b><br><span class="muted small">${user.rol === 'consultora' ? 'Consultora' : 'Dueño del negocio'}</span></span>
      <button class="btn ghost sm" data-act="salir">Salir</button></div>
  </div></header>
  <main><div class="wrap">${body}</div></main>
  ${footer()}`;
}

function footer() {
  return `<footer class="foot"><div class="wrap">
    <span class="badge-demo"><span class="tag aviso">Prototipo en construcción</span> Datos ficticios · se guardan solo en este navegador.</span>
    <span>Made Studio · made for you · <button data-act="reset">${ui.confirmar === 'reset' ? '¿Seguro? Pulsa otra vez para restablecer' : 'Restablecer datos de ejemplo'}</button></span>
  </div></footer>`;
}

const tagNivel = nv => `<span class="tag ${nv.id}">${esc(nv.nombre)}</span>`;

// ---------------- Acceso ----------------
function loginView(err = '') {
  const demo = S.datos().usuarios;
  return `<div class="login">
    <section class="login-art" aria-hidden="false">
      <div class="blob b1"></div><div class="blob b2"></div>
      <svg class="seam-svg" viewBox="0 0 600 700" preserveAspectRatio="none" aria-hidden="true"><path d="M-20 520 C 120 420, 260 640, 400 500 S 560 360, 640 420"/><path d="M380 -20 C 330 120, 520 200, 470 330"/></svg>
      ${logo('full', 'logo-full', 'Logo de Made Studio')}
      <div>
        <span class="label">Método Made</span>
        <h1>Tu negocio, medido a tu medida</h1>
        <p>Diagnóstico en 5 pilares, las 3 prioridades que más pesan y los indicadores que dicen si vas por buen camino. Mes a mes.</p>
      </div>
    </section>
    <section class="login-form">
      <form data-form="login" novalidate>
        <div><span class="label">Acceso</span><h2 style="margin-top:8px">Entra a tu espacio</h2></div>
        <label class="field"><span>Correo</span><input class="input" type="email" name="email" autocomplete="username" required placeholder="tucorreo@ejemplo.com"></label>
        <label class="field"><span>Contraseña</span><input class="input" type="password" name="password" autocomplete="current-password" required></label>
        ${err ? `<p class="err" role="alert">${esc(err)}</p>` : ''}
        <button class="btn" type="submit">Entrar</button>
      </form>
      <div class="demo">
        <span class="label">Cuentas de demostración · contraseña ${S.DEMO_PASS}</span>
        <div class="demo-list">
          ${demo.map(u => {
            const n = u.negocioId ? S.negocio(u.negocioId) : null;
            return `<button type="button" data-act="demo" data-email="${esc(u.email)}"><span><b>${esc(u.nombre)}</b> · ${u.rol === 'consultora' ? 'Consultora' : esc(n?.nombre || 'Dueño')}<br><small>${esc(u.email)}</small></span><span aria-hidden="true">→</span></button>`;
          }).join('')}
        </div>
      </div>
    </section>
  </div>`;
}

// ---------------- Panel de la consultora ----------------
function panelView(user) {
  const ns = S.datos().negocios;
  const filas = ns.map(n => ({ n, p: E.puntuaciones(n), f: E.fase(n), a: E.alertas(n), d: E.avanceDiagnostico(n) }));
  const enSeg = filas.filter(x => x.f.id.startsWith('mes') || x.f.id === 'cierre').length;
  const nAlertas = filas.reduce((s, x) => s + x.a.filter(a => a.tipo === 'alerta').length, 0);
  const conIndice = filas.filter(x => x.p.indice != null);
  const medio = conIndice.length ? Math.round(conIndice.reduce((s, x) => s + x.p.indice, 0) / conIndice.length) : null;
  const lista = filas.flatMap(x => x.a.filter(a => a.tipo !== 'info').map(a => ({ ...a, n: x.n })))
    .sort((a, b) => (a.tipo === 'alerta' ? 0 : 1) - (b.tipo === 'alerta' ? 0 : 1));
  const cartera = PILARES.map(p => {
    const vals = filas.map(x => x.p.pilares.find(y => y.id === p.id).pct).filter(v => v != null);
    return { ...p, pct: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null };
  });

  return layout(user, `
    <div class="head"><div><span class="label">Panel de la consultora</span><h1 style="margin-top:6px">Hola, ${esc(user.nombre)}</h1>
      <p class="muted">Todos tus negocios en un vistazo: en qué fase va cada uno, cómo está su Índice Made y qué necesita tu atención.</p></div>
      <a class="btn" href="#/nuevo">${ico.plus} Nuevo negocio</a></div>
    <div class="stats">
      <div class="stat"><span class="label">Negocios</span><b>${ns.length}</b></div>
      <div class="stat"><span class="label">En seguimiento</span><b>${enSeg}</b></div>
      <div class="stat"><span class="label">Alertas activas</span><b>${nAlertas}</b></div>
      <div class="stat"><span class="label">Índice Made medio</span><b>${medio ?? '—'}${medio != null ? '<small style="font-size:24px"> %</small>' : ''}</b></div>
    </div>
    <div class="cols-2-1">
      <section class="card"><div class="head" style="margin-bottom:12px"><h3>Negocios</h3></div>
        ${ns.length ? `<table class="table"><thead><tr><th>Negocio</th><th class="hide-m">Municipio</th><th>Fase del programa</th><th>Índice Made</th><th></th></tr></thead><tbody>
        ${filas.map(({ n, p, f, a }) => `<tr>
          <td class="name"><b>${esc(n.nombre)}</b><span class="muted small">${esc(n.tipo)}${a.some(x => x.tipo === 'alerta') ? ' · <span style="color:var(--coral-tx)">● ' + a.filter(x => x.tipo === 'alerta').length + ' alerta' + (a.filter(x => x.tipo === 'alerta').length > 1 ? 's' : '') + '</span>' : ''}</span></td>
          <td class="hide-m">${esc(n.municipio)}</td>
          <td class="prog"><div class="small" style="margin-bottom:6px">${esc(f.nombre)} · ${f.pct} %</div><div class="progress" role="progressbar" aria-valuenow="${f.pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Avance del programa"><i style="width:${f.pct}%"></i></div></td>
          <td>${p.indice != null ? `<b>${p.indice} %</b> ${tagNivel(p.nivel)}` : '<span class="muted">—</span>'}</td>
          <td><a class="btn sec sm" href="#/negocio/${n.id}/${f.id === 'diagnostico' ? 'diagnostico' : f.id === 'prioridades' ? 'resultados' : f.id === 'indicadores' ? 'indicadores' : 'seguimiento'}">Abrir</a></td>
        </tr>`).join('')}</tbody></table>` : `<p class="muted">Aún no hay negocios. Crea el primero.</p>`}
      </section>
      <aside class="stack">
        <section class="card crema pebble"><h3 style="margin-bottom:14px">Necesita tu atención</h3>
          ${lista.length ? `<ul class="alerts">${lista.slice(0, 8).map(a => `<li class="${a.tipo}"><span class="dot"></span><span><a href="#/negocio/${a.n.id}/${a.texto.startsWith('Diagnóstico') ? 'diagnostico' : 'seguimiento'}">${esc(a.n.nombre)}</a><br>${esc(a.texto)}</span></li>`).join('')}</ul>` : '<p class="muted">Todo en orden. Ningún negocio necesita nada ahora mismo.</p>'}
        </section>
        <section class="card pebble-b"><h3 style="margin-bottom:6px">Tu cartera por pilar</h3>
          <p class="muted small" style="margin-bottom:16px">Media de todos los negocios. Así ves dónde flojea la zona.</p>
          <div class="bars">${cartera.map(p => `<div class="bar-row"><header><span>${p.id} ${esc(p.nombre)}</span><b>${p.pct ?? '—'}${p.pct != null ? ' %' : ''}</b></header><div class="progress"><i style="width:${p.pct || 0}%"></i></div></div>`).join('')}</div>
        </section>
      </aside>
    </div>`, 'panel');
}

// ---------------- Ficha (nuevo y editar) ----------------
function fichaCampos(n = {}) {
  return `<div class="grid2">
      <label class="field"><span>Nombre del negocio</span><input class="input" name="nombre" required value="${esc(n.nombre || '')}" placeholder="Ej. Bar Kalea"></label>
      <label class="field"><span>Tipo</span><select class="input" name="tipo">${TIPOS.map(t => `<option ${n.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <label class="field"><span>Municipio</span><select class="input" name="municipio">${MUNICIPIOS.map(t => `<option ${n.municipio === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <label class="field"><span>Aforo (personas)</span><input class="input num" name="aforo" inputmode="numeric" value="${esc(n.aforo ?? '')}" placeholder="40"></label>
      <label class="field"><span>Ticket medio (€)</span><input class="input num" name="ticket" inputmode="decimal" value="${esc(n.ticket ?? '')}" placeholder="12,50"></label>
    </div>
    <fieldset class="field" style="border:0;padding:0;margin:0"><legend style="font-size:14px;font-weight:500;margin-bottom:8px">Días de apertura</legend>
      <div class="chips">${DIAS.map(d => `<label class="chip-check"><input type="checkbox" name="dias" value="${d}" ${(n.dias || []).includes(d) ? 'checked' : ''}><span>${d}</span></label>`).join('')}</div></fieldset>
    <fieldset class="field" style="border:0;padding:0;margin:0"><legend style="font-size:14px;font-weight:500;margin-bottom:8px">Canales de venta actuales</legend>
      <div class="chips">${CANALES.map(c => `<label class="chip-check"><input type="checkbox" name="canales" value="${c}" ${(n.canales || []).includes(c) ? 'checked' : ''}><span>${c}</span></label>`).join('')}</div></fieldset>`;
}

function leerFicha(form) {
  const fd = new FormData(form);
  return {
    nombre: (fd.get('nombre') || '').trim(), tipo: fd.get('tipo'), municipio: fd.get('municipio'),
    aforo: parseNum(fd.get('aforo')), ticket: parseNum(fd.get('ticket')),
    dias: fd.getAll('dias'), canales: fd.getAll('canales'),
  };
}

const passAleatoria = () => 'made-' + Math.random().toString(36).slice(2, 6);

function nuevoView(user) {
  return layout(user, `
    <a class="crumb" href="#/panel">${ico.back} Panel</a>
    <div class="head"><div><span class="label">Paso 1 · Ficha</span><h1 style="margin-top:6px">Nuevo negocio</h1>
      <p class="muted">Rellena la ficha y crea el acceso del dueño. Después empiezas el diagnóstico.</p></div></div>
    <form class="stack" data-form="nuevo" novalidate>
      <section class="card stack"><h3>Ficha del negocio</h3>${fichaCampos({ dias: ['L', 'M', 'X', 'J', 'V', 'S'] })}</section>
      <section class="card cielo stack"><h3>Acceso del dueño</h3>
        <p class="muted small">Con estos datos el dueño entra a ver su diagnóstico, sus prioridades y su evolución. Solo ve su negocio.</p>
        <div class="grid2">
          <label class="field"><span>Nombre del dueño</span><input class="input" name="duenoNombre" placeholder="Ej. Jon"></label>
          <label class="field"><span>Correo</span><input class="input" type="email" name="duenoEmail" placeholder="dueno@negocio.com"></label>
          <label class="field"><span>Contraseña inicial</span><input class="input" name="duenoPass" value="${passAleatoria()}"></label>
        </div>
      </section>
      <p class="err" data-err></p>
      <div class="btns"><button class="btn" type="submit">Crear y empezar diagnóstico</button><a class="btn sec" href="#/panel">Cancelar</a></div>
    </form>`, 'nuevo');
}

function fichaTab(n) {
  const acc = S.accesoDe(n.id);
  return `<div class="stack">
    <form class="card stack" data-form="ficha" data-id="${n.id}" novalidate><h3>Ficha del negocio</h3>${fichaCampos(n)}
      <div class="btns"><button class="btn" type="submit">Guardar ficha</button><span class="muted small">Alta: ${fecha(n.creado)}</span></div></form>
    <form class="card cielo stack" data-form="acceso" data-id="${n.id}" novalidate><h3>Acceso del dueño</h3>
      <div class="grid2">
        <label class="field"><span>Nombre</span><input class="input" name="nombre" value="${esc(acc?.nombre || '')}"></label>
        <label class="field"><span>Correo</span><input class="input" type="email" name="email" value="${esc(acc?.email || '')}"></label>
        <label class="field"><span>Nueva contraseña</span><input class="input" name="password" placeholder="Déjala vacía para no cambiarla"></label>
      </div>
      <p class="err" data-err></p>
      <div class="btns"><button class="btn sec" type="submit">Guardar acceso</button><a class="btn ghost" href="#/vista-dueno/${n.id}">${ico.eye} Ver como dueño</a></div>
    </form>
    <section class="card crema"><div class="btns" style="justify-content:space-between"><span class="small muted">Eliminar el negocio borra su diagnóstico, indicadores y el acceso del dueño.</span>
      <button class="btn sec sm" data-act="eliminar" data-id="${n.id}">${ui.confirmar === 'eliminar-' + n.id ? '¿Seguro? Pulsa otra vez' : 'Eliminar negocio'}</button></div></section>
  </div>`;
}

// ---------------- Diagnóstico ----------------
function idxInicial(n) {
  const r = n.respuestas || {};
  const i = PREGUNTAS.findIndex(q => !E.respondida(r[q.id]));
  return i === -1 ? 0 : i;
}

function diagTab(n, modo = 'consultora') {
  const r = n.respuestas || {};
  if (ui.q[n.id] === undefined) ui.q[n.id] = idxInicial(n);
  const i = ui.q[n.id], q = PREGUNTAS[i], p = pilar(q.p);
  const av = E.avanceDiagnostico(n);
  const v = r[q.id];
  const sel = x => (x === null ? v === 'na' : v === x);
  const fin = av.completo ? `<div class="notice" style="margin-top:20px"><b>Diagnóstico completo.</b> ${modo === 'consultora'
    ? `<a href="#/negocio/${n.id}/resultados">Ver resultados y prioridades →</a>`
    : `<a href="#/mi-negocio">Volver a mi negocio →</a>`}</div>` : '';
  return `<div class="diag">
    <aside class="card pillars"><h4>Los 5 pilares</h4>
      ${PILARES.map(pp => {
        const qs = PREGUNTAS.filter(x => x.p === pp.id);
        const h = qs.filter(x => E.respondida(r[x.id])).length;
        return `<button data-act="pilar" data-id="${n.id}" data-p="${pp.id}" class="${pp.id === q.p ? 'on' : ''}"><span>${pp.id} ${esc(pp.nombre)}</span><small>${h}/${qs.length}</small></button>`;
      }).join('')}
      <hr class="seam"><p class="small muted" style="padding:0 6px">${av.hechas} de ${av.total} respondidas</p>
    </aside>
    <section class="card q-card">
      <span class="q-meta">${q.id} · ${esc(p.nombre)}</span>
      <p class="q-text">${esc(q.texto)}</p>
      <div class="evid">${ico.info}<span><b>Para puntuar 2, pide que te enseñen:</b> ${esc(q.evidencia)} Si no puede mostrarlo, es 1.</span></div>
      <div class="opts" role="radiogroup" aria-label="Respuesta">
        ${ESCALA.map(o => `<button class="opt ${sel(o.v) ? 'on' : ''}" role="radio" aria-checked="${sel(o.v)}" data-act="resp" data-id="${n.id}" data-q="${q.id}" data-v="${o.v === null ? 'na' : o.v}"><b>${o.t}</b><span>${o.l}</span></button>`).join('')}
      </div>
      <div class="btns" style="justify-content:space-between">
        <button class="btn sec" data-act="qnav" data-id="${n.id}" data-to="${i - 1}" ${i === 0 ? 'disabled' : ''}>Anterior</button>
        ${i < PREGUNTAS.length - 1 ? `<button class="btn" data-act="qnav" data-id="${n.id}" data-to="${i + 1}">Siguiente pregunta</button>`
          : modo === 'consultora' ? `<a class="btn" href="#/negocio/${n.id}/resultados">Ver resultados</a>` : `<a class="btn" href="#/mi-negocio">Terminar</a>`}
      </div>
      <div class="qnums" aria-label="Ir a la pregunta">${PREGUNTAS.map((x, j) => `<button data-act="qnav" data-id="${n.id}" data-to="${j}" class="${E.respondida(r[x.id]) ? 'done' : ''} ${j === i ? 'cur' : ''}" aria-label="Pregunta ${j + 1}${E.respondida(r[x.id]) ? ', respondida' : ''}">${j + 1}</button>`).join('')}</div>
      ${fin}
    </section>
  </div>`;
}

// ---------------- Resultados y prioridades ----------------
function pilaresBars(p) {
  return `<div class="bars">${p.pilares.map(x => `<div class="bar-row ${x.bloqueado ? 'bloq' : ''}"><header><span><b>${x.id}</b> ${esc(x.nombre)}</span><span><b>${x.pct ?? '—'}${x.pct != null ? ' %' : ''}</b> ${x.pct != null ? tagNivel(x.nivel) : ''}</span></header><div class="progress"><i style="width:${x.pct || 0}%"></i></div></div>`).join('')}</div>`;
}

function indiceCard(p, av, extra = '') {
  return `<section class="card tinta pebble index-card">
    <span class="label" style="color:var(--mantequilla)">Índice Made</span>
    <div class="index-num">${anillo(p.indice)}<b>${p.indice ?? '—'}<small>${p.indice != null ? ' %' : ''}</small></b></div>
    <div>Nivel: <b>${esc(p.nivel.nombre)}</b></div>
    <p class="small" style="opacity:.8">${av.hechas} de ${av.total} preguntas respondidas</p>${extra}
  </section>`;
}

function resultadosTab(n) {
  const av = E.avanceDiagnostico(n);
  if (!av.hechas) return `<div class="card crema"><h3>Aún no hay resultados</h3><p class="muted" style="margin:8px 0 16px">Empieza el diagnóstico para calcular el Índice Made.</p><a class="btn" href="#/negocio/${n.id}/diagnostico">Empezar diagnóstico</a></div>`;
  const p = E.puntuaciones(n);
  const conf = !!n.prioridades?.confirmadas;
  const ids = E.prioridadesActuales(n);
  const cands = E.candidatas(n);
  const propuestas = E.prioridadesPropuestas(n);
  const ajustada = !conf && ids.join() !== propuestas.join();
  return `<div class="stack">
    <div class="row" style="grid-template-columns:minmax(0,.8fr) minmax(0,1.4fr) minmax(0,1fr)">
      ${indiceCard(p, av)}
      <section class="card"><h3 style="margin-bottom:18px">Puntuación por pilar</h3>${pilaresBars(p)}
        ${p.bloqueoDigital && av.hechas ? `<div class="notice" style="margin-top:18px"><b>Línea digital bloqueada</b> hasta que Caja clara llegue al ${E.UMBRAL_CAJA} %. No traemos clientes a un negocio que pierde dinero en caja.</div>` : ''}
      </section>
      <section class="card crema" style="display:grid;place-items:center">${radar(p.pilares)}</section>
    </div>
    ${!av.completo ? `<div class="notice">Faltan ${av.total - av.hechas} preguntas. Los resultados son provisionales. <a href="#/negocio/${n.id}/diagnostico">Terminar diagnóstico →</a></div>` : ''}
    <section>
      <div class="head" style="margin-bottom:12px"><div><h2>Las 3 prioridades ${conf ? 'confirmadas' : 'propuestas'}</h2>
        <p class="muted small">Puntuación = 2 × impacto + urgencia + viabilidad + sostenibilidad + bono de cimientos (+2 en Caja y Producto). Solo entran preguntas con 0 o 1 y pilares no bloqueados.</p></div>
        ${conf ? `<span class="tag ok">Confirmadas el ${fecha(n.prioridades.fecha)}</span>` : ''}</div>
      ${ids.length ? `<div class="prios">${ids.map((id, k) => {
        const q = pregunta(id), c = cands.find(x => x.q.id === id) || { total: E.puntuarPregunta(q).total, bono: E.puntuarPregunta(q).bono };
        const otras = cands.filter(x => !ids.includes(x.q.id));
        return `<article class="prio"><span class="n">${k + 1}. ${q.id} · ${esc(pilar(q.p).nombre)} · ${c.total} pts</span>
          <h4>${esc(q.texto)}</h4><p>${esc(q.problema)}</p>
          <p class="score">Impacto ${q.imp}, urgencia ${q.urg}, viabilidad ${q.via}, sostenibilidad ${q.sos}${c.bono ? ', bono de cimientos +2' : ''}. Protocolo ${q.prot}: ${esc(PROTOCOLOS[q.prot].nombre)}.</p>
          ${!conf && otras.length ? `<label class="field"><span class="small muted">Cambiar por otra</span><select class="input" data-act="cambiar-prio" data-id="${n.id}" data-k="${k}"><option value="">Mantener esta</option>${otras.map(o => `<option value="${o.q.id}">${o.q.id} · ${o.total} pts · ${esc(o.q.texto)}</option>`).join('')}</select></label>` : ''}
        </article>`;
      }).join('')}</div>` : `<div class="card cielo"><p>No hay preguntas con 0 o 1 fuera de los pilares bloqueados. ¡Este negocio está en muy buena forma!</p></div>`}
      <div class="btns" style="margin-top:20px">
        ${conf ? `<a class="btn" href="#/negocio/${n.id}/indicadores">Ir a indicadores</a><button class="btn sec" data-act="desconfirmar" data-id="${n.id}">Ajustar prioridades</button>`
          : `<button class="btn" data-act="confirmar-prio" data-id="${n.id}" ${!av.completo || !ids.length ? 'disabled' : ''}>Confirmar prioridades y elegir indicadores</button>
             ${ajustada ? `<button class="btn sec" data-act="restaurar-prio" data-id="${n.id}">Volver a la propuesta</button>` : ''}
             <a class="btn ghost" href="#/negocio/${n.id}/diagnostico">Revisar respuestas</a>`}
      </div>
    </section>
  </div>`;
}

// ---------------- Indicadores ----------------
function indicadoresTab(n) {
  if (!n.prioridades?.confirmadas) return `<div class="card crema"><h3>Primero, las prioridades</h3><p class="muted" style="margin:8px 0 16px">Los indicadores salen de las 3 prioridades confirmadas.</p><a class="btn" href="#/negocio/${n.id}/resultados">Ver prioridades</a></div>`;
  const sug = E.kpisSugeridos(n.prioridades.ids);
  if (!n.seguimiento) { S.actualizar(n.id, x => { x.seguimiento = { confirmado: false, kpis: sug.map(id => ({ id, base: null, objetivo: null })) }; }); }
  const sel = n.seguimiento.kpis;
  const selIds = sel.map(s => s.id);
  const listos = sel.length >= 3 && sel.length <= 6 && sel.every(s => E.valorDef(s.base) && E.valorDef(s.objetivo));
  const op = k => `<label class="kpi-opt"><input type="checkbox" data-act="kpi-toggle" data-id="${n.id}" data-k="${k.id}" ${selIds.includes(k.id) ? 'checked' : ''} ${!selIds.includes(k.id) && sel.length >= 6 ? 'disabled' : ''}>
    <span><b>${esc(k.nombre)}</b> <span class="muted small">(${k.unidad})</span>${sug.includes(k.id) ? '<span class="sug">Sugerido</span>' : ''}<small>${esc(k.formula)} · ${k.dir === 'up' ? 'mejora si sube' : 'mejora si baja'}${k.impl ? ' · requiere implantación' : ''}</small></span></label>`;
  return `<div class="stack">
    <section class="card mant pebble"><div class="head" style="margin:0"><div><h3>Indicadores del programa</h3>
      <p class="muted">Elige entre 3 y 6 indicadores del banco de ${KPIS.length}. Para cada uno, apunta el valor de hoy y el objetivo a 90 días.</p></div>
      ${n.seguimiento.confirmado ? `<span class="tag ok">Seguimiento desde ${E.nombreMes(n.seguimiento.inicio, 1)}</span>` : ''}</div></section>
    <section class="card"><h3 style="margin-bottom:6px">Seleccionados (${sel.length} de 6)</h3>
      <p class="muted small" style="margin-bottom:16px">Puedes escribir con coma o punto decimal.</p>
      ${sel.length ? `<div class="stack">${sel.map(s => { const k = kpi(s.id); return `<div class="grid2" style="align-items:end;border-top:1px dashed var(--linea);padding-top:14px">
        <div><b>${esc(k.nombre)}</b><br><span class="small muted">${esc(k.formula)}</span></div>
        <div class="grid2" style="gap:10px">
          <label class="field"><span class="small">Valor inicial (${k.unidad})</span><input class="input num" inputmode="decimal" data-act="kpi-val" data-id="${n.id}" data-k="${k.id}" data-f="base" value="${E.valorDef(s.base) ? String(s.base).replace('.', ',') : ''}"></label>
          <label class="field"><span class="small">Objetivo 90 días (${k.unidad})</span><input class="input num" inputmode="decimal" data-act="kpi-val" data-id="${n.id}" data-k="${k.id}" data-f="objetivo" value="${E.valorDef(s.objetivo) ? String(s.objetivo).replace('.', ',') : ''}"></label>
        </div></div>`; }).join('')}</div>` : '<p class="muted">Marca indicadores en el banco de abajo.</p>'}
      <div class="btns" style="margin-top:20px">
        ${n.seguimiento.confirmado ? `<a class="btn" href="#/negocio/${n.id}/seguimiento">Ir al seguimiento</a><span class="small muted">Los cambios se guardan solos.</span>`
          : `<button class="btn" data-act="confirmar-kpi" data-id="${n.id}" ${listos ? '' : 'disabled'}>Empezar seguimiento de 90 días</button><span class="small muted">${listos ? '' : 'Necesitas entre 3 y 6 indicadores con valor inicial y objetivo.'}</span>`}
      </div>
    </section>
    <section class="card kpi-bank"><h3>Banco de indicadores</h3>
      ${PILARES.map(p => `<div><h4>${p.id} · ${esc(p.nombre)}</h4><div class="kpi-list">${KPIS.filter(k => k.p === p.id).map(op).join('')}</div></div>`).join('')}
    </section>
  </div>`;
}

// ---------------- Seguimiento ----------------
function kpiCard(n, s, editable) {
  const k = kpi(s.id), vals = E.valoresKpi(n, s.id);
  const serie = [s.base, ...vals];
  const t = E.tendencia(k, serie);
  const actual = [...vals].reverse().find(E.valorDef);
  const cum = E.cumplimiento(k, s.base, s.objetivo, actual);
  const celda = (m) => editable
    ? `<label>Mes ${m}<input class="input num" inputmode="decimal" aria-label="${esc(k.nombre)} mes ${m}" data-act="mes-val" data-id="${n.id}" data-k="${k.id}" data-m="${m}" value="${E.valorDef(vals[m - 1]) ? String(vals[m - 1]).replace('.', ',') : ''}"></label>`
    : `<label>Mes ${m}<span class="fixed">${E.fmt(vals[m - 1], k.unidad)}</span></label>`;
  return `<article class="card kpi-card">
    <header><div><h4>${esc(k.nombre)}</h4><p class="formula">${esc(k.formula)} · ${k.dir === 'up' ? 'mejora si sube' : 'mejora si baja'}</p></div>
      ${t ? `<span class="tag ${t === 'mejora' ? 'ok' : t === 'empeora' ? 'alerta' : ''}">${t === 'mejora' ? '↗ Mejora' : t === 'empeora' ? '↘ Empeora' : '→ Igual'}</span>` : ''}</header>
    <div class="kpi-range"><span>Base <b>${E.fmt(s.base, k.unidad)}</b></span><span aria-hidden="true">→</span><span>Objetivo 90 días <b>${E.fmt(s.objetivo, k.unidad)}</b></span></div>
    <div class="month-grid">${celda(1)}${celda(2)}${celda(3)}</div>
    ${lineaKpi(k, s.base, s.objetivo, vals)}
    ${cum != null ? `<div><div class="small" style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Avance hacia el objetivo</span><b>${cum} %</b></div><div class="progress"><i style="width:${Math.max(0, Math.min(100, cum))}%"></i></div></div>` : ''}
  </article>`;
}

function seguimientoTab(n) {
  if (!n.seguimiento?.confirmado) return `<div class="card crema"><h3>El seguimiento aún no ha empezado</h3><p class="muted" style="margin:8px 0 16px">Primero elige los indicadores con su valor inicial y su objetivo.</p><a class="btn" href="#/negocio/${n.id}/indicadores">Elegir indicadores</a></div>`;
  const al = E.alertas(n).filter(a => a.tipo !== 'info');
  const pend = E.mesPendiente(n);
  return `<div class="stack">
    <section class="card mant pebble"><div class="head" style="margin:0"><div><h3>Seguimiento mensual</h3>
      <p class="muted">Empezó en ${E.nombreMes(n.seguimiento.inicio, 1)}. Registra cada mes el valor de cada indicador. Si uno empeora dos meses seguidos, salta una alerta.</p></div>
      ${pend ? `<span class="tag aviso">Toca registrar el mes ${pend} · ${E.nombreMes(n.seguimiento.inicio, pend)}</span>` : '<span class="tag ok">Programa de 90 días completado</span>'}</div></section>
    ${al.length ? `<ul class="alerts">${al.map(a => `<li class="${a.tipo}"><span class="dot"></span><span>${esc(a.texto)}</span></li>`).join('')}</ul>` : ''}
    <div class="kpi-cards">${n.seguimiento.kpis.map(s => kpiCard(n, s, true)).join('')}</div>
  </div>`;
}

// ---------------- Vista de negocio (consultora) ----------------
const TABS = [['ficha', 'Ficha'], ['diagnostico', 'Diagnóstico'], ['resultados', 'Resultados'], ['indicadores', 'Indicadores'], ['seguimiento', 'Seguimiento']];

function pasos(n) {
  const f = E.fase(n);
  const orden = ['ficha', 'diagnostico', 'prioridades', 'indicadores', 'mes1', 'mes2', 'mes3', 'cierre'];
  const nombres = { ficha: 'Ficha', diagnostico: 'Diagnóstico', prioridades: 'Prioridades', indicadores: 'Indicadores', mes1: 'Mes 1', mes2: 'Mes 2', mes3: 'Mes 3', cierre: '90 días' };
  const pos = orden.indexOf(f.id);
  return `<ol class="steps" aria-label="Fases del programa"><li class="lbl">Programa</li>${orden.map((id, i) => `<li class="${i < pos || f.id === 'cierre' ? 'done' : i === pos ? 'now' : ''}">${nombres[id]}</li>`).join('')}</ol>`;
}

function negocioView(user, id, tab) {
  const n = S.negocio(id);
  if (!n) return layout(user, `<div class="card crema"><h3>No encontramos ese negocio</h3><p style="margin-top:12px"><a href="#/panel">Volver al panel</a></p></div>`);
  const p = E.puntuaciones(n), f = E.fase(n);
  const cuerpo = { ficha: fichaTab, diagnostico: diagTab, resultados: resultadosTab, indicadores: indicadoresTab, seguimiento: seguimientoTab }[tab] || resultadosTab;
  return layout(user, `
    <a class="crumb" href="#/panel">${ico.back} Panel</a>
    <div class="biz-head"><div><span class="label">${esc(n.tipo)} · ${esc(n.municipio)}${n.aforo ? ' · ' + n.aforo + ' personas' : ''}${n.ticket ? ' · ticket ' + E.fmt(n.ticket, '€') : ''}</span>
      <h1 style="margin-top:6px">${esc(n.nombre)}</h1></div>
      <div class="btns">${p.indice != null ? `<span class="tag ${p.nivel.id}" style="font-size:15px;padding:8px 16px">Índice Made ${p.indice} % · ${esc(p.nivel.nombre)}</span>` : ''}
        <a class="btn sec sm" href="#/vista-dueno/${n.id}">${ico.eye} Vista del dueño</a><a class="btn soft sm" href="#/informe/${n.id}">${ico.doc} Informe</a></div></div>
    ${pasos(n)}
    <nav class="tabs" aria-label="Secciones del negocio">${TABS.map(([t, l]) => `<a href="#/negocio/${n.id}/${t}" ${t === tab ? 'aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
    ${cuerpo(n)}`, 'panel');
}

// ---------------- Vista del dueño ----------------
function duenoView(user, n, preview = false) {
  const p = E.puntuaciones(n), av = E.avanceDiagnostico(n);
  const conf = n.prioridades?.confirmadas;
  const pend = E.mesPendiente(n);
  const nombre = preview ? (S.accesoDe(n.id)?.nombre || 'equipo') : user.nombre;
  const acciones = conf ? E.accionesDe(n.prioridades.ids) : [];
  const diagHref = preview ? `#/negocio/${n.id}/diagnostico` : '#/mi-negocio/diagnostico';
  const body = `
    ${preview ? `<div class="notice" style="margin-bottom:20px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><span>${ico.eye} Estás viendo lo que ve el dueño de <b>${esc(n.nombre)}</b>.</span><a href="#/negocio/${n.id}/resultados">Volver a la ficha de la consultora →</a></div>` : ''}
    <section class="owner-hero" style="margin-bottom:28px">
      ${indiceCard(p, av)}
      <div><span class="label">${esc(n.nombre)}</span><h1 style="margin-top:6px">Hola, ${esc(nombre)}</h1>
        <p class="muted" style="margin-top:10px;max-width:56ch">${p.indice == null ? 'Empieza tu diagnóstico: son 24 preguntas sencillas sobre caja, producto, equipo, redes y WhatsApp.'
          : `Tu Índice Made está en <b>${p.indice} %</b>. ${conf ? 'Ya tienes tus 3 prioridades. Céntrate en ellas estos 90 días y apunta tus datos cada mes.' : 'Tu consultora está preparando tus 3 prioridades.'}`}</p>
        ${!av.completo ? `<div class="btns" style="margin-top:18px"><a class="btn" href="${diagHref}">${av.hechas ? 'Seguir con el diagnóstico' : 'Empezar diagnóstico'} (${av.hechas}/${av.total})</a></div>` : ''}
      </div>
    </section>
    <div class="cols-2-1 owner-cols">
      <div class="stack">
        ${conf ? `<section class="card"><h3 style="margin-bottom:16px">Tus 3 prioridades</h3><div class="stack">${acciones.map((a, k) => `<div class="${k ? '' : ''}" style="${k ? 'border-top:1px dashed var(--linea);padding-top:16px' : ''}">
            <span class="small muted">${k + 1} · ${esc(pilar(a.q.p).nombre)}</span><h4 style="font-size:17px;margin:4px 0 8px">${esc(a.q.problema)}</h4>
            <ul class="action-list">${a.acciones.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div></section>` : ''}
        ${n.seguimiento?.confirmado ? `<section><h2 style="margin-bottom:16px">Tu evolución</h2><div class="kpi-cards">${n.seguimiento.kpis.map(s => kpiCard(n, s, false)).join('')}</div></section>` : ''}
      </div>
      <aside class="stack">
        ${n.seguimiento?.confirmado ? (pend ? `<form class="card mant pebble stack" data-form="dato-mes" data-id="${n.id}" data-m="${pend}"><div><span class="label">Dato del mes</span><h3 style="margin-top:6px">Mes ${pend} · ${E.nombreMes(n.seguimiento.inicio, pend)}</h3></div>
            ${n.seguimiento.kpis.map(s => { const k = kpi(s.id), v = E.valoresKpi(n, s.id)[pend - 1]; return `<label class="field"><span class="small">${esc(k.nombre)} (${k.unidad})</span><input class="input num" inputmode="decimal" name="${k.id}" value="${E.valorDef(v) ? String(v).replace('.', ',') : ''}" placeholder="${E.fmt(s.base, k.unidad)} al empezar"></label>`; }).join('')}
            <button class="btn" type="submit">Guardar datos del mes</button></form>`
          : `<section class="card cielo pebble"><h3>Todo al día</h3><p class="muted" style="margin-top:8px">Completaste los 3 meses del programa. Revisa tu informe con tu consultora.</p></section>`) : ''}
        <section class="card pebble-b"><h3 style="margin-bottom:16px">Tus 5 pilares</h3>${pilaresBars(p)}</section>
        <a class="btn soft" href="#/informe/${n.id}">${ico.doc} Ver mi informe</a>
      </aside>
    </div>`;
  return layout(user, body, preview ? 'panel' : 'mi');
}

// ---------------- Informe ----------------
function informeView(user, n) {
  const p = E.puntuaciones(n), av = E.avanceDiagnostico(n);
  const conf = n.prioridades?.confirmadas;
  const ids = conf ? n.prioridades.ids : E.prioridadesActuales(n);
  const acc = E.accionesDe(ids);
  const seg = n.seguimiento?.confirmado ? n.seguimiento : null;
  const pend = E.mesPendiente(n);
  const al = E.alertas(n).filter(a => a.tipo !== 'info');
  const back = user.rol === 'consultora' ? `#/negocio/${n.id}/seguimiento` : '#/mi-negocio';
  return layout(user, `<div class="report">
    <div class="btns no-print" style="justify-content:space-between"><a class="crumb" href="${back}" style="margin:0">${ico.back} Volver</a><button class="btn" data-act="imprimir">${ico.doc} Descargar PDF</button></div>
    <header class="report-head"><div><span class="label">Informe para el cliente · ${fecha(new Date().toISOString())}</span><h1 style="margin-top:6px;font-size:clamp(36px,5vw,52px)">${esc(n.nombre)}</h1>
      <p class="muted">${esc(n.tipo)} · ${esc(n.municipio)} · Fase: ${esc(E.fase(n).nombre)}</p></div>${logo('full', 'logo-full')}</header>
    <div class="row" style="grid-template-columns:minmax(0,.8fr) minmax(0,1.3fr)">
      ${indiceCard(p, av)}
      <section class="card"><h3 style="margin-bottom:16px">Los 5 pilares</h3>${pilaresBars(p)}</section>
    </div>
    <section class="card"><h3 style="margin-bottom:6px">Prioridades ${conf ? '' : '(propuesta)'}</h3><p class="muted small" style="margin-bottom:16px">Los tres problemas que más pesan hoy en el negocio y el protocolo para resolverlos.</p>
      <table><thead><tr><th>#</th><th>Problema</th><th>Pilar</th><th>Protocolo</th></tr></thead><tbody>
      ${acc.map((a, k) => `<tr><td>${k + 1}</td><td><b>${esc(a.q.problema)}</b><br><span class="muted small">${esc(a.q.texto)}</span></td><td>${esc(pilar(a.q.p).nombre)}</td><td>${a.prot}<br><span class="muted small">${esc(a.nombre)}</span></td></tr>`).join('')}
      </tbody></table></section>
    ${seg ? `<section class="card"><h3 style="margin-bottom:6px">Evolución de los indicadores</h3><p class="muted small" style="margin-bottom:16px">Desde ${E.nombreMes(seg.inicio, 1)}. Objetivo a 90 días.</p>
      <table><thead><tr><th>Indicador</th><th class="r">Base</th><th class="r">Mes 1</th><th class="r">Mes 2</th><th class="r">Mes 3</th><th class="r">Objetivo</th><th class="r">Avance</th></tr></thead><tbody>
      ${seg.kpis.map(s => { const k = kpi(s.id), v = E.valoresKpi(n, s.id); const act = [...v].reverse().find(E.valorDef); const c = E.cumplimiento(k, s.base, s.objetivo, act);
        return `<tr><td><b>${esc(k.nombre)}</b></td><td class="r">${E.fmt(s.base, k.unidad)}</td>${v.map(x => `<td class="r">${E.fmt(x, k.unidad)}</td>`).join('')}<td class="r">${E.fmt(s.objetivo, k.unidad)}</td><td class="r"><b>${c != null ? c + ' %' : '—'}</b></td></tr>`; }).join('')}
      </tbody></table>
      <div class="mini" style="margin-top:20px">${seg.kpis.map(s => { const k = kpi(s.id); return `<div><h4>${esc(k.nombre)}</h4>${lineaKpi(k, s.base, s.objetivo, E.valoresKpi(n, s.id))}</div>`; }).join('')}</div>
    </section>` : ''}
    <section class="card mant pebble"><h3 style="margin-bottom:14px">Próximas acciones</h3>
      <ul class="action-list">
        ${pend && seg ? `<li>Registrar los datos del mes ${pend} (${E.nombreMes(seg.inicio, pend)}).</li>` : ''}
        ${!av.completo ? `<li>Terminar el diagnóstico (${av.hechas} de ${av.total} preguntas).</li>` : ''}
        ${al.filter(a => !a.texto.startsWith('Falta el dato')).map(a => `<li>Revisar: ${esc(a.texto.charAt(0).toLowerCase() + a.texto.slice(1))}.</li>`).join('')}
        ${acc.flatMap(a => a.acciones.slice(0, 1)).map(x => `<li>${esc(x)}</li>`).join('')}
      </ul></section>
    <p class="small muted" style="text-align:center">Método Made · Made Studio · made for you · Prototipo con datos ficticios</p>
  </div>`, 'informe');
}

// ---------------- Enrutado ----------------
function render() {
  const user = S.sesion();
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  ui.confirmar = ui.confirmarKeep ? ui.confirmar : null; ui.confirmarKeep = false;
  if (!user) { if (parts[0] !== 'login') history.replaceState(null, '', '#/login'); $app.innerHTML = loginView(); document.title = 'Entrar · Made'; return; }
  const [r, a, b] = parts;
  let html, title = 'Made · Método';
  if (user.rol === 'consultora') {
    if (r === 'negocio' && a) { html = negocioView(user, a, b || 'resultados'); title = (S.negocio(a)?.nombre || 'Negocio') + ' · Made'; }
    else if (r === 'nuevo') { html = nuevoView(user); title = 'Nuevo negocio · Made'; }
    else if (r === 'informe' && S.negocio(a)) { html = informeView(user, S.negocio(a)); title = 'Informe ' + S.negocio(a).nombre + ' · Made'; }
    else if (r === 'vista-dueno' && S.negocio(a)) { html = duenoView(user, S.negocio(a), true); title = 'Vista del dueño · Made'; }
    else { if (r !== 'panel') history.replaceState(null, '', '#/panel'); html = panelView(user); title = 'Panel · Made'; }
  } else {
    const n = S.negocio(user.negocioId);
    if (!n) { html = layout(user, '<div class="card crema"><h3>Tu negocio ya no está disponible</h3><p class="muted" style="margin-top:8px">Habla con tu consultora.</p></div>'); }
    else if (r === 'mi-negocio' && a === 'diagnostico') { html = layout(user, `<div class="head"><div><span class="label">${esc(n.nombre)}</span><h1 style="margin-top:6px">Tu diagnóstico</h1><p class="muted">Responde con sinceridad. Si algo no lo puedes enseñar, marca 1.</p></div></div>${diagTab(n, 'dueno')}`, 'diag'); title = 'Diagnóstico · Made'; }
    else if (r === 'informe') { html = informeView(user, n); title = 'Mi informe · Made'; }
    else { if (r !== 'mi-negocio') history.replaceState(null, '', '#/mi-negocio'); html = duenoView(user, n); title = n.nombre + ' · Made'; }
  }
  $app.innerHTML = html;
  document.title = title;
}

// ---------------- Acciones ----------------
document.addEventListener('click', async ev => {
  const el = ev.target.closest('[data-act]');
  if (!el || el.tagName === 'SELECT' || el.tagName === 'INPUT') return;
  const act = el.dataset.act, id = el.dataset.id;
  switch (act) {
    case 'demo': {
      const f = document.querySelector('[data-form="login"]');
      f.email.value = el.dataset.email; f.password.value = S.DEMO_PASS; f.requestSubmit(); break;
    }
    case 'salir': S.salir(); go('#/login'); break;
    case 'reset':
      if (ui.confirmar === 'reset') { await S.restablecer(); ui.q = {}; S.salir(); toast('Datos de ejemplo restablecidos'); go('#/login'); }
      else { ui.confirmar = 'reset'; ui.confirmarKeep = true; render(); }
      break;
    case 'eliminar':
      if (ui.confirmar === 'eliminar-' + id) { S.eliminarNegocio(id); toast('Negocio eliminado'); go('#/panel'); }
      else { ui.confirmar = 'eliminar-' + id; ui.confirmarKeep = true; render(); }
      break;
    case 'pilar': {
      const n = S.negocio(id), r = n.respuestas || {};
      const qs = PREGUNTAS.map((q, i) => ({ q, i })).filter(x => x.q.p === el.dataset.p);
      ui.q[id] = (qs.find(x => !E.respondida(r[x.q.id])) || qs[0]).i; render(); break;
    }
    case 'qnav': ui.q[id] = Math.max(0, Math.min(PREGUNTAS.length - 1, Number(el.dataset.to))); render(); break;
    case 'resp': {
      const v = el.dataset.v === 'na' ? 'na' : Number(el.dataset.v);
      S.actualizar(id, n => {
        n.respuestas = { ...(n.respuestas || {}), [el.dataset.q]: v };
        if (n.prioridades && !n.prioridades.confirmadas) n.prioridades.ids = []; // la propuesta se recalcula
      });
      const i = ui.q[id];
      setTimeout(() => { if (i < PREGUNTAS.length - 1) ui.q[id] = i + 1; render(); }, 180);
      el.closest('.opts').querySelectorAll('.opt').forEach(o => o.classList.toggle('on', o === el));
      break;
    }
    case 'confirmar-prio':
      S.actualizar(id, n => { n.prioridades = { ids: E.prioridadesActuales(n), confirmadas: true, fecha: new Date().toISOString() }; });
      toast('Prioridades confirmadas'); go(`#/negocio/${id}/indicadores`); break;
    case 'desconfirmar':
      S.actualizar(id, n => { n.prioridades.confirmadas = false; }); render(); break;
    case 'restaurar-prio':
      S.actualizar(id, n => { n.prioridades = { ids: [], confirmadas: false }; }); render(); break;
    case 'confirmar-kpi':
      S.actualizar(id, n => {
        const d = new Date(); d.setDate(1); d.setHours(12, 0, 0, 0);
        n.seguimiento.confirmado = true; n.seguimiento.inicio = n.seguimiento.inicio || d.toISOString();
        n.valores = n.valores || {};
      });
      toast('Seguimiento de 90 días en marcha'); go(`#/negocio/${id}/seguimiento`); break;
    case 'imprimir': window.print(); break;
  }
});

document.addEventListener('change', ev => {
  const el = ev.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act, id = el.dataset.id;
  if (act === 'cambiar-prio' && el.value) {
    S.actualizar(id, n => { const ids = [...E.prioridadesActuales(n)]; ids[Number(el.dataset.k)] = el.value; n.prioridades = { ids, confirmadas: false }; });
    render();
  } else if (act === 'kpi-toggle') {
    S.actualizar(id, n => {
      const ks = n.seguimiento.kpis;
      if (el.checked) { if (ks.length < 6 && !ks.some(s => s.id === el.dataset.k)) ks.push({ id: el.dataset.k, base: null, objetivo: null }); }
      else n.seguimiento.kpis = ks.filter(s => s.id !== el.dataset.k);
    });
    render();
  } else if (act === 'kpi-val') {
    S.actualizar(id, n => { const s = n.seguimiento.kpis.find(x => x.id === el.dataset.k); s[el.dataset.f] = parseNum(el.value); });
    const y = window.scrollY; render(); window.scrollTo(0, y);
  } else if (act === 'mes-val') {
    S.actualizar(id, n => { n.valores = n.valores || {}; const arr = [...E.valoresKpi(n, el.dataset.k)]; arr[Number(el.dataset.m) - 1] = parseNum(el.value); n.valores[el.dataset.k] = arr; });
    const y = window.scrollY; render(); window.scrollTo(0, y); toast('Dato guardado');
  }
});

document.addEventListener('submit', async ev => {
  const f = ev.target.closest('[data-form]');
  if (!f) return;
  ev.preventDefault();
  const tipo = f.dataset.form;
  if (tipo === 'login') {
    const u = await S.entrar(f.email.value, f.password.value);
    if (!u) { $app.innerHTML = loginView('Correo o contraseña incorrectos.'); return; }
    go(u.rol === 'consultora' ? '#/panel' : '#/mi-negocio');
  } else if (tipo === 'nuevo') {
    const ficha = leerFicha(f), fd = new FormData(f), err = f.querySelector('[data-err]');
    if (!ficha.nombre) { err.textContent = 'Escribe el nombre del negocio.'; f.nombre.focus(); return; }
    const email = (fd.get('duenoEmail') || '').trim().toLowerCase();
    if (email && S.datos().usuarios.some(u => u.email === email)) { err.textContent = 'Ese correo ya tiene acceso. Usa otro.'; return; }
    const n = await S.crearNegocio(ficha, email ? { email, nombre: fd.get('duenoNombre') || 'Dueño', password: fd.get('duenoPass') || passAleatoria() } : null);
    toast(email ? `Negocio creado. Acceso del dueño: ${email}` : 'Negocio creado');
    ui.q[n.id] = 0; go(`#/negocio/${n.id}/diagnostico`);
  } else if (tipo === 'ficha') {
    const ficha = leerFicha(f);
    if (!ficha.nombre) { toast('El nombre no puede quedar vacío'); return; }
    S.actualizar(f.dataset.id, n => Object.assign(n, ficha)); toast('Ficha guardada'); render();
  } else if (tipo === 'acceso') {
    const fd = new FormData(f), err = f.querySelector('[data-err]');
    const email = (fd.get('email') || '').trim();
    if (!email.includes('@')) { err.textContent = 'Escribe un correo válido.'; return; }
    const ok = await S.cambiarAcceso(f.dataset.id, email, fd.get('nombre') || 'Dueño', fd.get('password'));
    if (!ok) { err.textContent = 'Ese correo ya lo usa otro negocio.'; return; }
    toast('Acceso del dueño guardado'); render();
  } else if (tipo === 'dato-mes') {
    const m = Number(f.dataset.m), fd = new FormData(f);
    S.actualizar(f.dataset.id, n => {
      n.valores = n.valores || {};
      n.seguimiento.kpis.forEach(s => { const arr = [...E.valoresKpi(n, s.id)]; const v = parseNum(fd.get(s.id)); if (v !== null) arr[m - 1] = v; n.valores[s.id] = arr; });
    });
    toast('¡Gracias! Datos del mes guardados'); render(); window.scrollTo(0, 0);
  }
});

window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

(async () => {
  await S.cargar();
  render();
})();
