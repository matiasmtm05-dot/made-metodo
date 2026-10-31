// Gráficas en SVG, sin librerías externas, con la paleta de Made.
import { valorDef, fmt } from './engine.js';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Línea de evolución: base + meses, con la línea de objetivo punteada.
export function lineaKpi(k, base, objetivo, valores, etiquetas = ['Base', 'Mes 1', 'Mes 2', 'Mes 3']) {
  const W = 320, H = 150, pl = 8, pr = 8, pt = 18, pb = 26;
  const serie = [base, ...valores];
  const nums = [...serie, objetivo].filter(valorDef).map(Number);
  if (!nums.length) return '<p class="muted small">Sin datos todavía.</p>';
  let min = Math.min(...nums), max = Math.max(...nums);
  if (min === max) { min -= 1; max += 1; }
  const pad = (max - min) * 0.18; min -= pad; max += pad;
  const x = i => pl + i * (W - pl - pr) / (etiquetas.length - 1);
  const y = v => pt + (1 - (v - min) / (max - min)) * (H - pt - pb);
  const pts = serie.map((v, i) => valorDef(v) ? [x(i), y(Number(v)), v, i] : null).filter(Boolean);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = pts.length > 1 ? `${path} L${pts[pts.length - 1][0].toFixed(1)} ${H - pb} L${pts[0][0].toFixed(1)} ${H - pb} Z` : '';
  const yo = valorDef(objetivo) ? y(Number(objetivo)) : null;
  const ultimo = pts[pts.length - 1];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución de ${esc(k.nombre)}">
    ${etiquetas.map((t, i) => `<text x="${x(i)}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : i === etiquetas.length - 1 ? 'end' : 'middle'}" class="ax">${t}</text>`).join('')}
    <line x1="${pl}" x2="${W - pr}" y1="${H - pb}" y2="${H - pb}" class="base-ln"/>
    ${yo !== null ? `<line x1="${pl}" x2="${W - pr}" y1="${yo}" y2="${yo}" class="obj-ln"/>
      <text x="${W - pr}" y="${yo - 5}" text-anchor="end" class="obj-tx">Objetivo ${esc(fmt(objetivo, k.unidad))}</text>` : ''}
    ${area ? `<path d="${area}" class="area"/>` : ''}
    <path d="${path}" class="ln"/>
    ${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="${p === ultimo ? 5 : 3.5}" class="pt${p === ultimo ? ' last' : ''}"><title>${etiquetas[p[3]]}: ${esc(fmt(p[2], k.unidad))}</title></circle>`).join('')}
    ${ultimo ? `<text x="${Math.min(ultimo[0], W - 40)}" y="${ultimo[1] - 10}" text-anchor="middle" class="val">${esc(fmt(ultimo[2], k.unidad))}</text>` : ''}
  </svg>`;
}

// Radar de los 5 pilares.
export function radar(pilares, size = 260) {
  const c = size / 2, r = size / 2 - 40, n = pilares.length;
  const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n;
  const pt = (i, v) => [c + Math.cos(ang(i)) * r * v, c + Math.sin(ang(i)) * r * v];
  const ring = v => pilares.map((_, i) => pt(i, v).map(n => n.toFixed(1)).join(',')).join(' ');
  const datos = pilares.map((p, i) => pt(i, (p.pct || 0) / 100).map(n => n.toFixed(1)).join(',')).join(' ');
  return `<svg class="radar" viewBox="0 0 ${size} ${size}" role="img" aria-label="Puntuación por pilar">
    ${[0.25, 0.5, 0.75, 1].map(v => `<polygon points="${ring(v)}" class="ring"/>`).join('')}
    ${pilares.map((_, i) => { const [x, y] = pt(i, 1); return `<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" class="spoke"/>`; }).join('')}
    <polygon points="${datos}" class="shape"/>
    ${pilares.map((p, i) => { const [x, y] = pt(i, (p.pct || 0) / 100); return `<circle cx="${x}" cy="${y}" r="3.5" class="dot"/>`; }).join('')}
    ${pilares.map((p, i) => { const [x, y] = pt(i, 1.22); return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" class="lbl">${p.id} · ${p.pct ?? '—'}%</text>`; }).join('')}
  </svg>`;
}

// Anillo de progreso para el Índice Made.
export function anillo(pct, size = 148) {
  const r = size / 2 - 10, c = 2 * Math.PI * r, v = Math.max(0, Math.min(100, pct || 0));
  return `<svg class="ring-chart" viewBox="0 0 ${size} ${size}" aria-hidden="true">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="track"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="fill" stroke-dasharray="${(c * v / 100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
  </svg>`;
}
