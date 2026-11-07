// Plataforma de diagnóstico y seguimiento para pequeña hostelería — prototipo (sin dependencias, enrutado por #hash)
import * as S from './store.js';
import * as E from './engine.js';
import { PILARES, PREGUNTAS, KPIS, ESCALA, PROTOCOLOS, TIPOS, MUNICIPIOS, DIAS, CANALES, RANGOS_VENTAS, REDES_QUIEN, pilar, pregunta, kpi } from './data.js';
import { lineaKpi, radar, anillo } from './charts.js';

const $app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ico = {
  eye: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  back: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
  doc: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
  plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
};

const ui = { q: {}, ronda: {}, confirmar: null, loginModo: 'consultora', enlace: null, cambio: {} };
let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
const go = h => { if (location.hash === h) render(); else location.hash = h; };
const parseNum = v => { if (v === null || v === undefined) return null; const s = String(v).trim().replace(/\s/g, '').replace(',', '.'); if (s === '') return null; const n = Number(s); return Number.isFinite(n) ? n : null; };
const numIn = v => E.valorDef(v) ? String(v).replace('.', ',') : '';
const fecha = iso => new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
const fechaCorta = iso => new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
const iniciales = s => (s || '?').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
const cfg = () => S.config();
const marca = () => { const m = (cfg().nombre.match(/[A-Za-zÁÉÍÓÚÑáéíóúñ]/) || ['·'])[0]; return m.toUpperCase(); };
const yo = () => S.sesion();
const esStaff = () => ['admin', 'lectura'].includes(yo()?.rol);
const soloLectura = () => yo()?.rol === 'lectura';
const tagNivel = nv => `<span class="tag ${nv.id}">${esc(nv.nombre)}</span>`;
const mesCorto = (n, m) => (E.mesesVisibles(n) > 4 ? 'M' : 'Mes ') + m;

