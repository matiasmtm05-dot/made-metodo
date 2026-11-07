// Motor del método: puntuaciones, niveles, priorización, fases y alertas.
// Reglas según el «Modelo de Diagnóstico v3» (hoja Instrucciones) y las respuestas de la consultora.
import { PILARES, PREGUNTAS, KPIS, PROTOCOLOS, SOLO_SI_ELABORA, pilar, pregunta, kpi } from './data.js';

export const UMBRAL_DIGITAL = 40;   // P4 y P5 solo pueden ser prioridad cuando P1 llega al 40 %
export const UMBRAL_BONO = 40;      // bono de cimientos: P1 o P2 en nivel crítico
export const DIA_LIMITE = 5;        // el dato de un mes se mete como tarde el día 5 del mes siguiente
export const DIAS_SIN_AVANCE = 30;  // alerta de prioridad sin avances
export const MESES_PROGRAMA = 3;
export const MAX_MESES = 12;
const DIA = 86400000;

// Fecha simulada de la demostración: todo el prototipo trabaja en 2027 para que no aparezcan fechas reales.
export const FECHA_DEMO = '2027-07-14T12:00:00';
export const ahora = () => new Date(FECHA_DEMO);

export const respondida = v => v === 0 || v === 1 || v === 2 || v === 'na';
export const valorDef = v => v !== null && v !== undefined && v !== '' && !Number.isNaN(v);

export function nivel(pct) {
  if (pct == null) return { id: 'sin', nombre: 'Sin datos' };
  if (pct < 40) return { id: 'critico', nombre: 'Crítico' };
  if (pct < 70) return { id: 'desarrollo', nombre: 'En desarrollo' };
  return { id: 'solido', nombre: 'Sólido' };
}

// Preguntas que se le hacen a este negocio (Q06 y Q07 se ocultan si solo revende).
export function preguntasDe(n) {
  return PREGUNTAS.filter(q => !(n?.soloRevende && SOLO_SI_ELABORA.includes(q.id)));
}

export function avanceDiagnostico(n, resp = n.respuestas) {
  const r = resp || {};
  const qs = preguntasDe(n);
  const hechas = qs.filter(q => respondida(r[q.id])).length;
  return { hechas, total: qs.length, completo: hechas === qs.length };
}

// Pilar = puntos ÷ (2 × preguntas aplicables). Índice = media de los pilares con preguntas aplicables.
export function puntuaciones(n, resp = n.respuestas) {
  const r = resp || {};
  const qs = preguntasDe(n);
  const porPilar = PILARES.map(p => {
    const lista = qs.filter(q => q.p === p.id);
    let pts = 0, aplicables = 0, hechas = 0;
    lista.forEach(q => {
      const v = r[q.id];
      if (respondida(v)) hechas++;
      if (v === 0 || v === 1 || v === 2) { pts += v; aplicables++; }
    });
    const pct = aplicables ? Math.round(pts / (2 * aplicables) * 100) : null;
    const exacto = aplicables ? pts / (2 * aplicables) * 100 : null;
    return { ...p, pts, aplicables, hechas, total: lista.length, pct, exacto };
  });
  const conDatos = porPilar.filter(p => p.exacto != null);
  const indice = conDatos.length ? Math.round(conDatos.reduce((s, p) => s + p.exacto, 0) / conDatos.length) : null;
  const p1 = porPilar[0].exacto;
  const bloqueoDigital = p1 != null && p1 < UMBRAL_DIGITAL;
  porPilar.forEach(p => {
    p.bloqueado = !!p.digital && bloqueoDigital;
    p.nivel = nivel(p.pct);
  });
  return { pilares: porPilar, indice, nivel: nivel(indice), bloqueoDigital };
}

