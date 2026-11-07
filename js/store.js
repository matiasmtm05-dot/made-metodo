// Almacenamiento del prototipo: los datos (todos ficticios) viven en el navegador (localStorage).
// La capa está aislada aquí para conectarla después a la base de datos en la UE (Supabase, Fráncfort).
import { PREGUNTAS } from './data.js';
import { prioridadesPropuestas, kpisSugeridos } from './engine.js';

const KEY = 'plataforma.hosteleria.v2';
const SESSION = 'plataforma.hosteleria.sesion';
export const DEMO_PASS = 'demo2026';

const mem = { data: null, session: null };
function readLS(k) { try { return localStorage.getItem(k); } catch { return null; } }
function writeLS(k, v) { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } }

export async function hash(text) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ph·' + text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  } catch { let h = 0; for (const c of 'ph·' + text) h = (h * 31 + c.charCodeAt(0)) | 0; return 'x' + h; }
}
export const uid = () => Math.random().toString(36).slice(2, 10);

const hoy = () => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; };
const diasAtras = n => new Date(hoy().getTime() - n * 86400000).toISOString();
function primeroDeMes(atras) { const d = hoy(); d.setDate(1); d.setMonth(d.getMonth() - atras); return d.toISOString(); }
function resp(lista) { const r = {}; PREGUNTAS.forEach((q, i) => { if (lista[i] !== undefined) r[q.id] = lista[i]; }); return r; }

export const CONFIG_INICIAL = {
  nombre: '[Nombre del proyecto]',
  indice: 'Índice [nombre]',
  lema: 'Gestión y crecimiento para pequeña hostelería',
};