// ---------------- Estructura ----------------
function layout(body, current = '') {
  const u = yo();
  let nav;
  if (u.rol === 'dueno') {
    nav = [['#/mi-negocio', 'Mi negocio', 'mi'], ['#/informe/' + negocioActivo(u).id, 'Informe', 'informe']];
  } else {
    nav = [['#/panel', 'Panel', 'panel']];
    nav.push(['#/metodo', 'Método', 'metodo']);
    if (u.rol === 'admin') nav.push(['#/ajustes', 'Ajustes', 'ajustes']);
  }
  const rol = { admin: 'Consultora', lectura: 'Solo lectura', dueno: 'Responsable del negocio' }[u.rol];
  return `
  ${soloLectura() ? `<div class="ro-banner"><div class="wrap">${ico.eye} Cuenta de <b>solo lectura</b>: puedes ver todo, pero no cambiar nada.</div></div>` : ''}
  <header class="top"><div class="wrap">
    <a class="brand" href="${u.rol === 'dueno' ? '#/mi-negocio' : '#/panel'}"><span class="mark" aria-hidden="true">${esc(marca())}</span><div><b>${esc(cfg().nombre)}</b><span>${esc(cfg().lema)}</span></div></a>
    <nav aria-label="Principal">${nav.map(([h, t, id]) => `<a href="${h}" ${current === id ? 'aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
    <div class="user"><span class="avatar" aria-hidden="true">${esc(iniciales(u.nombre))}</span>
      <span class="who"><b>${esc(u.nombre)}</b><br><span class="muted small">${rol}</span></span>
      <button class="btn ghost sm" data-act="salir">Salir</button></div>
  </div></header>
  <main><div class="wrap">${body}</div></main>
  ${footer()}`;
}

function footer() {
  return `<footer class="foot"><div class="wrap">
    <span class="badge-demo"><span class="tag aviso">Prototipo</span> Negocios y datos ficticios · fecha simulada: ${fecha(E.FECHA_DEMO)} · se guardan en este navegador.</span>
    <span><button data-act="reset">${ui.confirmar === 'reset' ? '¿Seguro? Pulsa otra vez para restablecer' : 'Restablecer datos de ejemplo'}</button></span>
  </div></footer>`;
}

// ---------------- Acceso ----------------
function loginView(err = '') {
  const us = S.datos().usuarios;
  const staff = us.filter(u => u.rol !== 'dueno'), duenos = us.filter(u => u.rol === 'dueno');
  const modo = ui.loginModo;
  const nombreNeg = u => u.negocioIds.map(id => S.negocio(id)?.nombre).filter(Boolean).join(' y ');
  let form;
  if (modo === 'consultora') {
    form = `<form data-form="login" novalidate>
      <label class="field"><span>Correo</span><input class="input" type="email" name="email" autocomplete="username" required placeholder="tucorreo@ejemplo.com"></label>
      <label class="field"><span>Contraseña</span><input class="input" type="password" name="password" autocomplete="current-password" required></label>
      ${err ? `<p class="err" role="alert">${esc(err)}</p>` : ''}
      <button class="btn" type="submit">Entrar</button></form>`;
  } else if (ui.enlace) {
    form = `<div class="stack"><div class="notice blue">${ico.mail} Te hemos enviado un enlace de acceso a <b>${esc(ui.enlace)}</b>. Ábrelo desde tu correo para entrar, sin contraseña.</div>
      <p class="small muted">En este prototipo el correo no se envía de verdad: abre el enlace aquí.</p>
      <div class="btns"><button class="btn" data-act="abrir-enlace">Abrir el enlace</button><button class="btn ghost" data-act="otro-correo">Usar otro correo</button></div></div>`;
  } else {
    form = `<form data-form="enlace" novalidate>
      <label class="field"><span>Correo del negocio</span><input class="input" type="email" name="email" autocomplete="email" required placeholder="tucorreo@ejemplo.com"></label>
      ${err ? `<p class="err" role="alert">${esc(err)}</p>` : ''}
      <button class="btn" type="submit">${ico.mail} Recibir enlace de acceso</button>
      <p class="small muted">Te llega un enlace al correo. Sin contraseñas.</p></form>`;
  }
  return `<div class="login">
    <section class="login-art">
      <svg class="grid-art" viewBox="0 0 200 200" aria-hidden="true"><g fill="none" stroke="#fff" stroke-width="2">${[0, 1, 2, 3, 4].map(i => `<rect x="${10 + i * 38}" y="${150 - i * 30}" width="26" height="${40 + i * 30}" rx="4"/>`).join('')}</g></svg>
      <div style="display:flex;gap:12px;align-items:center"><span class="mark">${esc(marca())}</span><b style="font-family:var(--display);font-size:20px">${esc(cfg().nombre)}</b></div>
      <div>
        <span class="label">${esc(cfg().lema)}</span>
        <h1 style="margin-top:10px">Saber si el negocio gana dinero y dónde lo pierde</h1>
        <p>Diagnóstico de 24 prácticas en 5 pilares, 3 prioridades con reglas explícitas e indicadores medidos mes a mes.</p>
        <ul class="pillars-list">${PILARES.map(p => `<li><b>${p.id}</b><span>${esc(p.nombre)}</span></li>`).join('')}</ul>
      </div>
    </section>
    <section class="login-form"><div style="width:100%;max-width:420px;display:grid;gap:18px">
      <div><span class="label">Acceso</span><h2 style="margin-top:8px">Entra a tu espacio</h2></div>
      <div class="mode-switch" role="tablist">
        <button role="tab" aria-selected="${modo === 'consultora'}" class="${modo === 'consultora' ? 'on' : ''}" data-act="modo" data-m="consultora">Consultora</button>
        <button role="tab" aria-selected="${modo === 'dueno'}" class="${modo === 'dueno' ? 'on' : ''}" data-act="modo" data-m="dueno">Dueño o encargado</button>
      </div>
      ${form}
      <div class="demo" style="margin-top:12px">
        <span class="label">Cuentas de demostración${modo === 'consultora' ? ' · contraseña ' + S.DEMO_PASS : ''}</span>
        <div class="demo-list">
          ${(modo === 'consultora' ? staff : duenos).map(u => `<button type="button" data-act="demo" data-email="${esc(u.email)}"><span><b>${esc(u.nombre)}</b> · ${u.rol === 'admin' ? 'Consultora' : u.rol === 'lectura' ? 'Solo lectura (para evaluadores)' : esc(nombreNeg(u))}<br><small>${esc(u.email)}</small></span><span aria-hidden="true">→</span></button>`).join('')}
        </div>
      </div>
    </div></section>
  </div>`;
}

// ---------------- Panel ----------------
function panelView() {
  const ns = S.datos().negocios;
  const filas = ns.map(n => ({ n, p: E.puntuaciones(n), f: E.fase(n), a: E.alertas(n) }));
  const enPrograma = filas.filter(x => ['linea-base', 'implantacion', 'consolidacion', 'cierre'].includes(x.f.id)).length;
  const enCont = filas.filter(x => x.f.id === 'continuidad').length;
  const nAlertas = filas.reduce((s, x) => s + x.a.filter(a => a.tipo === 'alerta').length, 0);
  const conI = filas.filter(x => x.p.indice != null);
  const medio = conI.length ? Math.round(conI.reduce((s, x) => s + x.p.indice, 0) / conI.length) : null;
  const lista = filas.flatMap(x => x.a.filter(a => a.tipo !== 'info').map(a => ({ ...a, n: x.n })))
    .sort((a, b) => (a.tipo === 'alerta' ? 0 : 1) - (b.tipo === 'alerta' ? 0 : 1));
  const cartera = PILARES.map(p => {
    const vals = filas.map(x => x.p.pilares.find(y => y.id === p.id).pct).filter(v => v != null);
    return { ...p, pct: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null };
  });
  const tabDe = f => ({ diagnostico: 'diagnostico', 'linea-base': 'indicadores' }[f.id] || 'seguimiento');
  return layout(`
    <div class="head"><div><span class="label">Panel de la consultora</span><h1 style="margin-top:6px">Hola, ${esc(yo().nombre.split(' ')[0])}</h1>
      <p class="muted">Todos los negocios en un vistazo: en qué fase va cada uno, su ${esc(cfg().indice)} y qué necesita tu atención.</p></div>
      ${yo().rol === 'admin' ? `<a class="btn" href="#/nuevo">${ico.plus} Nuevo negocio</a>` : ''}</div>
    <div class="stats">
      <div class="stat"><span class="label">Negocios</span><b>${ns.length}</b></div>
      <div class="stat"><span class="label">En programa de 90 días</span><b>${enPrograma}</b></div>
      <div class="stat"><span class="label">En continuidad</span><b>${enCont}</b></div>
      <div class="stat"><span class="label">Alertas activas</span><b>${nAlertas}</b></div>
    </div>
    <div class="cols-2-1">
      <section class="card"><div class="head" style="margin-bottom:12px"><h3>Negocios</h3><span class="muted small">${esc(cfg().indice)} medio: <b>${medio ?? '—'}${medio != null ? ' %' : ''}</b></span></div>
        ${ns.length ? `<table class="table"><thead><tr><th>Negocio</th><th class="hide-m">Municipio</th><th>Fase del programa</th><th>${esc(cfg().indice)}</th><th></th></tr></thead><tbody>
        ${filas.map(({ n, p, f, a }) => { const al = a.filter(x => x.tipo === 'alerta').length; return `<tr>
          <td class="name"><b>${esc(n.nombre)}</b><span class="muted small">${esc(n.tipo)}${al ? ` · <span style="color:var(--coral-tx)">● ${al} alerta${al > 1 ? 's' : ''}</span>` : ''}</span></td>
          <td class="hide-m">${esc(n.municipio)}</td>
          <td class="prog"><div class="small" style="margin-bottom:6px">${esc(f.nombre)}${f.semana && f.id !== 'continuidad' ? ` · semana ${f.semana}` : ''}</div><div class="progress" role="progressbar" aria-valuenow="${f.pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Avance del programa"><i style="width:${f.pct}%"></i></div></td>
          <td>${p.indice != null ? `<b>${p.indice} %</b> ${tagNivel(p.nivel)}` : '<span class="muted">—</span>'}</td>
          <td><a class="btn sec sm" href="#/negocio/${n.id}/${tabDe(f)}">Abrir</a></td></tr>`; }).join('')}</tbody></table>` : '<p class="muted">Aún no hay negocios.</p>'}
      </section>
      <aside class="stack">
        <section class="card crema"><h3 style="margin-bottom:14px">Necesita tu atención</h3>
          ${lista.length ? `<ul class="alerts">${lista.slice(0, 8).map(a => `<li class="${a.tipo}"><span class="dot"></span><span><a href="#/negocio/${a.n.id}/${a.tab}">${esc(a.n.nombre)}</a><br>${esc(a.texto)}</span></li>`).join('')}</ul>` : '<p class="muted">Todo en orden.</p>'}
        </section>
        <section class="card"><h3 style="margin-bottom:6px">Cartera por pilar</h3>
          <p class="muted small" style="margin-bottom:16px">Media de todos los negocios: dónde flojea la zona.</p>
          <div class="bars">${cartera.map(p => `<div class="bar-row"><header><span>${p.id} ${esc(p.nombre)}</span><b>${p.pct ?? '—'}${p.pct != null ? ' %' : ''}</b></header><div class="progress"><i style="width:${p.pct || 0}%"></i></div></div>`).join('')}</div>
        </section>
      </aside>
    </div>`, 'panel');
}

// ---------------- Ficha ----------------
const siNo = (name, v) => `<select class="input" name="${name}"><option value="">—</option><option value="si" ${v === true ? 'selected' : ''}>Sí</option><option value="no" ${v === false ? 'selected' : ''}>No</option></select>`;
function fichaCampos(n = {}) {
  const otroMun = n.municipio && !MUNICIPIOS.includes(n.municipio);
  return `<div class="grid2">
      <label class="field"><span>Nombre del negocio</span><input class="input" name="nombre" required value="${esc(n.nombre || '')}" placeholder="Ej. Bar Kalea"></label>
      <label class="field"><span>Tipo</span><select class="input" name="tipo">${TIPOS.map(t => `<option ${n.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <label class="field"><span>Municipio</span><select class="input" name="municipio">${MUNICIPIOS.map(t => `<option ${n.municipio === t ? 'selected' : ''}>${t}</option>`).join('')}<option value="__otro" ${otroMun ? 'selected' : ''}>Otro…</option></select></label>
      <label class="field"><span>Otro municipio</span><input class="input" name="municipioOtro" value="${otroMun ? esc(n.municipio) : ''}" placeholder="Si elegiste «Otro»"></label>
      <label class="field"><span>Aforo (personas)</span><input class="input num" name="aforo" inputmode="numeric" value="${esc(n.aforo ?? '')}"></label>
      <label class="field"><span>Personas que trabajan (incluida familia)</span><input class="input num" name="personas" inputmode="numeric" value="${esc(n.personas ?? '')}"></label>
      <label class="field"><span>Horario</span><input class="input" name="horario" value="${esc(n.horario || '')}" placeholder="Ej. 8:00 a 23:00"></label>
      <label class="field"><span>Ventas mensuales aproximadas</span><select class="input" name="ventasRango"><option value="">—</option>${RANGOS_VENTAS.map(t => `<option ${n.ventasRango === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <label class="field"><span>Ticket medio (€)</span><input class="input num" name="ticket" inputmode="decimal" value="${numIn(n.ticket)}"></label>
      <label class="field"><span>Clientes o tickets al día</span><input class="input num" name="ticketsDia" inputmode="numeric" value="${esc(n.ticketsDia ?? '')}"></label>
      <label class="field"><span>Nota en Google</span><input class="input num" name="notaGoogle" inputmode="decimal" value="${numIn(n.notaGoogle)}" placeholder="4,3"></label>
      <label class="field"><span>Número de reseñas en Google</span><input class="input num" name="resenasGoogle" inputmode="numeric" value="${esc(n.resenasGoogle ?? '')}"></label>
      <label class="field"><span>¿Tiene ficha de Google?</span>${siNo('fichaGoogle', n.fichaGoogle)}</label>
      <label class="field"><span>¿Usa TPV con informes?</span>${siNo('tpvInformes', n.tpvInformes)}</label>
      <label class="field"><span>¿Trabaja con gestoría?</span>${siNo('gestoria', n.gestoria)}</label>
      <label class="field"><span>¿Quién administra las redes?</span><select class="input" name="redesQuien"><option value="">—</option>${REDES_QUIEN.map(t => `<option ${n.redesQuien === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <label class="field"><span>Persona de contacto</span><input class="input" name="contacto" value="${esc(n.contacto || '')}" placeholder="Nombre y cargo"></label>
    </div>
    <label class="field"><span>Mayor preocupación del dueño (con sus palabras)</span><textarea class="input" name="preocupacion" rows="2">${esc(n.preocupacion || '')}</textarea></label>
    <label class="kpi-opt" style="max-width:520px"><input type="checkbox" name="soloRevende" ${n.soloRevende ? 'checked' : ''}><span><b>Solo revende, no elabora producto</b><small>Oculta las preguntas Q06 y Q07 (recetas y escandallos).</small></span></label>
    <fieldset class="field" style="border:0;padding:0;margin:0"><legend style="font-size:14px;font-weight:500;margin-bottom:8px">Días de apertura</legend>
      <div class="chips">${DIAS.map(d => `<label class="chip-check"><input type="checkbox" name="dias" value="${d}" ${(n.dias || []).includes(d) ? 'checked' : ''}><span>${d}</span></label>`).join('')}</div></fieldset>
    <fieldset class="field" style="border:0;padding:0;margin:0"><legend style="font-size:14px;font-weight:500;margin-bottom:8px">Canales de venta actuales</legend>
      <div class="chips">${CANALES.map(c => `<label class="chip-check"><input type="checkbox" name="canales" value="${c}" ${(n.canales || []).includes(c) ? 'checked' : ''}><span>${c}</span></label>`).join('')}</div></fieldset>`;
}

function leerFicha(form) {
  const fd = new FormData(form);
  const b = k => fd.get(k) === 'si' ? true : fd.get(k) === 'no' ? false : null;
  const mun = fd.get('municipio') === '__otro' ? (fd.get('municipioOtro') || '').trim() || 'Otro' : fd.get('municipio');
  return {
    nombre: (fd.get('nombre') || '').trim(), tipo: fd.get('tipo'), municipio: mun,
    aforo: parseNum(fd.get('aforo')), personas: parseNum(fd.get('personas')), horario: (fd.get('horario') || '').trim(),
    ventasRango: fd.get('ventasRango') || '', ticket: parseNum(fd.get('ticket')), ticketsDia: parseNum(fd.get('ticketsDia')),
    notaGoogle: parseNum(fd.get('notaGoogle')), resenasGoogle: parseNum(fd.get('resenasGoogle')),
    fichaGoogle: b('fichaGoogle'), tpvInformes: b('tpvInformes'), gestoria: b('gestoria'), redesQuien: fd.get('redesQuien') || '',
    contacto: (fd.get('contacto') || '').trim(), preocupacion: (fd.get('preocupacion') || '').trim(),
    soloRevende: fd.get('soloRevende') === 'on', dias: fd.getAll('dias'), canales: fd.getAll('canales'),
  };
}

function nuevoView() {
  return layout(`
    <a class="crumb" href="#/panel">${ico.back} Panel</a>
    <div class="head"><div><span class="label">Paso 1 · Ficha</span><h1 style="margin-top:6px">Nuevo negocio</h1>
      <p class="muted">Rellena la ficha y da acceso al responsable del negocio. Después haces el diagnóstico en la visita.</p></div></div>
    <form class="stack" data-form="nuevo" novalidate>
      <section class="card stack"><h3>Ficha del negocio</h3>${fichaCampos({ dias: ['L', 'M', 'X', 'J', 'V', 'S'] })}</section>
      <section class="card cielo stack"><h3>Acceso del dueño o encargado</h3>
        <p class="muted small">Entra con un enlace que le llega al correo, sin contraseña. Ve su diagnóstico, prioridades, indicadores e informe, y mete el dato del mes.</p>
        <div class="grid2">
          <label class="field"><span>Nombre</span><input class="input" name="duenoNombre" placeholder="Ej. Jon"></label>
          <label class="field"><span>Correo</span><input class="input" type="email" name="duenoEmail" placeholder="correo@negocio.com"></label>
        </div>
      </section>
      <p class="err" data-err></p>
      <div class="btns"><button class="btn" type="submit" data-mut>Crear y empezar diagnóstico</button><a class="btn sec" href="#/panel">Cancelar</a></div>
    </form>`, 'nuevo');
}

function fichaTab(n) {
  const us = S.usuariosDe(n.id);
  return `<div class="stack">
    <form class="card stack" data-form="ficha" data-id="${n.id}" novalidate><h3>Ficha del negocio</h3>${fichaCampos(n)}
      <div class="btns"><button class="btn" type="submit" data-mut>Guardar ficha</button><span class="muted small">Alta: ${fecha(n.creado)}</span></div></form>
    <section class="card cielo stack"><h3>Personas con acceso</h3>
      <p class="muted small">Entran con un enlace al correo. Un mismo dueño puede tener varios negocios, y un negocio varias personas (dueño y encargado).</p>
      ${us.length ? `<ul class="alerts">${us.map(u => `<li class="info"><span class="dot"></span><span style="flex:1"><b>${esc(u.nombre)}</b> · ${esc(u.email)}${u.negocioIds.length > 1 ? ` <span class="muted small">(${u.negocioIds.length} negocios)</span>` : ''}</span><button class="btn ghost sm" data-act="quitar-acceso" data-id="${n.id}" data-email="${esc(u.email)}" data-mut>Quitar</button></li>`).join('')}</ul>` : '<p class="muted">Nadie tiene acceso todavía.</p>'}
      <form class="grid2" data-form="acceso" data-id="${n.id}" novalidate style="align-items:end">
        <label class="field"><span>Nombre</span><input class="input" name="nombre"></label>
        <label class="field"><span>Correo</span><input class="input" type="email" name="email"></label>
        <div class="btns"><button class="btn sec" type="submit" data-mut>Dar acceso</button><a class="btn ghost" href="#/vista-dueno/${n.id}">${ico.eye} Ver como dueño</a></div>
      </form><p class="err" data-err></p>
    </section>
    <section class="card crema"><div class="btns" style="justify-content:space-between"><span class="small muted">Eliminar el negocio borra su diagnóstico, indicadores, visitas y accesos.</span>
      <button class="btn sec sm" data-act="eliminar" data-id="${n.id}" data-mut>${ui.confirmar === 'eliminar-' + n.id ? '¿Seguro? Pulsa otra vez' : 'Eliminar negocio'}</button></div></section>
  </div>`;
}

// ---------------- Diagnóstico ----------------
const respuestasRonda = (n, ronda) => ronda === 'final' ? (n.diagnosticoFinal?.respuestas || {}) : (n.respuestas || {});
function diagTab(n) {
  const ronda = ui.ronda[n.id] === 'final' && n.diagnosticoFinal ? 'final' : 'inicial';
  const r = respuestasRonda(n, ronda);
  const qs = E.preguntasDe(n);
  const key = n.id + ronda;
  if (ui.q[key] === undefined || ui.q[key] >= qs.length) { const i = qs.findIndex(q => !E.respondida(r[q.id])); ui.q[key] = i === -1 ? 0 : i; }
  const i = ui.q[key], q = qs[i], p = pilar(q.p);
  const av = E.avanceDiagnostico(n, r);
  const v = r[q.id];
  const puede = esStaff();
  return `<div class="stack">
    ${n.diagnosticoFinal ? `<div class="mode-switch"><button class="${ronda === 'inicial' ? 'on' : ''}" data-act="ronda" data-id="${n.id}" data-r="inicial">Diagnóstico inicial · ${fechaCorta(n.fechaDiagnostico || n.creado)}</button><button class="${ronda === 'final' ? 'on' : ''}" data-act="ronda" data-id="${n.id}" data-r="final">Diagnóstico final · ${fechaCorta(n.diagnosticoFinal.fecha)}</button></div>` : ''}
    ${n.soloRevende ? `<div class="notice blue small">Este negocio solo revende: Q06 y Q07 no se preguntan.</div>` : ''}
    <div class="diag">
    <aside class="card pillars"><h4>Los 5 pilares</h4>
      ${PILARES.map(pp => {
        const l = qs.filter(x => x.p === pp.id);
        const h = l.filter(x => E.respondida(r[x.id])).length;
        return `<button data-act="pilar" data-id="${n.id}" data-p="${pp.id}" class="${pp.id === q.p ? 'on' : ''}"><span>${pp.id} ${esc(pp.corto)}</span><small>${h}/${l.length}</small></button>`;
      }).join('')}
      <hr class="seam"><p class="small muted" style="padding:0 6px">${av.hechas} de ${av.total} respondidas</p>
    </aside>
    <section class="card q-card">
      <span class="q-meta">${q.id} · ${esc(p.nombre)}</span>
      <p class="q-text">${esc(q.texto)}</p>
      <div class="evid">${ico.info}<span><b>Para puntuar 2, pide que te enseñen:</b> ${esc(q.evidencia)} Si no puede mostrarlo, es 1.</span></div>
      <div class="opts" role="radiogroup" aria-label="Respuesta">
        ${ESCALA.map(o => `<button class="opt ${v === o.v ? 'on' : ''}" role="radio" aria-checked="${v === o.v}" data-act="resp" data-id="${n.id}" data-ronda="${ronda}" data-q="${q.id}" data-v="${o.v}" ${puede && !soloLectura() ? '' : 'disabled'}><b>${o.t}</b><span>${o.l}</span></button>`).join('')}
      </div>
      <div class="btns" style="justify-content:space-between">
        <button class="btn sec" data-act="qnav" data-k="${key}" data-to="${i - 1}" ${i === 0 ? 'disabled' : ''}>Anterior</button>
        ${i < qs.length - 1 ? `<button class="btn" data-act="qnav" data-k="${key}" data-to="${i + 1}">Siguiente pregunta</button>` : `<a class="btn" href="#/negocio/${n.id}/resultados">Ver resultados</a>`}
      </div>
      <div class="qnums" aria-label="Ir a la pregunta">${qs.map((x, j) => `<button data-act="qnav" data-k="${key}" data-to="${j}" class="${E.respondida(r[x.id]) ? 'done' : ''} ${j === i ? 'cur' : ''}" aria-label="${x.id}${E.respondida(r[x.id]) ? ', respondida' : ''}">${x.id.slice(1)}</button>`).join('')}</div>
      ${av.completo ? `<div class="notice" style="margin-top:20px"><b>Diagnóstico ${ronda} completo.</b> <a href="#/negocio/${n.id}/resultados">Ver resultados y prioridades →</a></div>` : ''}
    </section></div>
  </div>`;
}

// ---------------- Resultados y prioridades ----------------
function pilaresBars(p, comparar) {
  return `<div class="bars">${p.pilares.map((x, i) => {
    const c = comparar?.pilares[i];
    return `<div class="bar-row ${x.bloqueado ? 'bloq' : ''}"><header><span><b>${x.id}</b> ${esc(x.nombre)}</span><span>${c && c.pct != null ? `<span class="muted small">${c.pct} % → </span>` : ''}<b>${x.pct ?? '—'}${x.pct != null ? ' %' : ''}</b> ${x.pct != null ? (x.bloqueado ? '<span class="tag bloqueado">Línea digital bloqueada</span>' : tagNivel(x.nivel)) : ''}</span></header><div class="progress"><i style="width:${x.pct || 0}%"></i></div></div>`;
  }).join('')}</div>`;
}

function indiceCard(p, av, titulo) {
  return `<section class="card tinta index-card">
    <span class="label" style="color:#e9c46a">${esc(titulo || cfg().indice)}</span>
    <div class="index-num">${anillo(p.indice)}<b>${p.indice ?? '—'}<small>${p.indice != null ? ' %' : ''}</small></b></div>
    <div>Nivel: <b>${esc(p.nivel.nombre)}</b></div>
    <p class="small" style="opacity:.8">Media de los 5 pilares · ${av.hechas} de ${av.total} preguntas</p>
  </section>`;
}

function comparativaCard(n) {
  const ini = E.puntuaciones(n), fin = E.puntuaciones(n, n.diagnosticoFinal.respuestas);
  const dif = fin.indice - ini.indice;
  return `<section class="card cielo"><div class="head" style="margin-bottom:14px"><div><span class="label">Resultado a 90 días</span>
      <h3 style="margin-top:6px">${esc(cfg().indice)}: ${ini.indice} % → ${fin.indice} % <span class="tag ok">${dif >= 0 ? '+' : ''}${dif} puntos</span></h3>
      <p class="muted small" style="margin-top:6px">Diagnóstico inicial del ${fecha(n.fechaDiagnostico || n.creado)} y final del ${fecha(n.diagnosticoFinal.fecha)}.</p></div></div>
    ${pilaresBars(fin, ini)}</section>`;
}

function prioridadCard(n, id, k, opts) {
  const q = pregunta(id), pts = E.puntuaciones(n);
  const sc = E.puntuarPregunta(q, pts);
  return `<article class="prio"><span class="n">${k + 1}. ${q.id} · ${esc(pilar(q.p).nombre)} · ${sc.total} pts</span>
    <h4>${esc(q.problema)}</h4><p class="small">${esc(q.texto)}</p>
    <p class="score">2 × impacto ${q.imp} + urgencia ${q.urg} + viabilidad ${q.via} + sostenibilidad ${q.sos} = ${sc.base}${sc.bono ? ' + bono de cimientos 2' : ''}. Protocolo ${q.prot}: ${esc(PROTOCOLOS[q.prot].nombre)}.</p>
    ${opts || ''}</article>`;
}

function resultadosTab(n) {
  const av = E.avanceDiagnostico(n);
  if (!av.hechas) return `<div class="card crema"><h3>Aún no hay resultados</h3><p class="muted" style="margin:8px 0 16px">Haz el diagnóstico para calcular el ${esc(cfg().indice)}.</p><a class="btn" href="#/negocio/${n.id}/diagnostico">Empezar diagnóstico</a></div>`;
  const p = E.puntuaciones(n);
  const conf = !!n.prioridades?.confirmadas;
  const ids = E.prioridadesActuales(n);
  const cands = E.candidatas(n);
  const propuestas = E.prioridadesPropuestas(n);
  const cambiada = !conf && ids.join() !== propuestas.join();
  const edit = yo().rol === 'admin';
  const f = E.fase(n);
  const otras = cands.filter(c => !ids.includes(c.q.id) && !(n.prioridades?.cumplidas || []).includes(c.q.id));
  return `<div class="stack">
    ${n.diagnosticoFinal ? comparativaCard(n) : ''}
    <div class="row" style="grid-template-columns:minmax(0,.8fr) minmax(0,1.4fr) minmax(0,1fr)">
      ${indiceCard(p, av, n.diagnosticoFinal ? cfg().indice + ' · inicial' : null)}
      <section class="card"><h3 style="margin-bottom:18px">Puntuación por pilar</h3>${pilaresBars(p)}
        ${p.bloqueoDigital ? `<div class="notice" style="margin-top:18px"><b>Regla de activación digital:</b> las preguntas de redes y WhatsApp no pueden ser prioridad hasta que la Gestión administrativa y financiera llegue al ${E.UMBRAL_DIGITAL} %. No se traen clientes a un negocio que pierde dinero en caja.</div>` : ''}
      </section>
      <section class="card crema" style="display:grid;place-items:center">${radar(p.pilares)}</section>
    </div>
    ${!av.completo ? `<div class="notice">Faltan ${av.total - av.hechas} preguntas: los resultados son provisionales. <a href="#/negocio/${n.id}/diagnostico">Terminar diagnóstico →</a></div>` : ''}
    <section>
      <div class="head" style="margin-bottom:12px"><div><h2>Las 3 prioridades ${conf ? 'del programa' : 'propuestas'}</h2>
        <p class="muted small">Prioridad = 2 × impacto + urgencia + viabilidad + sostenibilidad + bono de cimientos (+2 en P1 y P2 cuando su pilar está en nivel crítico). Candidatas: las preguntas con 0; si hay menos de 3, también las de 1. Nunca entran preguntas de un pilar bloqueado.</p></div>
        ${conf ? `<span class="tag ok">Confirmadas el ${fecha(n.prioridades.fecha)}</span>` : ''}</div>
      ${ids.length ? `<div class="prios">${ids.map((id, k) => prioridadCard(n, id, k,
        !conf && edit && otras.length ? `<label class="field"><span class="small muted">Cambiar por otra candidata</span><select class="input" data-act="cambiar-prio" data-id="${n.id}" data-k="${k}"><option value="">Mantener esta</option>${otras.map(o => `<option value="${o.q.id}">${o.q.id} · ${o.total} pts · ${esc(o.q.problema)}</option>`).join('')}</select></label>`
        : conf && edit && !n.diagnosticoFinal && otras.length ? `<button class="btn sec sm" data-act="cumplida" data-id="${n.id}" data-q="${id}" data-mut>${ui.confirmar === 'cumplida-' + id ? '¿Seguro? Pulsa otra vez' : 'Cumplida: activar la siguiente candidata'}</button>` : '')).join('')}</div>`
        : `<div class="card cielo"><p>No hay candidatas fuera de los pilares bloqueados.</p></div>`}
      ${(n.prioridades?.cumplidas || []).length ? `<p class="small muted" style="margin-top:12px">Prioridades ya cumplidas: ${n.prioridades.cumplidas.map(id => `${id} (${esc(pregunta(id).problema)})`).join(' · ')}</p>` : ''}
      ${cambiada ? `<label class="field" style="margin-top:16px;max-width:640px"><span>Motivo del cambio (obligatorio)</span><textarea class="input" rows="2" data-act="motivo" data-id="${n.id}" placeholder="Por qué cambias la propuesta del método">${esc(n.prioridades?.motivo || '')}</textarea></label>` : ''}
      ${conf && n.prioridades.motivo ? `<p class="small" style="margin-top:12px"><b>Motivo del ajuste:</b> ${esc(n.prioridades.motivo)}</p>` : ''}
      ${edit ? `<div class="btns" style="margin-top:20px">
        ${conf ? `<a class="btn" href="#/negocio/${n.id}/plan">Ver el plan de acción</a>
            ${!n.diagnosticoFinal && n.seguimiento?.confirmado ? `<button class="btn sec" data-act="diag-final" data-id="${n.id}" data-mut>${ui.confirmar === 'final-' + n.id ? '¿Empezar ya? Pulsa otra vez' : 'Hacer el diagnóstico final (semana 12)'}</button>` : ''}
            ${!n.seguimiento?.confirmado ? `<button class="btn ghost" data-act="desconfirmar" data-id="${n.id}" data-mut>Ajustar prioridades</button>` : ''}`
          : `<button class="btn" data-act="confirmar-prio" data-id="${n.id}" data-mut ${!av.completo || !ids.length ? 'disabled' : ''}>Confirmar prioridades y pasar a la línea base</button>
             ${cambiada ? `<button class="btn sec" data-act="restaurar-prio" data-id="${n.id}" data-mut>Volver a la propuesta</button>` : ''}
             <a class="btn ghost" href="#/negocio/${n.id}/diagnostico">Revisar respuestas</a>`}
      </div>` : ''}
      ${f.id === 'cierre' && !n.diagnosticoFinal ? `<div class="notice" style="margin-top:16px">Semana ${f.semana}: toca el diagnóstico final para comparar con el inicial.</div>` : ''}
    </section>
  </div>`;
}

// ---------------- Plan de acción ----------------
const posTxt = g => (g.posiciones.length > 1 ? 'Prioridades ' + g.posiciones.slice(0, -1).join(', ') + ' y ' + g.posiciones.slice(-1) : 'Prioridad ' + g.posiciones[0]);
function planTab(n) {
  if (!n.prioridades?.confirmadas) return `<div class="card crema"><h3>Primero, las prioridades</h3><p class="muted" style="margin:8px 0 16px">El plan de acción sale de las 3 prioridades confirmadas.</p><a class="btn" href="#/negocio/${n.id}/resultados">Ver prioridades</a></div>`;
  const acc = E.accionesDe(n, n.prioridades.ids);
  const t = E.accionesHechas(n);
  const editable = yo().rol === 'admin';
  return `<div class="stack">
    <section class="card mant"><div class="head" style="margin:0"><div><h3>Plan de acción · 90 días</h3>
      <p class="muted">Cada protocolo lo aplica el responsable interno del negocio, con tu acompañamiento. Marca cada acción cuando esté hecha.</p></div>
      <span class="tag ${t.hechas === t.total ? 'ok' : 'info'}">${t.hechas} de ${t.total} acciones hechas</span></div></section>
    <div class="prios">${acc.map(a => `<article class="prio"><span class="n">${posTxt(a)} · ${a.prot} · ${esc(pilar(a.q.p).nombre)}</span>
      <h4>${esc(a.nombre)}</h4><div class="small muted">Para resolver:<ul style="margin:4px 0 0;padding-left:18px">${a.preguntas.map(q => `<li>${esc(q.problema)}</li>`).join('')}</ul></div>
      <div class="stack" style="gap:8px">${a.acciones.map(x => `<label class="kpi-opt"><input type="checkbox" data-act="accion" data-id="${n.id}" data-k="${x.clave}" ${x.hecha ? 'checked' : ''} ${editable ? '' : 'disabled'}><span>${esc(x.texto)}${x.hecha ? `<small>Hecha el ${fecha(x.hecha)}</small>` : ''}</span></label>`).join('')}</div>
    </article>`).join('')}</div>
    ${E.alertas(n).filter(a => a.texto.startsWith('Prioridad sin avances')).map(a => `<div class="notice">${esc(a.texto)}</div>`).join('')}
  </div>`;
}

// ---------------- Indicadores (línea base) ----------------
function indicadoresTab(n) {
  if (!n.prioridades?.confirmadas) return `<div class="card crema"><h3>Primero, las prioridades</h3><p class="muted" style="margin:8px 0 16px">Los indicadores se sugieren a partir de las 3 prioridades confirmadas.</p><a class="btn" href="#/negocio/${n.id}/resultados">Ver prioridades</a></div>`;
  const sug = E.kpisSugeridos(n.prioridades.ids);
  if (!n.seguimiento && yo().rol === 'admin') S.actualizar(n.id, x => { x.seguimiento = { confirmado: false, kpis: sug.map(id => ({ id, base: null, objetivo: null })) }; });
  const sel = n.seguimiento?.kpis || [];
  const selIds = sel.map(s => s.id);
  const listos = sel.length >= 3 && sel.length <= 6 && sel.every(s => E.valorDef(s.objetivo));
  const op = k => `<label class="kpi-opt"><input type="checkbox" data-act="kpi-toggle" data-id="${n.id}" data-k="${k.id}" ${selIds.includes(k.id) ? 'checked' : ''} ${!selIds.includes(k.id) && sel.length >= 6 ? 'disabled' : ''}>
    <span><b>${k.id} · ${esc(k.nombre)}</b> <span class="muted small">(${k.unidad})</span>${sug.includes(k.id) ? '<span class="sug">Sugerido</span>' : ''}<small>${esc(k.formula)} · ${k.dir === 'up' ? 'mejora si sube' : k.dir === 'down' ? 'mejora si baja' : 'mejora si se acerca a 0'} · ${k.impl ? 'requiere implantación' : 'dato fácil'}</small></span></label>`;
  return `<div class="stack">
    <section class="card mant"><div class="head" style="margin:0"><div><h3>Línea base · semanas 1 y 2</h3>
      <p class="muted">Elige entre 3 y 6 indicadores (sugeridos por las prioridades) y fija tú el objetivo a 90 días. Si el negocio aún no tiene el dato, deja el valor inicial vacío: la línea base será la primera medición.</p></div>
      ${n.seguimiento?.confirmado ? `<span class="tag ok">Seguimiento en marcha</span>` : ''}</div></section>
    <section class="card"><h3 style="margin-bottom:6px">Seleccionados (${sel.length} de 6)</h3>
      ${sel.length ? `<div class="stack">${sel.map(s => { const k = kpi(s.id); return `<div class="grid2" style="align-items:end;border-top:1px solid var(--linea);padding-top:14px">
        <div><b>${k.id} · ${esc(k.nombre)}</b> <span class="tag ${k.impl ? 'aviso' : 'info'}" style="font-size:12px">${k.impl ? 'Requiere implantación' : 'Dato fácil'}</span><br><span class="small muted">${esc(k.formula)}</span></div>
        <div class="grid2" style="gap:10px">
          <label class="field"><span class="small">Valor inicial (${k.unidad})</span><input class="input num" inputmode="decimal" data-act="kpi-val" data-id="${n.id}" data-k="${k.id}" data-f="base" value="${numIn(s.base)}" placeholder="Primera medición"></label>
          <label class="field"><span class="small">Objetivo 90 días (${k.unidad})</span><input class="input num" inputmode="decimal" data-act="kpi-val" data-id="${n.id}" data-k="${k.id}" data-f="objetivo" value="${numIn(s.objetivo)}"></label>
        </div></div>`; }).join('')}</div>` : '<p class="muted">Marca indicadores en el banco de abajo.</p>'}
      <div class="btns" style="margin-top:20px">
        ${n.seguimiento?.confirmado ? `<a class="btn" href="#/negocio/${n.id}/seguimiento">Ir al seguimiento mensual</a>`
          : `<button class="btn" data-act="confirmar-kpi" data-id="${n.id}" data-mut ${listos ? '' : 'disabled'}>Empezar el seguimiento mensual</button><span class="small muted">${listos ? '' : 'Necesitas entre 3 y 6 indicadores, cada uno con su objetivo.'}</span>`}
      </div>
    </section>
    <section class="card kpi-bank"><h3>Banco oficial de ${KPIS.length} indicadores</h3>
      ${PILARES.map(p => `<div><h4>${p.id} · ${esc(p.nombre)}</h4><div class="kpi-list">${KPIS.filter(k => k.p === p.id).map(op).join('')}</div></div>`).join('')}
    </section>
  </div>`;
}

// ---------------- Seguimiento ----------------
function kpiCard(n, s, editable) {
  const k = kpi(s.id), vals = E.valoresKpi(n, s.id);
  const meses = E.mesesVisibles(n);
  const serieVals = Array.from({ length: meses }, (_, i) => vals[i] ?? null);
  const base = E.baseEfectiva(n, s);
  const t = E.tendencia(k, [s.base, ...serieVals]);
  const actual = [...serieVals].reverse().find(E.valorDef);
  const cum = E.cumplimiento(k, base, s.objetivo, actual);
  const celda = m => editable
    ? `<label>${mesCorto(n, m)}<input class="input num" inputmode="decimal" aria-label="${esc(k.nombre)}, ${E.nombreMes(n, m)}" data-act="mes-val" data-id="${n.id}" data-k="${k.id}" data-m="${m}" value="${numIn(serieVals[m - 1])}"></label>`
    : `<label>${mesCorto(n, m)}<span class="fixed">${E.fmt(serieVals[m - 1], k.unidad)}</span></label>`;
  return `<article class="card kpi-card">
    <header><div><h4>${esc(k.nombre)}</h4><p class="formula">${esc(k.formula)} · ${k.dir === 'up' ? 'mejora si sube' : k.dir === 'down' ? 'mejora si baja' : 'mejora si se acerca a 0'}</p></div>
      ${t ? `<span class="tag ${t === 'mejora' ? 'ok' : t === 'empeora' ? 'alerta' : ''}">${t === 'mejora' ? '↗ Mejora' : t === 'empeora' ? '↘ Empeora' : '→ Igual'}</span>` : ''}</header>
    <div class="kpi-range"><span>Línea base <b>${E.valorDef(s.base) ? E.fmt(s.base, k.unidad) : E.valorDef(base) ? E.fmt(base, k.unidad) + ' (1.ª medición)' : 'primera medición'}</b></span><span aria-hidden="true">→</span><span>Objetivo 90 días <b>${E.fmt(s.objetivo, k.unidad)}</b></span></div>
    <div class="month-grid" style="grid-template-columns:repeat(${Math.min(meses, 6)},minmax(0,1fr))">${Array.from({ length: meses }, (_, i) => celda(i + 1)).join('')}</div>
    ${lineaKpi(k, s.base, s.objetivo, serieVals, ['Base', ...Array.from({ length: meses }, (_, i) => mesCorto(n, i + 1))])}
    ${cum != null ? `<div><div class="small" style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Avance hacia el objetivo</span><b>${cum} %</b></div><div class="progress"><i style="width:${Math.max(0, Math.min(100, cum))}%"></i></div></div>` : ''}
  </article>`;
}

function seguimientoTab(n) {
  if (!n.seguimiento?.confirmado) return `<div class="card crema"><h3>El seguimiento aún no ha empezado</h3><p class="muted" style="margin:8px 0 16px">Primero elige los indicadores y fija sus objetivos.</p><a class="btn" href="#/negocio/${n.id}/indicadores">Elegir indicadores</a></div>`;
  const al = E.alertas(n).filter(a => a.tipo !== 'info' && a.tab === 'seguimiento');
  const pend = E.mesPendiente(n);
  return `<div class="stack">
    <section class="card mant"><div class="head" style="margin:0"><div><h3>Seguimiento mensual</h3>
      <p class="muted">El mes 1 empezó el ${fecha(n.seguimiento.inicio)}. El responsable del negocio mete el dato de cada mes como tarde el día ${E.DIA_LIMITE} del mes siguiente; tú lo revisas y también puedes meterlo.</p></div>
      ${pend ? `<span class="tag aviso">Toca registrar el mes ${pend}</span>` : '<span class="tag ok">Todo al día</span>'}</div></section>
    ${al.length ? `<ul class="alerts">${al.map(a => `<li class="${a.tipo}"><span class="dot"></span><span>${esc(a.texto)}</span></li>`).join('')}</ul>` : ''}
    <div class="kpi-cards">${n.seguimiento.kpis.map(s => kpiCard(n, s, yo().rol === 'admin')).join('')}</div>
  </div>`;
}

// ---------------- Visitas y notas ----------------
function visitasTab(n) {
  const vs = [...(n.visitas || [])].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const inf = n.informe || {};
  return `<div class="cols-2-1">
    <section class="card stack"><h3>Visitas</h3>
      <form class="grid2" data-form="visita" data-id="${n.id}" style="align-items:end" novalidate>
        <label class="field"><span>Fecha</span><input class="input" type="date" name="fecha" value="${E.ahora().toISOString().slice(0, 10)}"></label>
        <label class="field" style="grid-column:1/-1"><span>Notas de la visita</span><textarea class="input" name="nota" rows="2" placeholder="Qué se hizo, qué se acordó"></textarea></label>
        <div><button class="btn sec" type="submit" data-mut>Añadir visita</button></div>
      </form>
      ${vs.length ? `<ul class="alerts">${vs.map(v => `<li class="info"><span class="dot"></span><span><b>${fecha(v.fecha)}</b><br>${esc(v.nota)}</span></li>`).join('')}</ul>` : '<p class="muted">Sin visitas registradas.</p>'}
    </section>
    <aside class="stack">
      <form class="card crema stack" data-form="notas" data-id="${n.id}" novalidate><h3>Notas privadas</h3>
        <p class="small muted">Solo las ve la consultora. El dueño nunca las ve.</p>
        <textarea class="input" name="notas" rows="4">${esc(n.notasPrivadas || '')}</textarea>
        <button class="btn sec sm" type="submit" data-mut>Guardar notas</button></form>
      <form class="card stack" data-form="informe" data-id="${n.id}" novalidate><h3>Para el informe</h3>
        <label class="field"><span>Valoración de la consultora</span><textarea class="input" name="valoracion" rows="4">${esc(inf.valoracion || '')}</textarea></label>
        <label class="field"><span>Próxima visita</span><input class="input" type="date" name="proximaVisita" value="${esc(inf.proximaVisita || '')}"></label>
        <button class="btn sec sm" type="submit" data-mut>Guardar</button></form>
    </aside>
  </div>`;
}

// ---------------- Negocio (consultora) ----------------
const TABS = [['ficha', 'Ficha'], ['diagnostico', 'Diagnóstico'], ['resultados', 'Resultados y prioridades'], ['plan', 'Plan de acción'], ['indicadores', 'Línea base'], ['seguimiento', 'Seguimiento'], ['visitas', 'Visitas y notas']];
function pasos(n) {
  const f = E.fase(n);
  const pos = E.FASES.findIndex(x => x.id === f.id);
  return `<ol class="steps" aria-label="Fases del programa"><li class="lbl">Programa</li>${E.FASES.map((x, i) => `<li class="${i < pos ? 'done' : i === pos ? 'now' : ''}" title="${x.cuando}">${x.nombre}</li>`).join('')}</ol>`;
}
function negocioView(id, tab) {
  const n = S.negocio(id);
  if (!n) return layout(`<div class="card crema"><h3>No encontramos ese negocio</h3><p style="margin-top:12px"><a href="#/panel">Volver al panel</a></p></div>`);
  const p = E.puntuaciones(n.diagnosticoFinal ? { ...n, respuestas: n.diagnosticoFinal.respuestas } : n);
  const cuerpo = { ficha: fichaTab, diagnostico: diagTab, resultados: resultadosTab, plan: planTab, indicadores: indicadoresTab, seguimiento: seguimientoTab, visitas: visitasTab }[tab] || resultadosTab;
  const f = E.fase(n);
  return layout(`
    <a class="crumb" href="#/panel">${ico.back} Panel</a>
    <div class="biz-head"><div><span class="label">${esc(n.tipo)} · ${esc(n.municipio)}${n.personas ? ' · ' + n.personas + ' personas' : ''}${n.ventasRango ? ' · ' + esc(n.ventasRango) + ' al mes' : ''}</span>
      <h1 style="margin-top:6px">${esc(n.nombre)}</h1>${n.preocupacion ? `<p class="muted" style="margin-top:6px">«${esc(n.preocupacion)}»</p>` : ''}</div>
      <div class="btns">${p.indice != null ? `<span class="tag ${p.nivel.id}" style="font-size:15px;padding:8px 16px">${esc(cfg().indice)} ${p.indice} % · ${esc(p.nivel.nombre)}</span>` : ''}
        <a class="btn sec sm" href="#/vista-dueno/${n.id}">${ico.eye} Vista del dueño</a><a class="btn soft sm" href="#/informe/${n.id}">${ico.doc} Informe</a></div></div>
    ${pasos(n)}${f.semana && f.id !== 'continuidad' ? `<p class="small muted" style="margin:-14px 0 20px">Semana ${f.semana} del programa · avance ${f.pct} %</p>` : ''}
    <nav class="tabs" aria-label="Secciones del negocio">${TABS.filter(([t]) => !(t === 'visitas' && soloLectura())).map(([t, l]) => `<a href="#/negocio/${n.id}/${t}" ${t === tab ? 'aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
    ${cuerpo(n)}`, 'panel');
}

// ---------------- Vista del dueño ----------------
function negocioActivo(u) { const id = ui.activo && u.negocioIds.includes(ui.activo) ? ui.activo : u.negocioIds[0]; return S.negocio(id); }
function duenoView(n, preview = false) {
  const u = yo();
  const pIni = E.puntuaciones(n);
  const p = n.diagnosticoFinal ? E.puntuaciones(n, n.diagnosticoFinal.respuestas) : pIni;
  const av = E.avanceDiagnostico(n, n.diagnosticoFinal ? n.diagnosticoFinal.respuestas : n.respuestas);
  const conf = n.prioridades?.confirmadas;
  const pend = E.mesPendiente(n);
  const nombre = preview ? (S.usuariosDe(n.id)[0]?.nombre || 'equipo') : u.nombre;
  const acciones = conf ? E.accionesDe(n, n.prioridades.ids) : [];
  const puedeDato = !preview && u.rol === 'dueno';
  const otros = !preview && u.rol === 'dueno' && u.negocioIds.length > 1;
  const body = `
    ${preview ? `<div class="notice blue" style="margin-bottom:20px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><span>${ico.eye} Así lo ve el responsable de <b>${esc(n.nombre)}</b>.</span><a href="#/negocio/${n.id}/resultados">Volver a la ficha de la consultora →</a></div>` : ''}
    ${otros ? `<div class="mode-switch" style="margin-bottom:20px">${u.negocioIds.map(id => `<button class="${id === n.id ? 'on' : ''}" data-act="activo" data-id="${id}">${esc(S.negocio(id)?.nombre)}</button>`).join('')}</div>` : ''}
    <section class="owner-hero" style="margin-bottom:28px">
      ${indiceCard(p, av)}
      <div><span class="label">${esc(n.nombre)}</span><h1 style="margin-top:6px">Hola, ${esc(nombre)}</h1>
        <p class="muted" style="margin-top:10px;max-width:56ch">${p.indice == null ? 'Tu consultora hará el diagnóstico contigo en la próxima visita.'
          : !av.completo ? `Tu diagnóstico va por ${av.hechas} de ${av.total} preguntas. Lo terminaréis juntos en la visita.`
          : `Tu ${esc(cfg().indice)} está en <b>${p.indice} %</b>${n.diagnosticoFinal ? ` (empezaste en ${pIni.indice} %)` : ''}. ${conf ? 'Estas son tus 3 prioridades: céntrate en ellas y apunta tus datos cada mes.' : 'Tu consultora está preparando tus 3 prioridades.'}`}</p>
      </div>
    </section>
    <div class="cols-2-1 owner-cols">
      <div class="stack">
        ${conf ? `<section class="card"><h3 style="margin-bottom:16px">Tus 3 prioridades</h3><div class="stack">${acciones.map((a, k) => `<div style="${k ? 'border-top:1px solid var(--linea);padding-top:16px' : ''}">
            <span class="small muted">${posTxt(a)} · ${esc(pilar(a.q.p).nombre)} · ${a.prot} ${esc(a.nombre)}</span>${a.preguntas.map(q => `<h4 style="font-size:17px;margin:4px 0 8px">${esc(q.problema)}</h4>`).join('')}
            <ul class="action-list">${a.acciones.map(x => `<li class="${x.hecha ? 'done' : ''}">${x.hecha ? '<span class="sr">Hecho: </span>' : ''}${esc(x.texto)}</li>`).join('')}</ul></div>`).join('')}</div></section>` : ''}
        ${n.seguimiento?.confirmado ? `<section><h2 style="margin-bottom:16px">Tu evolución</h2><div class="kpi-cards">${n.seguimiento.kpis.map(s => kpiCard(n, s, false)).join('')}</div></section>` : ''}
      </div>
      <aside class="stack">
        ${n.seguimiento?.confirmado ? (pend ? `<form class="card mant stack" data-form="dato-mes" data-id="${n.id}" data-m="${pend}"><div><span class="label">Dato del mes</span><h3 style="margin-top:6px">Mes ${pend}</h3><p class="small muted">Plazo: día ${E.DIA_LIMITE} del mes siguiente.</p></div>
            ${n.seguimiento.kpis.map(s => { const k = kpi(s.id), v = E.valoresKpi(n, s.id)[pend - 1]; return `<label class="field"><span class="small">${esc(k.nombre)} (${k.unidad})</span><input class="input num" inputmode="decimal" name="${k.id}" value="${numIn(v)}" ${puedeDato ? '' : 'disabled'}></label>`; }).join('')}
            ${puedeDato ? '<button class="btn" type="submit">Guardar datos del mes</button>' : '<p class="small muted">Aquí el responsable mete sus datos.</p>'}</form>`
          : `<section class="card cielo"><h3>Todo al día</h3><p class="muted" style="margin-top:8px">No tienes datos pendientes.</p></section>`) : ''}
        ${n.informe?.proximaVisita ? `<section class="card crema"><span class="label">Próxima visita</span><h3 style="margin-top:6px">${fecha(n.informe.proximaVisita)}</h3></section>` : ''}
        <section class="card"><h3 style="margin-bottom:16px">Tus 5 pilares</h3>${pilaresBars(p, n.diagnosticoFinal ? pIni : null)}</section>
        <a class="btn soft" href="#/informe/${n.id}">${ico.doc} Ver mi informe</a>
      </aside>
    </div>`;
  return layout(body, preview ? 'panel' : 'mi');
}

// ---------------- Informe ----------------
function informeView(n) {
  const u = yo();
  const pIni = E.puntuaciones(n);
  const p = n.diagnosticoFinal ? E.puntuaciones(n, n.diagnosticoFinal.respuestas) : pIni;
  const av = E.avanceDiagnostico(n, n.diagnosticoFinal ? n.diagnosticoFinal.respuestas : n.respuestas);
  const conf = n.prioridades?.confirmadas;
  const ids = conf ? n.prioridades.ids : E.prioridadesActuales(n);
  const acc = E.accionesDe(n, ids);
  const seg = n.seguimiento?.confirmado ? n.seguimiento : null;
  const meses = seg ? E.mesesVisibles(n) : 0;
  const pend = E.mesPendiente(n);
  const al = E.alertas(n).filter(a => a.tipo !== 'info' && !a.texto.startsWith('Falta el dato'));
  const t = E.accionesHechas(n);
  const consultora = S.datos().usuarios.find(x => x.rol === 'admin');
  const back = u.rol === 'dueno' ? '#/mi-negocio' : `#/negocio/${n.id}/resultados`;
  const destinatarios = S.usuariosDe(n.id).map(x => x.email).join(',');
  const asunto = encodeURIComponent(`Informe de ${n.nombre} · ${cfg().nombre}`);
  const cuerpo = encodeURIComponent(`Hola:\n\nTe envío el informe de ${n.nombre}.\n${cfg().indice}: ${p.indice} % (${p.nivel.nombre}).\nPrioridades: ${ids.map(id => pregunta(id).problema).join(' / ')}\n${n.informe?.proximaVisita ? 'Próxima visita: ' + fecha(n.informe.proximaVisita) + '\n' : ''}\nUn saludo,\n${consultora?.nombre || ''}`);
  return layout(`<div class="report">
    <div class="btns no-print" style="justify-content:space-between"><a class="crumb" href="${back}" style="margin:0">${ico.back} Volver</a>
      <div class="btns">${u.rol === 'admin' ? `<a class="btn sec" href="mailto:${esc(destinatarios)}?subject=${asunto}&body=${cuerpo}">${ico.mail} Enviar por correo</a>` : ''}<button class="btn" data-act="imprimir">${ico.doc} Descargar PDF</button></div></div>
    <header class="report-head"><div><span class="label">Informe para el cliente · ${fecha(E.ahora().toISOString())}</span><h1 style="margin-top:6px">${esc(n.nombre)}</h1>
      <p class="muted">${esc(n.tipo)} · ${esc(n.municipio)} · Fase: ${esc(E.fase(n).nombre)} · Consultora: ${esc(consultora?.nombre || '')}</p></div>
      <div class="brand-r"><span class="mark">${esc(marca())}</span>${esc(cfg().nombre)}</div></header>
    ${n.diagnosticoFinal ? comparativaCard(n) : `<div class="row" style="grid-template-columns:minmax(0,.8fr) minmax(0,1.3fr)">
      ${indiceCard(p, av)}<section class="card"><h3 style="margin-bottom:16px">Los 5 pilares</h3>${pilaresBars(p)}</section></div>`}
    ${n.informe?.valoracion ? `<section class="card mant"><h3 style="margin-bottom:10px">Valoración de la consultora</h3><p>${esc(n.informe.valoracion)}</p><p class="small muted" style="margin-top:10px">${esc(consultora?.nombre || '')}</p></section>` : ''}
    <section class="card"><h3 style="margin-bottom:6px">Prioridades ${conf ? '' : '(propuesta)'}</h3><p class="muted small" style="margin-bottom:16px">Los tres problemas que más pesan hoy y el protocolo para resolverlos.${conf ? ` Acciones hechas: ${t.hechas} de ${t.total}.` : ''}</p>
      <table><thead><tr><th>#</th><th>Problema</th><th>Pilar</th><th>Protocolo</th></tr></thead><tbody>
      ${ids.map((id, k) => { const q = pregunta(id); return `<tr><td>${k + 1}</td><td><b>${esc(q.problema)}</b><br><span class="muted small">${esc(q.texto)}</span></td><td>${esc(pilar(q.p).nombre)}</td><td>${q.prot}<br><span class="muted small">${esc(PROTOCOLOS[q.prot].nombre)}</span></td></tr>`; }).join('')}
      </tbody></table></section>
    ${seg ? `<section class="card"><h3 style="margin-bottom:6px">Evolución de los indicadores</h3><p class="muted small" style="margin-bottom:16px">Mes 1 = primer mes después de la línea base. Objetivo a 90 días.</p>
      <div style="overflow-x:auto"><table><thead><tr><th>Indicador</th><th class="r">Base</th>${Array.from({ length: meses }, (_, i) => `<th class="r">${mesCorto(n, i + 1)}</th>`).join('')}<th class="r">Objetivo</th><th class="r">Avance</th></tr></thead><tbody>
      ${seg.kpis.map(s => { const k = kpi(s.id), v = E.valoresKpi(n, s.id); const vals = Array.from({ length: meses }, (_, i) => v[i] ?? null); const act = [...vals].reverse().find(E.valorDef); const c = E.cumplimiento(k, E.baseEfectiva(n, s), s.objetivo, act);
        return `<tr><td><b>${esc(k.nombre)}</b></td><td class="r">${E.fmt(s.base, k.unidad)}</td>${vals.map(x => `<td class="r">${E.fmt(x, k.unidad)}</td>`).join('')}<td class="r">${E.fmt(s.objetivo, k.unidad)}</td><td class="r"><b>${c != null ? c + ' %' : '—'}</b></td></tr>`; }).join('')}
      </tbody></table></div>
      <div class="mini" style="margin-top:20px">${seg.kpis.map(s => { const k = kpi(s.id); const v = E.valoresKpi(n, s.id); return `<div><h4>${esc(k.nombre)}</h4>${lineaKpi(k, s.base, s.objetivo, Array.from({ length: meses }, (_, i) => v[i] ?? null), ['Base', ...Array.from({ length: meses }, (_, i) => mesCorto(n, i + 1))])}</div>`; }).join('')}</div>
    </section>` : ''}
    <section class="card mant"><h3 style="margin-bottom:14px">Próximas acciones</h3>
      <ul class="action-list">
        ${n.informe?.proximaVisita ? `<li>Próxima visita: ${fecha(n.informe.proximaVisita)}.</li>` : ''}
        ${pend && seg ? `<li>Registrar los datos del mes ${pend} (plazo: día ${E.DIA_LIMITE} del mes siguiente).</li>` : ''}
        ${!av.completo ? `<li>Terminar el diagnóstico (${av.hechas} de ${av.total} preguntas).</li>` : ''}
        ${al.map(a => `<li>Revisar: ${esc(a.texto.charAt(0).toLowerCase() + a.texto.slice(1))}.</li>`).join('')}
        ${acc.flatMap(a => a.acciones.filter(x => !x.hecha).slice(0, 1)).map(x => `<li>${esc(x.texto)}</li>`).join('')}
      </ul></section>
    <p class="small muted" style="text-align:center">${esc(cfg().nombre)} · ${esc(cfg().lema)} · Prototipo con datos ficticios</p>
  </div>`, 'informe');
}

// ---------------- Método (referencia) ----------------
function metodoView() {
  return layout(`
    <div class="head"><div><span class="label">El método codificado</span><h1 style="margin-top:6px">Método de diagnóstico</h1>
      <p class="muted">Fuente: Modelo de Diagnóstico v3. Dos consultoras llegan a las mismas prioridades con el mismo negocio.</p></div></div>
    <div class="row">${PILARES.map(p => `<section class="card"><span class="label">${p.id} · ${esc(p.area)}</span><h3 style="margin:6px 0 8px">${esc(p.nombre)}</h3><p class="small muted">${esc(p.desc)}</p></section>`).join('')}</div>
    <section class="card" style="margin-top:20px"><h3 style="margin-bottom:12px">Reglas</h3><ul class="action-list">
      <li>Respuesta: 0 no existe · 1 a veces o de palabra · 2 siempre y lo enseña · N/A no aplica (no cuenta).</li>
      <li>Pilar = puntos ÷ (2 × preguntas aplicables). ${esc(cfg().indice)} = media de los 5 pilares.</li>
      <li>Niveles: menos de 40 % crítico · 40 a 69 % en desarrollo · 70 % o más sólido.</li>
      <li>Prioridad = 2 × impacto + urgencia + viabilidad + sostenibilidad + bono de cimientos (+2 en P1 y P2 en nivel crítico).</li>
      <li>Candidatas: preguntas con 0; si hay menos de 3, también las de 1. Desempate: mayor impacto, después P1 y P2, después el orden.</li>
      <li>Activación digital: P4 y P5 no pueden ser prioridad hasta que P1 llegue al 40 %.</li>
      <li>Seguimiento: entre 3 y 6 de los 26 indicadores, dato mensual hasta el día ${E.DIA_LIMITE}, alerta si empeora dos meses seguidos.</li></ul></section>
    <section class="card" style="margin-top:20px"><h3 style="margin-bottom:12px">Las 24 preguntas</h3><div style="overflow-x:auto"><table class="table"><thead><tr><th>ID</th><th>Pregunta y evidencia</th><th>I</th><th>U</th><th>V</th><th>S</th><th>Base</th><th>Protocolo</th><th>KPI</th></tr></thead><tbody>
      ${PREGUNTAS.map(q => `<tr><td><b>${q.id}</b><br><span class="muted small">${q.p}</span></td><td>${esc(q.texto)}<br><span class="muted small">Enseñar: ${esc(q.evidencia)}</span></td><td>${q.imp}</td><td>${q.urg}</td><td>${q.via}</td><td>${q.sos}</td><td><b>${2 * q.imp + q.urg + q.via + q.sos}</b></td><td>${q.prot}</td><td>${q.kpis.join(', ')}</td></tr>`).join('')}
    </tbody></table></div></section>
    <section class="card" style="margin-top:20px"><h3 style="margin-bottom:12px">Banco de 26 indicadores</h3><div style="overflow-x:auto"><table class="table"><thead><tr><th>ID</th><th>Indicador</th><th>Cálculo</th><th>Tipo</th><th>Mejora si</th></tr></thead><tbody>
      ${KPIS.map(k => `<tr><td><b>${k.id}</b><br><span class="muted small">${k.p}</span></td><td>${esc(k.nombre)} (${k.unidad})</td><td class="small">${esc(k.formula)}</td><td class="small">${k.impl ? 'Requiere implantación' : 'Dato fácil'}</td><td class="small">${k.dir === 'up' ? 'Subir' : k.dir === 'down' ? 'Bajar' : 'Acercarse a 0'}</td></tr>`).join('')}
    </tbody></table></div></section>`, 'metodo');
}

// ---------------- Ajustes ----------------
function ajustesView() {
  const c = cfg(), a = S.datos().usuarios.find(u => u.rol === 'admin');
  return layout(`
    <div class="head"><div><span class="label">Administración</span><h1 style="margin-top:6px">Ajustes</h1>
      <p class="muted">El nombre definitivo está pendiente: cámbialo aquí y se actualiza en toda la plataforma y en los informes.</p></div></div>
    <div class="row" style="align-items:start">
      <form class="card stack" data-form="config" novalidate><h3>Nombre y marca</h3>
        <label class="field"><span>Nombre de la plataforma</span><input class="input" name="nombre" value="${esc(c.nombre)}"></label>
        <label class="field"><span>Nombre del índice</span><input class="input" name="indice" value="${esc(c.indice)}"></label>
        <label class="field"><span>Frase bajo el nombre</span><input class="input" name="lema" value="${esc(c.lema)}"></label>
        <button class="btn" type="submit" data-mut>Guardar</button></form>
      <form class="card stack" data-form="consultora" novalidate><h3>Acceso de la consultora</h3>
        <label class="field"><span>Nombre</span><input class="input" name="nombre" value="${esc(a.nombre)}"></label>
        <label class="field"><span>Correo</span><input class="input" type="email" name="email" value="${esc(a.email)}"></label>
        <label class="field"><span>Nueva contraseña</span><input class="input" type="password" name="password" placeholder="Déjala vacía para no cambiarla"></label>
        <p class="err" data-err></p>
        <button class="btn sec" type="submit" data-mut>Guardar acceso</button></form>
    </div>`, 'ajustes');
}

// ---------------- Enrutado ----------------
function render() {
  const u = yo();
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  ui.confirmar = ui.confirmarKeep ? ui.confirmar : null; ui.confirmarKeep = false;
  if (!u) { if (parts[0] !== 'login') history.replaceState(null, '', '#/login'); $app.innerHTML = loginView(); document.title = 'Entrar · ' + cfg().nombre; return; }
  const [r, a, b] = parts;
  let html, title = cfg().nombre;
  if (u.rol !== 'dueno') {
    const n = a ? S.negocio(a) : null;
    if (r === 'negocio' && a) { html = negocioView(a, b || 'resultados'); title = (n?.nombre || 'Negocio'); }
    else if (r === 'nuevo' && u.rol === 'admin') { html = nuevoView(); title = 'Nuevo negocio'; }
    else if (r === 'informe' && n) { html = informeView(n); title = 'Informe ' + n.nombre; }
    else if (r === 'vista-dueno' && n) { html = duenoView(n, true); title = 'Vista del dueño'; }
    else if (r === 'metodo') { html = metodoView(); title = 'Método'; }
    else if (r === 'ajustes' && u.rol === 'admin') { html = ajustesView(); title = 'Ajustes'; }
    else { if (r !== 'panel') history.replaceState(null, '', '#/panel'); html = panelView(); title = 'Panel'; }
  } else {
    if (r === 'mi-negocio' && a && u.negocioIds.includes(a)) ui.activo = a;
    const n = negocioActivo(u);
    if (!n) html = layout('<div class="card crema"><h3>Tu negocio ya no está disponible</h3><p class="muted" style="margin-top:8px">Habla con tu consultora.</p></div>');
    else if (r === 'informe' && a && u.negocioIds.includes(a)) { html = informeView(S.negocio(a)); title = 'Mi informe'; }
    else { if (r !== 'mi-negocio') history.replaceState(null, '', '#/mi-negocio'); html = duenoView(n); title = n.nombre; }
  }
  $app.innerHTML = html;
  document.title = title + (title === cfg().nombre ? '' : ' · ' + cfg().nombre);
  if (soloLectura()) $app.querySelectorAll('main input, main select, main textarea, [data-mut], .opt').forEach(el => { el.disabled = true; });
}

// ---------------- Acciones ----------------
const MUTA = new Set(['reset', 'eliminar', 'resp', 'confirmar-prio', 'desconfirmar', 'restaurar-prio', 'confirmar-kpi', 'cumplida', 'diag-final', 'quitar-acceso']);
document.addEventListener('click', async ev => {
  const el = ev.target.closest('[data-act]');
  if (!el || el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return;
  const act = el.dataset.act, id = el.dataset.id;
  if (soloLectura() && MUTA.has(act) && act !== 'reset') { toast('Cuenta de solo lectura'); return; }
  const dosPasos = (clave, fn) => { if (ui.confirmar === clave) fn(); else { ui.confirmar = clave; ui.confirmarKeep = true; render(); } };
  switch (act) {
    case 'modo': ui.loginModo = el.dataset.m; ui.enlace = null; render(); break;
    case 'demo': {
      const u = S.datos().usuarios.find(x => x.email === el.dataset.email);
      if (u.rol === 'dueno') { ui.enlace = u.email; render(); }
      else { const f = document.querySelector('[data-form="login"]'); f.email.value = u.email; f.password.value = S.DEMO_PASS; f.requestSubmit(); }
      break;
    }
    case 'abrir-enlace': { const u = S.entrarConEnlace(ui.enlace); ui.enlace = null; if (u) go('#/mi-negocio'); break; }
    case 'otro-correo': ui.enlace = null; render(); break;
    case 'salir': S.salir(); ui.activo = null; go('#/login'); break;
    case 'reset': dosPasos('reset', async () => { await S.restablecer(); ui.q = {}; ui.ronda = {}; S.salir(); toast('Datos de ejemplo restablecidos'); go('#/login'); }); break;
    case 'eliminar': dosPasos('eliminar-' + id, () => { S.eliminarNegocio(id); toast('Negocio eliminado'); go('#/panel'); }); break;
    case 'quitar-acceso': S.desvincularDueno(id, el.dataset.email); toast('Acceso retirado'); render(); break;
    case 'activo': ui.activo = id; render(); break;
    case 'ronda': ui.ronda[id] = el.dataset.r; render(); break;
    case 'pilar': {
      const n = S.negocio(id), ronda = ui.ronda[id] === 'final' && n.diagnosticoFinal ? 'final' : 'inicial', r = respuestasRonda(n, ronda);
      const qs = E.preguntasDe(n).map((q, i) => ({ q, i })).filter(x => x.q.p === el.dataset.p);
      ui.q[id + ronda] = (qs.find(x => !E.respondida(r[x.q.id])) || qs[0]).i; render(); break;
    }
    case 'qnav': ui.q[el.dataset.k] = Math.max(0, Number(el.dataset.to)); render(); break;
    case 'resp': {
      const raw = el.dataset.v, v = raw === 'na' ? 'na' : Number(raw), ronda = el.dataset.ronda;
      S.actualizar(id, n => {
        if (ronda === 'final') n.diagnosticoFinal.respuestas = { ...n.diagnosticoFinal.respuestas, [el.dataset.q]: v };
        else {
          n.respuestas = { ...(n.respuestas || {}), [el.dataset.q]: v };
          n.fechaDiagnostico = n.fechaDiagnostico || E.ahora().toISOString();
          if (n.prioridades && !n.prioridades.confirmadas) n.prioridades = { ids: [], confirmadas: false };
        }
      });
      el.closest('.opts').querySelectorAll('.opt').forEach(o => o.classList.toggle('on', o === el));
      const key = id + ronda, total = E.preguntasDe(S.negocio(id)).length;
      setTimeout(() => { if (ui.q[key] < total - 1) ui.q[key]++; render(); }, 160);
      break;
    }
    case 'confirmar-prio': {
      const n = S.negocio(id), cambiada = E.prioridadesActuales(n).join() !== E.prioridadesPropuestas(n).join();
      if (cambiada && !(n.prioridades?.motivo || '').trim()) { toast('Escribe el motivo del cambio'); document.querySelector('[data-act="motivo"]')?.focus(); return; }
      S.actualizar(id, x => { x.prioridades = { ids: E.prioridadesActuales(x), confirmadas: true, fecha: E.ahora().toISOString(), motivo: cambiada ? x.prioridades.motivo : '', cumplidas: [] }; });
      toast('Prioridades confirmadas'); go(`#/negocio/${id}/indicadores`); break;
    }
    case 'desconfirmar': S.actualizar(id, n => { n.prioridades.confirmadas = false; }); render(); break;
    case 'restaurar-prio': S.actualizar(id, n => { n.prioridades = { ids: [], confirmadas: false }; }); render(); break;
    case 'cumplida': dosPasos('cumplida-' + el.dataset.q, () => {
      S.actualizar(id, n => {
        const sig = E.candidatas(n).find(c => !n.prioridades.ids.includes(c.q.id) && !(n.prioridades.cumplidas || []).includes(c.q.id));
        if (!sig) return;
        n.prioridades.cumplidas = [...(n.prioridades.cumplidas || []), el.dataset.q];
        n.prioridades.ids = n.prioridades.ids.map(x => x === el.dataset.q ? sig.q.id : x);
      });
      toast('Prioridad cumplida: se activó la siguiente candidata'); render();
    }); break;
    case 'diag-final': dosPasos('final-' + id, () => {
      S.actualizar(id, n => { n.diagnosticoFinal = { fecha: E.ahora().toISOString(), respuestas: {} }; });
      ui.ronda[id] = 'final'; go(`#/negocio/${id}/diagnostico`);
    }); break;
    case 'confirmar-kpi':
      S.actualizar(id, n => { const d = E.ahora(); d.setDate(1); d.setHours(12, 0, 0, 0); n.seguimiento.confirmado = true; n.seguimiento.fecha = E.ahora().toISOString(); n.seguimiento.inicio = n.seguimiento.inicio || d.toISOString(); n.valores = n.valores || {}; });
      toast('Seguimiento mensual en marcha'); go(`#/negocio/${id}/seguimiento`); break;
    case 'imprimir': window.print(); break;
  }
});

document.addEventListener('change', ev => {
  const el = ev.target.closest('[data-act]');
  if (!el || soloLectura()) return;
  const act = el.dataset.act, id = el.dataset.id;
  const keep = () => { const y = window.scrollY; render(); window.scrollTo(0, y); };
  if (act === 'cambiar-prio' && el.value) {
    S.actualizar(id, n => { const ids = [...E.prioridadesActuales(n)]; ids[Number(el.dataset.k)] = el.value; n.prioridades = { ...(n.prioridades || {}), ids, confirmadas: false }; });
    keep();
  } else if (act === 'motivo') {
    S.actualizar(id, n => { n.prioridades.motivo = el.value; });
  } else if (act === 'kpi-toggle') {
    S.actualizar(id, n => {
      const ks = n.seguimiento.kpis;
      if (el.checked) { if (ks.length < 6 && !ks.some(s => s.id === el.dataset.k)) ks.push({ id: el.dataset.k, base: null, objetivo: null }); }
      else n.seguimiento.kpis = ks.filter(s => s.id !== el.dataset.k);
    });
    keep();
  } else if (act === 'kpi-val') {
    S.actualizar(id, n => { const s = n.seguimiento.kpis.find(x => x.id === el.dataset.k); s[el.dataset.f] = parseNum(el.value); });
    keep();
  } else if (act === 'mes-val') {
    S.actualizar(id, n => { n.valores = n.valores || {}; const arr = [...E.valoresKpi(n, el.dataset.k)]; arr[Number(el.dataset.m) - 1] = parseNum(el.value); n.valores[el.dataset.k] = arr; });
    keep(); toast('Dato guardado');
  } else if (act === 'accion') {
    S.actualizar(id, n => { n.acciones = n.acciones || {}; if (el.checked) n.acciones[el.dataset.k] = E.ahora().toISOString(); else delete n.acciones[el.dataset.k]; });
    keep();
  }
});

document.addEventListener('submit', async ev => {
  const f = ev.target.closest('[data-form]');
  if (!f) return;
  ev.preventDefault();
  const tipo = f.dataset.form, err = f.querySelector('[data-err]') || f.parentElement.querySelector('[data-err]');
  if (soloLectura() && !['login', 'enlace'].includes(tipo)) { toast('Cuenta de solo lectura'); return; }
  const fd = new FormData(f);
  if (tipo === 'login') {
    const u = await S.entrar(f.email.value, f.password.value);
    if (!u) { $app.innerHTML = loginView('Correo o contraseña incorrectos.'); return; }
    go('#/panel');
  } else if (tipo === 'enlace') {
    const u = S.usuarioDueno(f.email.value);
    if (!u) { $app.innerHTML = loginView('No encontramos ese correo. Pide acceso a tu consultora.'); return; }
    ui.enlace = u.email; render();
  } else if (tipo === 'nuevo') {
    const ficha = leerFicha(f);
    if (!ficha.nombre) { err.textContent = 'Escribe el nombre del negocio.'; f.nombre.focus(); return; }
    const email = (fd.get('duenoEmail') || '').trim().toLowerCase();
    if (email && S.datos().usuarios.some(u => u.email === email && u.rol !== 'dueno')) { err.textContent = 'Ese correo ya lo usa una consultora.'; return; }
    const n = S.crearNegocio(ficha, email ? { email, nombre: fd.get('duenoNombre') || 'Responsable' } : null);
    toast('Negocio creado'); go(`#/negocio/${n.id}/diagnostico`);
  } else if (tipo === 'ficha') {
    const ficha = leerFicha(f);
    if (!ficha.nombre) { toast('El nombre no puede quedar vacío'); return; }
    S.actualizar(f.dataset.id, n => Object.assign(n, ficha)); toast('Ficha guardada'); render();
  } else if (tipo === 'acceso') {
    const email = (fd.get('email') || '').trim();
    if (!email.includes('@')) { err.textContent = 'Escribe un correo válido.'; return; }
    if (!S.vincularDueno(f.dataset.id, email, fd.get('nombre') || 'Responsable')) { err.textContent = 'Ese correo es de una consultora.'; return; }
    toast('Acceso dado: entrará con un enlace al correo'); render();
  } else if (tipo === 'visita') {
    const nota = (fd.get('nota') || '').trim();
    if (!nota) { toast('Escribe las notas de la visita'); return; }
    S.actualizar(f.dataset.id, n => { n.visitas = [...(n.visitas || []), { id: S.uid(), fecha: new Date(fd.get('fecha') + 'T12:00:00').toISOString(), nota }]; });
    toast('Visita registrada'); render();
  } else if (tipo === 'notas') {
    S.actualizar(f.dataset.id, n => { n.notasPrivadas = fd.get('notas'); }); toast('Notas guardadas');
  } else if (tipo === 'informe') {
    S.actualizar(f.dataset.id, n => { n.informe = { valoracion: fd.get('valoracion'), proximaVisita: fd.get('proximaVisita') }; }); toast('Guardado para el informe');
  } else if (tipo === 'config') {
    S.guardarConfig({ nombre: fd.get('nombre').trim() || '[Nombre del proyecto]', indice: fd.get('indice').trim() || 'Índice', lema: fd.get('lema').trim() });
    toast('Nombre actualizado en toda la plataforma'); render();
  } else if (tipo === 'consultora') {
    const ok = await S.cambiarAccesoConsultora(fd.get('email') || '', fd.get('nombre'), fd.get('password'));
    if (!ok) { err.textContent = 'Ese correo ya lo usa otra cuenta.'; return; }
    toast('Acceso guardado'); render();
  } else if (tipo === 'dato-mes') {
    const m = Number(f.dataset.m);
    S.actualizar(f.dataset.id, n => {
      n.valores = n.valores || {};
      n.seguimiento.kpis.forEach(s => { const arr = [...E.valoresKpi(n, s.id)]; const v = parseNum(fd.get(s.id)); if (v !== null) arr[m - 1] = v; n.valores[s.id] = arr; });
    });
    toast('¡Gracias! Datos del mes guardados'); render(); window.scrollTo(0, 0);
  }
});

window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
(async () => { await S.cargar(); render(); })();
