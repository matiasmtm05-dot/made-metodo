// Almacenamiento del prototipo: todo vive en el navegador (localStorage).
// La capa está aislada aquí para poder cambiarla por una base de datos en servidor (UE) más adelante.
import { PREGUNTAS } from './data.js';
import { prioridadesPropuestas, kpisSugeridos } from './engine.js';

const KEY = 'made.metodo.v1';
const SESSION = 'made.metodo.sesion';
export const DEMO_PASS = 'made2026';

const mem = { data: null, session: null }; // respaldo si el navegador bloquea el almacenamiento

function readLS(k) { try { return localStorage.getItem(k); } catch { return null; } }
function writeLS(k, v) { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } }

export async function hash(text) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('made·' + text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    let h = 0; for (const c of 'made·' + text) h = (h * 31 + c.charCodeAt(0)) | 0; return 'x' + h;
  }
}

export const uid = () => Math.random().toString(36).slice(2, 10);

function mesesAtras(n) {
  const d = new Date(); d.setDate(1); d.setHours(12, 0, 0, 0); d.setMonth(d.getMonth() - n);
  return d.toISOString();
}

function respuestasDe(lista) {
  const r = {};
  PREGUNTAS.forEach((q, i) => { if (lista[i] !== undefined) r[q.id] = lista[i]; });
  return r;
}

function serie(base, obj, pasos) {
  // pasos: fracciones del camino hacia el objetivo para cada mes
  return pasos.map(f => f === null ? null : Math.round((base + (obj - base) * f) * 100) / 100);
}

async function semilla() {
  const pass = await hash(DEMO_PASS);

  // 1 · Bar Txoko — en seguimiento, falta el mes 3 y un indicador empeora
  const txoko = {
    id: 'n-txoko', nombre: 'Bar Txoko', tipo: 'Bar-cafetería', municipio: 'Aretxabaleta',
    aforo: 40, ticket: 9.5, dias: ['L', 'M', 'X', 'J', 'V', 'S'], canales: ['Sala', 'Barra', 'Terraza'],
    creado: mesesAtras(4),
    respuestas: respuestasDe([2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 'na', 0]),
  };
  txoko.prioridades = { ids: prioridadesPropuestas(txoko), confirmadas: true, fecha: mesesAtras(3) };
  txoko.seguimiento = { confirmado: true, inicio: mesesAtras(3), kpis: [
    { id: 'K04', base: 4.8, objetivo: 2.5 },
    { id: 'K08', base: 38, objetivo: 32 },
    { id: 'K09', base: 3.1, objetivo: 3.8 },
    { id: 'K05', base: 1200, objetivo: 2500 },
    { id: 'K06', base: 41, objetivo: 36 },
  ] };
  txoko.valores = {
    K04: [4.1, 3.4, null], K08: [36.5, 35.2, null], K09: [3.25, 3.4, null],
    K05: [1050, 900, null], K06: [40, 39, null],
  };

  // 2 · Itsasargi — programa de 90 días completado
  const itsas = {
    id: 'n-itsasargi', nombre: 'Itsasargi Jatetxea', tipo: 'Restaurante', municipio: 'Arrasate-Mondragón',
    aforo: 70, ticket: 24, dias: ['M', 'X', 'J', 'V', 'S', 'D'], canales: ['Sala', 'Terraza', 'Encargos y eventos', 'WhatsApp'],
    creado: mesesAtras(5),
    respuestas: respuestasDe([2, 2, 2, 2, 2, 1, 1, 1, 0, 1, 0, 2, 1, 0, 1, 2, 1, 0, 1, 1, 1, 0, 1, 0]),
  };
  itsas.prioridades = { ids: prioridadesPropuestas(itsas), confirmadas: true, fecha: mesesAtras(4) };
  const kItsas = kpisSugeridos(itsas.prioridades.ids);
  const basesItsas = {
    K07: [35, 90], K08: [36, 30], K09: [8.2, 10], K11: [6, 3], K13: [9, 3], K10: [7, 3], K12: [0, 420],
    K15: [4.1, 4.5], K16: [18, 35], K02: [22.5, 25.5], K14: [38, 34], K17: [80, 100],
  };
  itsas.seguimiento = { confirmado: true, inicio: mesesAtras(4), kpis: kItsas.map(id => {
    const [b, o] = basesItsas[id] || [10, 15];
    return { id, base: b, objetivo: o };
  }) };
  itsas.valores = {};
  itsas.seguimiento.kpis.forEach((s, i) => {
    itsas.valores[s.id] = serie(s.base, s.objetivo, i === 1 ? [0.35, 0.3, 0.8] : [0.3, 0.65, 1.05]);
  });

  // 3 · Goxoki Etxea — diagnóstico a medias
  const goxoki = {
    id: 'n-goxoki', nombre: 'Goxoki Etxea', tipo: 'Repostería', municipio: 'Bergara',
    aforo: 12, ticket: 7, dias: ['M', 'X', 'J', 'V', 'S', 'D'], canales: ['Para llevar', 'Encargos y eventos', 'WhatsApp'],
    creado: mesesAtras(0),
    respuestas: respuestasDe([2, 1, 1, 1, 0, 2, 1, 0, 1, 1, 1, 1, 2, 0]),
  };

  return {
    version: 1,
    usuarios: [
      { email: 'consultora@made.demo', nombre: 'Natalí', rol: 'consultora', pass },
      { email: 'txoko@made.demo', nombre: 'Iñaki', rol: 'dueno', negocioId: 'n-txoko', pass },
      { email: 'itsasargi@made.demo', nombre: 'Maite', rol: 'dueno', negocioId: 'n-itsasargi', pass },
      { email: 'goxoki@made.demo', nombre: 'Ane', rol: 'dueno', negocioId: 'n-goxoki', pass },
    ],
    negocios: [txoko, itsas, goxoki],
  };
}