async function semilla() {
  const pass = await hash(DEMO_PASS);

  // 1 · Bar Txoko — consolidación; falta el dato de octubre y un indicador empeora dos meses seguidos.
  // Respuestas = ejemplo del Modelo de Diagnóstico v3 (índice 19 %, prioridades Q03, Q07 y Q04).
  const txoko = {
    id: 'n-txoko', nombre: 'Bar Txoko', tipo: 'Bar-cafetería', municipio: 'Aretxabaleta', soloRevende: false,
    aforo: 40, personas: 4, horario: '7:30 a 23:00', ventasRango: '10.000 a 20.000 €', ticket: 9.5, ticketsDia: 140,
    notaGoogle: 4.1, resenasGoogle: 86, tpvInformes: false, gestoria: true, redesQuien: 'El dueño', fichaGoogle: true,
    contacto: 'Iñaki (dueño)', preocupacion: 'Vendo bien pero a final de mes no me queda dinero.',
    dias: ['L', 'M', 'X', 'J', 'V', 'S'], canales: ['Sala', 'Barra', 'Terraza'],
    creado: diasAtras(75), fechaDiagnostico: diasAtras(72),
    respuestas: resp([1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 'na', 0]),
  };
  txoko.prioridades = { ids: prioridadesPropuestas(txoko), confirmadas: true, fecha: diasAtras(70), motivo: '' };
  txoko.seguimiento = { confirmado: true, fecha: diasAtras(62), inicio: primeroDeMes(2), kpis: [
    { id: 'K04', base: 4.8, objetivo: 2.5 },
    { id: 'K06', base: 38, objetivo: 32 },
    { id: 'K07', base: 3.1, objetivo: 3.8 },
    { id: 'K05', base: 1200, objetivo: 2500 },
  ] };
  txoko.valores = { K04: [5.1, 5.6], K06: [36.5, 35.2], K07: [3.25, 3.4], K05: [1050] };
  txoko.acciones = { 'Q03-0': diasAtras(60), 'Q07-0': diasAtras(25), 'Q07-1': diasAtras(12) };
  txoko.visitas = [
    { id: uid(), fecha: diasAtras(72), nota: 'Diagnóstico con Iñaki. Ventas fuertes en desayunos; nadie apunta lo que se invita.' },
    { id: uid(), fecha: diasAtras(55), nota: 'Arrancamos hoja de consumos. El equipo la usa solo en el turno de mañana.' },
    { id: uid(), fecha: diasAtras(20), nota: 'Escandallo de los 10 pinchos más vendidos. Dos dan pérdida: subir precio.' },
  ];
  txoko.notasPrivadas = 'Iñaki se resiste a apuntar invitaciones a amigos. Insistir con datos de octubre.';
  txoko.informe = { valoracion: 'El negocio vende bien, pero pierde margen en lo que sale sin cobrar. Los escandallos ya muestran dónde ajustar precios.', proximaVisita: diasAtras(-6).slice(0, 10) };

  // 2 · Itsasargi — programa de 90 días cerrado, diagnóstico final y continuidad.
  const itsas = {
    id: 'n-itsasargi', nombre: 'Itsasargi Jatetxea', tipo: 'Restaurante', municipio: 'Arrasate-Mondragón', soloRevende: false,
    aforo: 70, personas: 9, horario: '13:00 a 16:00 y 20:30 a 23:30', ventasRango: '40.000 a 80.000 €', ticket: 24, ticketsDia: 95,
    notaGoogle: 4.3, resenasGoogle: 412, tpvInformes: true, gestoria: true, redesQuien: 'Alguien del equipo', fichaGoogle: true,
    contacto: 'Maite (dueña)', preocupacion: 'Los platos nuevos no sé si dan dinero.',
    dias: ['M', 'X', 'J', 'V', 'S', 'D'], canales: ['Sala', 'Terraza', 'Encargos y eventos', 'WhatsApp'],
    creado: diasAtras(165), fechaDiagnostico: diasAtras(160),
    respuestas: resp([2, 2, 1, 2, 2, 0, 0, 1, 0, 1, 0, 2, 1, 0, 1, 2, 1, 0, 1, 1, 1, 0, 1, 0]),
  };
  itsas.prioridades = { ids: prioridadesPropuestas(itsas), confirmadas: true, fecha: diasAtras(158), motivo: '' };
  const kIts = kpisSugeridos(itsas.prioridades.ids);
  const bases = { K08: [30, 90], K06: [36, 30], K07: [8.2, 10], K10: [6, 3], K09: [12, 7], K11: [4, 0], K12: [9, 3], K13: [0, 4], K02: [22.5, 25] };
  itsas.seguimiento = { confirmado: true, fecha: diasAtras(150), inicio: primeroDeMes(5),
    kpis: kIts.map(id => ({ id, base: (bases[id] || [10, 15])[0], objetivo: (bases[id] || [10, 15])[1] })) };
  itsas.valores = {};
  itsas.seguimiento.kpis.forEach((s, i) => {
    const pasos = i === 1 ? [0.35, 0.3, 0.8, 0.95, 1.05] : [0.3, 0.65, 1.0, 1.05, 1.1];
    itsas.valores[s.id] = pasos.map(f => Math.round((s.base + (s.objetivo - s.base) * f) * 100) / 100);
  });
  itsas.acciones = {};
  itsas.prioridades.ids.forEach((q, i) => { itsas.acciones[q + '-0'] = diasAtras(140 - i * 10); itsas.acciones[q + '-1'] = diasAtras(110 - i * 10); });
  itsas.diagnosticoFinal = { fecha: diasAtras(70),
    respuestas: resp([2, 2, 2, 2, 2, 2, 1, 2, 1, 1, 1, 2, 2, 1, 1, 2, 1, 0, 1, 2, 1, 1, 1, 0]) };
  itsas.visitas = [
    { id: uid(), fecha: diasAtras(160), nota: 'Diagnóstico con Maite y el jefe de cocina.' },
    { id: uid(), fecha: diasAtras(120), nota: 'Recetas escritas de toda la carta de mediodía.' },
    { id: uid(), fecha: diasAtras(70), nota: 'Cierre de los 90 días y diagnóstico final.' },
  ];
  itsas.notasPrivadas = 'Buen candidato para la línea digital el próximo trimestre.';
  itsas.informe = { valoracion: 'En 90 días la cocina trabaja con recetas y escandallos: el coste de materia prima bajó al objetivo y el margen por plato subió.', proximaVisita: diasAtras(-12).slice(0, 10) };

  // 3 · Goxoki Etxea — diagnóstico a medias.
  const goxoki = {
    id: 'n-goxoki', nombre: 'Goxoki Etxea', tipo: 'Obrador', municipio: 'Bergara', soloRevende: false,
    aforo: 12, personas: 3, horario: '8:00 a 14:00 y 17:00 a 20:00', ventasRango: 'Menos de 10.000 €', ticket: 7, ticketsDia: 80,
    notaGoogle: 4.7, resenasGoogle: 58, tpvInformes: false, gestoria: true, redesQuien: 'Nadie', fichaGoogle: true,
    contacto: 'Ane (encargada)', preocupacion: 'Hacemos encargos por WhatsApp pero se nos olvidan.',
    dias: ['M', 'X', 'J', 'V', 'S', 'D'], canales: ['Para llevar', 'Encargos y eventos', 'WhatsApp'],
    creado: diasAtras(2), fechaDiagnostico: diasAtras(1),
    respuestas: resp([2, 1, 1, 1, 0, 2, 1, 0, 1, 1, 1, 1, 2, 0]),
  };

  return {
    version: 2,
    config: { ...CONFIG_INICIAL },
    usuarios: [
      { email: 'consultora@demo.es', nombre: 'Nataly Torres', rol: 'admin', pass },
      { email: 'evaluador@demo.es', nombre: 'Evaluador', rol: 'lectura', pass },
      { email: 'txoko@demo.es', nombre: 'Iñaki', rol: 'dueno', negocioIds: ['n-txoko', 'n-goxoki'] },
      { email: 'itsasargi@demo.es', nombre: 'Maite', rol: 'dueno', negocioIds: ['n-itsasargi'] },
      { email: 'goxoki@demo.es', nombre: 'Ane', rol: 'dueno', negocioIds: ['n-goxoki'] },
    ],
    negocios: [txoko, itsas, goxoki],
  };
}