export function puntuarPregunta(q, pts) {
  const pil = pts.pilares.find(p => p.id === q.p);
  const bono = pilar(q.p).cimiento && pil.exacto != null && pil.exacto < UMBRAL_BONO ? 2 : 0;
  return { base: 2 * q.imp + q.urg + q.via + q.sos, bono, total: 2 * q.imp + q.urg + q.via + q.sos + bono };
}

// Candidatas: preguntas con 0 fuera de pilares bloqueados; si hay menos de 3, entran también las de 1.
// Desempate: puntuación, mayor impacto, P1 y P2 antes que el resto, orden de la pregunta.
export function candidatas(n, resp = n.respuestas) {
  const r = resp || {};
  const pts = puntuaciones(n, resp);
  const bloq = new Set(pts.pilares.filter(p => p.bloqueado).map(p => p.id));
  const libres = preguntasDe(n).filter(q => !bloq.has(q.p));
  const ceros = libres.filter(q => r[q.id] === 0);
  const elegibles = ceros.length >= 3 ? ceros : libres.filter(q => r[q.id] === 0 || r[q.id] === 1);
  return elegibles
    .map(q => ({ q, resp: r[q.id], ...puntuarPregunta(q, pts), orden: PREGUNTAS.indexOf(q) }))
    .sort((a, b) => b.total - a.total || b.q.imp - a.q.imp
      || (pilar(b.q.p).cimiento ? 1 : 0) - (pilar(a.q.p).cimiento ? 1 : 0) || a.orden - b.orden);
}

export const prioridadesPropuestas = n => candidatas(n).slice(0, 3).map(c => c.q.id);

export function prioridadesActuales(n) {
  const p = n.prioridades;
  if (p?.ids?.length) return p.ids;
  return prioridadesPropuestas(n);
}

export function kpisSugeridos(ids) {
  const out = [];
  ids.forEach(id => (pregunta(id)?.kpis || []).forEach(k => { if (!out.includes(k)) out.push(k); }));
  if (out.length < 3) ids.forEach(id => KPIS.filter(k => k.p === pregunta(id).p).forEach(k => {
    if (out.length < 3 && !out.includes(k.id)) out.push(k.id);
  }));
  return out.slice(0, 6);
}

// Plan de acción: un bloque por protocolo. Si dos prioridades comparten protocolo, se muestra una sola vez.
export const claveAccion = (prot, i) => `${prot}-${i}`;
export function accionesDe(n, ids) {
  const grupos = [];
  ids.forEach((id, k) => {
    const q = pregunta(id);
    let g = grupos.find(x => x.prot === q.prot);
    if (!g) {
      const prot = PROTOCOLOS[q.prot];
      g = { prot: q.prot, nombre: prot.nombre, q, preguntas: [], posiciones: [],
        acciones: prot.acciones.map((t, i) => ({ texto: t, clave: claveAccion(q.prot, i), hecha: n.acciones?.[claveAccion(q.prot, i)] || null })) };
      grupos.push(g);
    }
    g.preguntas.push(q); g.posiciones.push(k + 1);
  });
  return grupos;
}
export function accionesHechas(n) {
  if (!n.prioridades?.confirmadas) return { hechas: 0, total: 0 };
  const a = accionesDe(n, n.prioridades.ids).flatMap(x => x.acciones);
  return { hechas: a.filter(x => x.hecha).length, total: a.length };
}

// ---------- Fases del programa (90 días) ----------
export const FASES = [
  { id: 'diagnostico', nombre: 'Diagnóstico', cuando: 'Semana 0' },
  { id: 'linea-base', nombre: 'Línea base', cuando: 'Semanas 1 y 2' },
  { id: 'implantacion', nombre: 'Implantación', cuando: 'Semanas 3 a 8' },
  { id: 'consolidacion', nombre: 'Consolidación', cuando: 'Semanas 9 a 12' },
  { id: 'cierre', nombre: 'Cierre', cuando: 'Semana 12' },
  { id: 'continuidad', nombre: 'Continuidad', cuando: 'Desde el mes 4' },
];

