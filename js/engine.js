// Motor del Método Made: puntuaciones, niveles, priorización, fases y alertas.
import { PILARES, PREGUNTAS, KPIS, PROTOCOLOS, pilar, pregunta, kpi } from './data.js';

export const UMBRAL_CAJA = 40; // la línea digital se desbloquea con Caja clara ≥ 40 %
export const MESES = 3;

export const respondida = v => v === 0 || v === 1 || v === 2 || v === 'na';

export function nivel(pct) {
  if (pct == null) return { id: 'sin', nombre: 'Sin datos' };
  if (pct < 40) return { id: 'critico', nombre: 'Crítico' };
  if (pct < 60) return { id: 'construccion', nombre: 'En construcción' };
  if (pct < 80) return { id: 'solido', nombre: 'Sólido' };
  return { id: 'referente', nombre: 'Referente' };
}

export function avanceDiagnostico(n) {
  const r = n.respuestas || {};
  const hechas = PREGUNTAS.filter(q => respondida(r[q.id])).length;
  return { hechas, total: PREGUNTAS.length, completo: hechas === PREGUNTAS.length };
}

export function puntuaciones(n) {
  const r = n.respuestas || {};
  let totalPts = 0, totalMax = 0;
  const porPilar = PILARES.map(p => {
    const qs = PREGUNTAS.filter(q => q.p === p.id);
    let pts = 0, max = 0, hechas = 0;
    qs.forEach(q => {
      const v = r[q.id];
      if (respondida(v)) hechas++;
      if (v === 0 || v === 1 || v === 2) { pts += v; max += 2; }
    });
    totalPts += pts; totalMax += max;
    const pct = max ? Math.round(pts / max * 100) : null;
    return { ...p, pts, max, hechas, total: qs.length, pct };
  });
  const caja = porPilar[0].pct;
  const bloqueoDigital = caja == null || caja < UMBRAL_CAJA;
  porPilar.forEach(p => {
    p.bloqueado = !!p.digital && bloqueoDigital;
    p.nivel = p.bloqueado ? { id: 'bloqueado', nombre: 'Bloqueado' } : nivel(p.pct);
  });
  const indice = totalMax ? Math.round(totalPts / totalMax * 100) : null;
  return { pilares: porPilar, indice, nivel: nivel(indice), bloqueoDigital };
}

export function puntuarPregunta(q) {
  const bono = pilar(q.p).cimiento ? 2 : 0;
  return { total: 2 * q.imp + q.urg + q.via + q.sos + bono, bono };
}

// Candidatas: respondidas con 0 o 1, fuera de pilares bloqueados. Orden: puntuación, luego 0 antes que 1.
export function candidatas(n) {
  const r = n.respuestas || {};
  const { pilares } = puntuaciones(n);
  const bloqueados = new Set(pilares.filter(p => p.bloqueado).map(p => p.id));
  return PREGUNTAS
    .filter(q => (r[q.id] === 0 || r[q.id] === 1) && !bloqueados.has(q.p))
    .map((q, i) => ({ q, resp: r[q.id], ...puntuarPregunta(q), orden: PREGUNTAS.indexOf(q) }))
    .sort((a, b) => b.total - a.total || a.resp - b.resp || a.orden - b.orden);
}

export function prioridadesPropuestas(n) {
  return candidatas(n).slice(0, 3).map(c => c.q.id);
}

export function prioridadesActuales(n) {
  if (n.prioridades && n.prioridades.ids && n.prioridades.ids.length) return n.prioridades.ids;
  return prioridadesPropuestas(n);
}

export function kpisSugeridos(ids) {
  const out = [];
  ids.forEach(id => (pregunta(id)?.kpis || []).forEach(k => { if (!out.includes(k)) out.push(k); }));
  // mínimo 3: completa con indicadores del mismo pilar
  if (out.length < 3) {
    ids.forEach(id => KPIS.filter(k => k.p === pregunta(id).p).forEach(k => {
      if (out.length < 3 && !out.includes(k.id)) out.push(k.id);
    }));
  }
  return out.slice(0, 6);
}

export function accionesDe(ids) {
  return ids.map(id => {
    const q = pregunta(id);
    const prot = PROTOCOLOS[q.prot];
    return { q, prot: q.prot, nombre: prot.nombre, acciones: prot.acciones };
  });
}

// ---------- Seguimiento ----------
function mesesEntre(desdeISO, hasta = new Date()) {
  const d = new Date(desdeISO);
  return (hasta.getFullYear() - d.getFullYear()) * 12 + (hasta.getMonth() - d.getMonth());
}