export async function cargar() {
  if (mem.data) return mem.data;
  const raw = readLS(KEY);
  if (raw) { try { mem.data = JSON.parse(raw); if (mem.data.version === 2) return mem.data; } catch { /* se regenera */ } }
  mem.data = await semilla(); guardar(); return mem.data;
}
export function guardar() { writeLS(KEY, JSON.stringify(mem.data)); }
export async function restablecer() { mem.data = await semilla(); guardar(); }

export const datos = () => mem.data;
export const config = () => mem.data.config;
export function guardarConfig(c) { mem.data.config = { ...mem.data.config, ...c }; guardar(); }
export const negocio = id => mem.data.negocios.find(n => n.id === id);
export function actualizar(id, fn) { const n = negocio(id); fn(n); n.actualizado = new Date().toISOString(); guardar(); return n; }

export function sesion() {
  if (mem.session) return mem.session;
  const raw = readLS(SESSION);
  if (!raw) return null;
  mem.session = mem.data.usuarios.find(x => x.email === raw) || null;
  return mem.session;
}
function abrir(u) { mem.session = u; writeLS(SESSION, u.email); return u; }

export async function entrar(email, password) {
  const u = mem.data.usuarios.find(x => x.email === (email || '').trim().toLowerCase());
  if (!u || !u.pass || u.pass !== await hash(password || '')) return null;
  return abrir(u);
}
// Dueños: enlace al correo, sin contraseña. En el prototipo el enlace se abre en pantalla.
export function usuarioDueno(email) { return mem.data.usuarios.find(x => x.email === (email || '').trim().toLowerCase() && x.rol === 'dueno') || null; }
export function entrarConEnlace(email) { const u = usuarioDueno(email); return u ? abrir(u) : null; }
export function salir() { mem.session = null; writeLS(SESSION, null); }

export function crearNegocio(ficha, acceso) {
  const id = 'n-' + uid();
  const n = { id, ...ficha, creado: new Date().toISOString(), respuestas: {}, visitas: [], acciones: {} };
  mem.data.negocios.push(n);
  if (acceso?.email) vincularDueno(id, acceso.email, acceso.nombre);
  guardar();
  return n;
}
export function vincularDueno(negocioId, email, nombre) {
  const e = email.trim().toLowerCase();
  let u = mem.data.usuarios.find(x => x.email === e);
  if (u && u.rol !== 'dueno') return false;
  if (!u) { u = { email: e, nombre: nombre || 'Responsable', rol: 'dueno', negocioIds: [] }; mem.data.usuarios.push(u); }
  if (!u.negocioIds.includes(negocioId)) u.negocioIds.push(negocioId);
  guardar(); return true;
}
export function desvincularDueno(negocioId, email) {
  const u = mem.data.usuarios.find(x => x.email === email);
  if (!u) return;
  u.negocioIds = u.negocioIds.filter(x => x !== negocioId);
  if (!u.negocioIds.length) mem.data.usuarios = mem.data.usuarios.filter(x => x !== u);
  guardar();
}
export const usuariosDe = negocioId => mem.data.usuarios.filter(u => u.rol === 'dueno' && u.negocioIds.includes(negocioId));
export function eliminarNegocio(id) {
  mem.data.negocios = mem.data.negocios.filter(n => n.id !== id);
  mem.data.usuarios.forEach(u => { if (u.negocioIds) u.negocioIds = u.negocioIds.filter(x => x !== id); });
  mem.data.usuarios = mem.data.usuarios.filter(u => u.rol !== 'dueno' || u.negocioIds.length);
  guardar();
}
export async function cambiarAccesoConsultora(email, nombre, password) {
  const u = mem.data.usuarios.find(x => x.rol === 'admin');
  const e = email.trim().toLowerCase();
  if (mem.data.usuarios.some(x => x !== u && x.email === e)) return false;
  u.email = e; u.nombre = nombre || u.nombre; if (password) u.pass = await hash(password);
  if (mem.session === u) writeLS(SESSION, u.email);
  guardar(); return true;
}