export const semanaPrograma = (n, hoy = ahora()) =>
  n.prioridades?.fecha ? Math.floor((hoy - new Date(n.prioridades.fecha)) / DIA / 7) + 1 : 0;

export function fase(n, hoy = ahora()) {
  const d = avanceDiagnostico(n);
  if (!d.completo || !n.prioridades?.confirmadas)
    return { id: 'diagnostico', nombre: 'Diagnóstico', pct: Math.round(15 * d.hechas / d.total), semana: 0 };
  const s = semanaPrograma(n, hoy);
  if (!n.seguimiento?.confirmado || s <= 2) return { id: 'linea-base', nombre: 'Línea base', pct: 20, semana: s };
  if (n.diagnosticoFinal) return { id: 'continuidad', nombre: 'Continuidad', pct: 100, semana: s };
  if (s <= 8) return { id: 'implantacion', nombre: 'Implantación', pct: 20 + Math.round((s - 2) / 6 * 40), semana: s };
  if (s <= 12) return { id: 'consolidacion', nombre: 'Consolidación', pct: 60 + Math.round((s - 8) / 4 * 30), semana: s };
  return { id: 'cierre', nombre: 'Cierre', pct: 95, semana: s };
}

// ---------- Seguimiento mensual ----------
function sumarMeses(iso, m) { const d = new Date(iso); d.setDate(1); d.setHours(12, 0, 0, 0); d.setMonth(d.getMonth() + m); return d; }
export const mesFecha = (n, m) => sumarMeses(n.seguimiento.inicio, m - 1);
export const nombreMes = (n, m) => `mes ${m}`;
export function limiteMes(n, m) { const d = sumarMeses(n.seguimiento.inicio, m); d.setDate(DIA_LIMITE); d.setHours(23, 59, 0, 0); return d; }

// Meses cuyo plazo ya venció (día 5 del mes siguiente).
export function mesesVencidos(n, hoy = ahora()) {
  if (!n.seguimiento?.confirmado) return 0;
  let c = 0; while (c < MAX_MESES && hoy > limiteMes(n, c + 1)) c++;
  return c;
}
// Meses que se muestran: los 3 del programa y, en continuidad, los que vayan pasando.
export function mesesVisibles(n, hoy = ahora()) {
  if (!n.seguimiento?.confirmado) return MESES_PROGRAMA;
  const transcurridos = Math.floor((hoy - mesFecha(n, 1)) / DIA / 30.44) + 1;
  return Math.max(MESES_PROGRAMA, Math.min(MAX_MESES, transcurridos));
}

export const valoresKpi = (n, kid) => (n.valores && n.valores[kid]) || [];
export const mesCompleto = (n, m) => {
  const ks = n.seguimiento?.kpis || [];
  return ks.length > 0 && ks.every(k => valorDef(valoresKpi(n, k.id)[m - 1]));
};

// Mes que toca registrar: el primero incompleto que ya empezó.
export function mesPendiente(n, hoy = ahora()) {
  if (!n.seguimiento?.confirmado) return null;
  for (let m = 1; m <= MAX_MESES; m++) {
    if (mesFecha(n, m) > hoy) return null;
    if (!mesCompleto(n, m)) return m;
  }
  return null;
}

// Línea base efectiva: el valor inicial o, si estaba vacío, la primera medición.
export function baseEfectiva(n, s) {
  if (valorDef(s.base)) return Number(s.base);
  const v = valoresKpi(n, s.id).find(valorDef);
  return valorDef(v) ? Number(v) : null;
}

const peor = (k, a, b) => k.dir === 'up' ? b < a : k.dir === 'down' ? b > a : Math.abs(b) > Math.abs(a);
const mejor = (k, a, b) => k.dir === 'up' ? b > a : k.dir === 'down' ? b < a : Math.abs(b) < Math.abs(a);