export async function cargar() {
  if (mem.data) return mem.data;
  const raw = readLS(KEY);
  if (raw) { try { mem.data = JSON.parse(raw); return mem.data; } catch { /* corrupto: se regenera */ } }
  mem.data = await semilla();
  guardar();
  return mem.data;
}

export function guardar() { writeLS(KEY, JSON.stringify(mem.data)); }

export async function restablecer() {
  mem.data = await semilla();
  guardar();
}

export const datos = () => mem.data;
export const negocio = id => mem.data.negocios.find(n => n.id === id);
export function actualizar(id, fn) { const n = negocio(id); fn(n); n.actualizado = new Date().toISOString(); guardar(); return n; }

export function sesion() {
  if (mem.session) return mem.session;
  const raw = readLS(SESSION);
  if (!raw) return null;
  const u = mem.data.usuarios.find(x => x.email === raw);
  mem.session = u || null;
  return mem.session;
}

export async function entrar(email, password) {
  const e = (email || '').trim().toLowerCase();
  const u = mem.data.usuarios.find(x => x.email === e);
  if (!u || u.pass !== await hash(password || '')) return null;
  mem.session = u; writeLS(SESSION, u.email);
  return u;
}

export function salir() { mem.session = null; writeLS(SESSION, null); }

export async function crearNegocio(ficha, acceso) {
  const id = 'n-' + uid();
  const n = { id, ...ficha, creado: new Date().toISOString(), respuestas: {} };
  mem.data.negocios.push(n);
  if (acceso?.email) {
    mem.data.usuarios.push({ email: acceso.email.trim().toLowerCase(), nombre: acceso.nombre || ficha.nombre,
      rol: 'dueno', negocioId: id, pass: await hash(acceso.password) });
  }
  guardar();
  return n;
}

export async function cambiarAcceso(negocioId, email, nombre, password) {
  const e = email.trim().toLowerCase();
  if (mem.data.usuarios.some(u => u.email === e && u.negocioId !== negocioId)) return false;
  let u = mem.data.usuarios.find(x => x.negocioId === negocioId);
  if (!u) { u = { rol: 'dueno', negocioId }; mem.data.usuarios.push(u); }
  u.email = e; u.nombre = nombre; if (password) u.pass = await hash(password);
  guardar();
  return true;
}

export const accesoDe = negocioId => mem.data.usuarios.find(u => u.negocioId === negocioId);
export function eliminarNegocio(id) {
  mem.data.negocios = mem.data.negocios.filter(n => n.id !== id);
  mem.data.usuarios = mem.data.usuarios.filter(u => u.negocioId !== id);
  guardar();
}