export function nombreMes(inicioISO, m) {
  const d = new Date(inicioISO);
  d.setDate(1);
  d.setMonth(d.getMonth() + m - 1);
  return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

// Meses cuyo dato ya debería estar registrado (el mes m se registra al terminar ese mes).
export function mesesVencidos(n) {
  if (!n.seguimiento?.inicio) return 0;
  return Math.max(0, Math.min(MESES, mesesEntre(n.seguimiento.inicio)));
}

export function valoresKpi(n, kid) {
  return (n.valores && n.valores[kid]) || [null, null, null];
}

export function mesCompleto(n, m) {
  const ks = n.seguimiento?.kpis || [];
  return ks.length > 0 && ks.every(k => valorDef(valoresKpi(n, k.id)[m - 1]));
}

export const valorDef = v => v !== null && v !== undefined && v !== '' && !Number.isNaN(v);

export function mesesRegistrados(n) {
  let c = 0;
  for (let m = 1; m <= MESES; m++) { if (mesCompleto(n, m)) c = m; else break; }
  return c;
}

// Mes que toca registrar ahora (el primero incompleto), o null si el programa terminó.
export function mesPendiente(n) {
  if (!n.seguimiento?.confirmado) return null;
  for (let m = 1; m <= MESES; m++) if (!mesCompleto(n, m)) return m;
  return null;
}

export function fase(n) {
  const d = avanceDiagnostico(n);
  if (!d.completo) return { id: 'diagnostico', nombre: 'Diagnóstico', pct: 10 + Math.round(20 * d.hechas / d.total) };
  if (!n.prioridades?.confirmadas) return { id: 'prioridades', nombre: 'Prioridades', pct: 30 };
  if (!n.seguimiento?.confirmado) return { id: 'indicadores', nombre: 'Indicadores', pct: 45 };
  const reg = mesesRegistrados(n);
  if (reg >= MESES) return { id: 'cierre', nombre: 'Programa completado', pct: 100 };
  return { id: 'mes' + (reg + 1), nombre: `Seguimiento · mes ${reg + 1}`, pct: 55 + reg * 15 };
}

export function tendencia(k, serie) {
  const vals = serie.filter(valorDef);
  if (vals.length < 2) return null;
  const a = vals[vals.length - 2], b = vals[vals.length - 1];
  if (a === b) return 'igual';
  const mejora = k.dir === 'up' ? b > a : b < a;
  return mejora ? 'mejora' : 'empeora';
}

export function cumplimiento(k, base, obj, actual) {
  if (![base, obj, actual].every(valorDef) || base === obj) return null;
  const pct = Math.round((actual - base) / (obj - base) * 100);
  return Math.max(-100, Math.min(150, pct));
}

export function alertas(n) {
  const out = [];
  const d = avanceDiagnostico(n);
  if (!d.completo && d.hechas > 0) out.push({ tipo: 'aviso', texto: `Diagnóstico sin terminar (${d.hechas} de ${d.total})` });
  if (!d.completo && d.hechas === 0) out.push({ tipo: 'info', texto: 'Diagnóstico sin empezar' });
  if (d.completo && !n.prioridades?.confirmadas) out.push({ tipo: 'info', texto: 'Prioridades pendientes de confirmar' });
  if (n.prioridades?.confirmadas && !n.seguimiento?.confirmado) out.push({ tipo: 'info', texto: 'Indicadores pendientes de definir' });
  if (n.seguimiento?.confirmado) {
    const venc = mesesVencidos(n);
    for (let m = 1; m <= venc; m++) {
      if (!mesCompleto(n, m)) out.push({ tipo: 'alerta', texto: `Falta el dato del mes ${m} (${nombreMes(n.seguimiento.inicio, m)})` });
    }
    n.seguimiento.kpis.forEach(s => {
      const k = kpi(s.id);
      const serie = [s.base, ...valoresKpi(n, s.id)].filter(valorDef);
      if (serie.length >= 3) {
        const [a, b, c] = serie.slice(-3);
        const peor = (x, y) => k.dir === 'up' ? y < x : y > x;
        if (peor(a, b) && peor(b, c)) { out.push({ tipo: 'alerta', texto: `${k.nombre} empeora dos meses seguidos` }); return; }
      }
      if (tendencia(k, serie) === 'empeora') out.push({ tipo: 'aviso', texto: `${k.nombre} empeoró el último mes` });
    });
  }
  const { bloqueoDigital } = puntuaciones(n);
  if (d.completo && bloqueoDigital) out.push({ tipo: 'info', texto: 'Línea digital bloqueada hasta que Caja clara llegue al 40 %' });
  return out;
}

export const fmt = (v, unidad) => {
  if (!valorDef(v)) return '—';
  const num = Number(v).toLocaleString('es-ES', { maximumFractionDigits: unidad === '/5' ? 1 : 2 });
  if (unidad === '€') return num + ' €';
  if (unidad === '%') return num + ' %';
  if (unidad === '/5') return num + ' / 5';
  if (unidad === 'min') return num + ' min';
  return num;
};