export function tendencia(k, serie) {
  const vals = serie.filter(valorDef).map(Number);
  if (vals.length < 2) return null;
  const a = vals[vals.length - 2], b = vals[vals.length - 1];
  return mejor(k, a, b) ? 'mejora' : peor(k, a, b) ? 'empeora' : 'igual';
}

export function cumplimiento(k, base, obj, actual) {
  if (![base, obj, actual].every(valorDef)) return null;
  const b = k.dir === 'zero' ? Math.abs(base) : base, o = k.dir === 'zero' ? Math.abs(obj) : obj, a = k.dir === 'zero' ? Math.abs(actual) : actual;
  if (b === o) return null;
  return Math.max(-100, Math.min(150, Math.round((a - b) / (o - b) * 100)));
}

export function alertas(n, hoy = ahora()) {
  const out = [];
  const d = avanceDiagnostico(n);
  if (!d.completo) out.push({ tipo: d.hechas ? 'aviso' : 'info', texto: d.hechas ? `Diagnóstico sin terminar (${d.hechas} de ${d.total})` : 'Diagnóstico sin empezar', tab: 'diagnostico' });
  else if (!n.prioridades?.confirmadas) out.push({ tipo: 'info', texto: 'Prioridades pendientes de confirmar', tab: 'resultados' });
  else if (!n.seguimiento?.confirmado) out.push({ tipo: 'info', texto: 'Línea base: faltan los indicadores', tab: 'indicadores' });
  if (n.seguimiento?.confirmado) {
    const venc = mesesVencidos(n, hoy);
    for (let m = 1; m <= venc; m++) if (!mesCompleto(n, m))
      out.push({ tipo: 'alerta', texto: `Falta el dato del mes ${m} (plazo: día ${DIA_LIMITE} del mes siguiente)`, tab: 'seguimiento' });
    n.seguimiento.kpis.forEach(s => {
      const k = kpi(s.id);
      const serie = [s.base, ...valoresKpi(n, s.id)].filter(valorDef).map(Number);
      if (serie.length >= 3) {
        const [a, b, c] = serie.slice(-3);
        if (peor(k, a, b) && peor(k, b, c)) { out.push({ tipo: 'alerta', texto: `${k.nombre}: empeora dos meses seguidos`, tab: 'seguimiento' }); return; }
      }
      if (tendencia(k, serie) === 'empeora') out.push({ tipo: 'aviso', texto: `${k.nombre}: empeoró el último mes`, tab: 'seguimiento' });
    });
  }
  if (n.prioridades?.confirmadas && !n.diagnosticoFinal) {
    accionesDe(n, n.prioridades.ids).forEach(a => {
      const fechas = a.acciones.map(x => x.hecha).filter(Boolean).map(x => new Date(x));
      const desde = fechas.length ? Math.max(...fechas) : new Date(n.prioridades.fecha).getTime();
      const todas = a.acciones.every(x => x.hecha);
      if (!todas && (hoy - desde) / DIA > DIAS_SIN_AVANCE)
        out.push({ tipo: 'aviso', texto: `Prioridad sin avances en ${DIAS_SIN_AVANCE} días: ${a.nombre}`, tab: 'prioridades' });
    });
  }
  const f = fase(n, hoy);
  if (f.id === 'cierre') out.push({ tipo: 'info', texto: 'Semana 12: toca el diagnóstico final y el informe de cierre', tab: 'resultados' });
  return out;
}

export const fmt = (v, unidad) => {
  if (!valorDef(v)) return '—';
  const num = Number(v).toLocaleString('es-ES', { maximumFractionDigits: unidad === '/5' ? 1 : 2 });
  if (unidad === '€') return num + ' €';
  if (unidad === '%') return num + ' %';
  if (unidad === '/5') return num + ' / 5';
  if (['min', 'h', 'días'].includes(unidad)) return num + ' ' + unidad;
  return num;
};
