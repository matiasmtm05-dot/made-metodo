// Contenido del Método Made: pilares, preguntas, protocolos e indicadores.
// Escala de respuesta: 0 = No existe · 1 = A veces o de palabra · 2 = Siempre y lo enseña · null = N/A

export const PILARES = [
  { id: 'P1', nombre: 'Caja clara', corto: 'Caja', cimiento: true,
    desc: 'Saber cuánto entra, cuánto sale y si el negocio gana dinero.' },
  { id: 'P2', nombre: 'Producto rentable', corto: 'Producto', cimiento: true,
    desc: 'Que cada plato y bebida tenga receta, coste y margen conocidos.' },
  { id: 'P3', nombre: 'Equipo que vende', corto: 'Equipo', cimiento: false,
    desc: 'Un equipo organizado, formado y con objetivos claros.' },
  { id: 'P4', nombre: 'Redes que atraen clientes', corto: 'Redes', cimiento: false, digital: true,
    desc: 'Presencia constante en redes, con plan y resultados medibles.' },
  { id: 'P5', nombre: 'Ventas por WhatsApp y fidelización', corto: 'WhatsApp', cimiento: false, digital: true,
    desc: 'Convertir consultas en ventas y conseguir que el cliente vuelva.' },
];

export const ESCALA = [
  { v: 0, t: '0', l: 'No existe' },
  { v: 1, t: '1', l: 'A veces o de palabra' },
  { v: 2, t: '2', l: 'Siempre y lo enseña' },
  { v: null, t: 'N/A', l: 'No aplica' },
];

export const PROTOCOLOS = {
  'MADE-01': { nombre: 'Registro diario de ventas y cierre de caja', acciones: [
    'Apuntar las ventas de cada día en el TPV o en la plantilla de cierre.',
    'Contar la caja al cerrar y anotar la diferencia con lo vendido.'] },
  'MADE-02': { nombre: 'Control de consumos, invitaciones y mermas', acciones: [
    'Usar la hoja de consumos: fecha, producto, persona y motivo.',
    'Revisar cada semana el total a precio de coste.'] },
  'MADE-03': { nombre: 'Control de gastos y separación de cuentas', acciones: [
    'Abrir o usar una cuenta solo del negocio y pagar todo desde ahí.',
    'Guardar cada factura y pasarla a la gestoría antes del día 5.'] },
  'MADE-04': { nombre: 'Recetas y escandallos', acciones: [
    'Escribir la receta con cantidades de los 10 productos más vendidos.',
    'Calcular el coste de cada uno y ajustar los precios que no dejan margen.'] },
  'MADE-05': { nombre: 'Compras e inventario', acciones: [
    'Contar almacén y cámara cada 15 días con la misma plantilla.',
    'Pedir precio a dos proveedores alternativos de los 5 productos clave.'] },
  'MADE-06': { nombre: 'Ingeniería de carta', acciones: [
    'Sacar el informe de ventas por producto de los últimos 3 meses.',
    'Quitar o cambiar los productos que no llegan al mínimo de ventas.'] },
  'MADE-07': { nombre: 'Organización y objetivos del equipo', acciones: [
    'Publicar el cuadrante de turnos y la lista de tareas por puesto.',
    'Contar al equipo el objetivo de ventas del mes y cómo va cada semana.'] },
  'MADE-08': { nombre: 'Protocolo de servicio y venta sugerida', acciones: [
    'Acordar por escrito los pasos de atención: saludo, recomendación y despedida.',
    'Hacer una formación corta de venta sugerida (postre, café, bebida).'] },
  'MADE-09': { nombre: 'Plan de contenidos en redes', acciones: [
    'Preparar un calendario mensual con 3 publicaciones por semana.',
    'Anunciar cada evento o promoción con una semana de antelación.'] },
  'MADE-10': { nombre: 'Publicidad con objetivo', acciones: [
    'Definir un objetivo por campaña (reservas, mensajes o visitas).',
    'Medir cuánto cuesta cada contacto y parar lo que no funciona.'] },
  'MADE-11': { nombre: 'Gestión de reseñas', acciones: [
    'Responder todas las reseñas en menos de 48 horas.',
    'Pedir la reseña al cliente contento al despedirle.'] },
  'MADE-12': { nombre: 'Atención y seguimiento por WhatsApp', acciones: [
    'Configurar WhatsApp Business con respuestas rápidas y horario.',
    'Etiquetar a quien pregunta y escribirle a las 48 horas si no reservó.'] },
  'MADE-13': { nombre: 'Venta directa: para llevar, encargos y eventos', acciones: [
    'Crear el catálogo de WhatsApp con precios de para llevar y encargos.',
    'Anunciar el catálogo en redes y en el local.'] },
  'MADE-14': { nombre: 'Base de clientes y fidelización', acciones: [
    'Recoger teléfono y permiso del cliente con un motivo claro (club, sorteo).',
    'Enviar un mensaje al mes con una razón para volver.'] },
};

// imp = impacto, urg = urgencia, via = viabilidad, sos = sostenibilidad (1 a 5)
export const PREGUNTAS = [
  // P1 Caja clara
  { id: 'Q01', p: 'P1', texto: '¿Se apuntan las ventas de cada día?',
    evidencia: 'El TPV o el cuaderno con las ventas del último mes.',
    problema: 'Sin registro diario de ventas no se puede medir nada.',
    imp: 5, urg: 5, via: 5, sos: 4, prot: 'MADE-01', kpis: ['K01', 'K02'] },
  { id: 'Q02', p: 'P1', texto: '¿Se cuenta la caja al cerrar y se compara con lo vendido?',
    evidencia: 'La hoja de cierre de caja de los últimos días.',
    problema: 'Descuadres de caja que nadie detecta a tiempo.',
    imp: 4, urg: 3, via: 5, sos: 4, prot: 'MADE-01', kpis: ['K03'] },
  { id: 'Q03', p: 'P1', texto: '¿Se apuntan las invitaciones, lo que consume el personal y lo que se regala?',
    evidencia: 'El registro con fecha, producto y persona.',
    problema: 'Producto que sale sin cobrarse y reduce el margen.',
    imp: 4, urg: 5, via: 5, sos: 4, prot: 'MADE-02', kpis: ['K04'] },
  { id: 'Q04', p: 'P1', texto: '¿Se apuntan todos los gastos y pagos, y la gestoría tiene los impuestos al día?',
    evidencia: 'El registro de gastos del último mes y la última declaración.',
    problema: 'Gastos sin control y riesgo fiscal.',
    imp: 4, urg: 4, via: 4, sos: 4, prot: 'MADE-03', kpis: ['K05', 'K06'] },
  { id: 'Q05', p: 'P1', texto: '¿El dinero del negocio está separado del dinero personal?',
    evidencia: 'Una cuenta bancaria solo del negocio.',
    problema: 'Dinero del negocio mezclado con el personal: no se sabe si gana o pierde.',
    imp: 3, urg: 3, via: 5, sos: 5, prot: 'MADE-03', kpis: ['K05'] },
  // P2 Producto rentable
  { id: 'Q06', p: 'P2', texto: '¿Cada plato o bebida tiene su receta con cantidades escritas?',
    evidencia: 'Las recetas escritas de 5 productos elegidos al azar.',
    problema: 'Sin recetas escritas cada plato sale distinto y no se puede costear.',
    imp: 4, urg: 3, via: 4, sos: 5, prot: 'MADE-04', kpis: ['K07'] },
  { id: 'Q07', p: 'P2', texto: '¿Sabe cuánto le cuesta cada plato y cuánto gana con él?',
    evidencia: 'El escandallo de 5 platos con coste y precio de venta.',
    problema: 'Precios sin relación con el coste; platos que no dejan margen.',
    imp: 5, urg: 4, via: 3, sos: 4, prot: 'MADE-04', kpis: ['K08', 'K09'] },
  { id: 'Q08', p: 'P2', texto: '¿Se cuenta con frecuencia lo que hay en el almacén y la cámara?',
    evidencia: 'El último inventario con fecha (máximo 15 días).',
    problema: 'Sin inventario no se detectan pérdidas ni roturas de stock.',
    imp: 3, urg: 3, via: 4, sos: 4, prot: 'MADE-05', kpis: ['K10'] },
  { id: 'Q09', p: 'P2', texto: '¿Se apunta lo que se tira y por qué?',
    evidencia: 'El registro de lo desechado con su causa.',
    problema: 'Producto que se tira sin saber por qué.',
    imp: 3, urg: 3, via: 5, sos: 4, prot: 'MADE-02', kpis: ['K11'] },
  { id: 'Q10', p: 'P2', texto: '¿Compara precios entre proveedores al menos una vez cada tres meses?',
    evidencia: 'Presupuestos o comparativa de los últimos 3 meses.',
    problema: 'Compras más caras de lo necesario.',
    imp: 3, urg: 2, via: 4, sos: 3, prot: 'MADE-05', kpis: ['K12', 'K08'] },
  { id: 'Q11', p: 'P2', texto: '¿Revisa la carta según lo que más y lo que menos se vende?',
    evidencia: 'El informe de ventas por producto y el último cambio de carta.',
    problema: 'Carta con platos que no se venden y ocupan cocina y dinero.',
    imp: 4, urg: 3, via: 4, sos: 4, prot: 'MADE-06', kpis: ['K13', 'K09'] },
  // P3 Equipo que vende
  { id: 'Q12', p: 'P3', texto: '¿Cada persona sabe por escrito cuáles son sus tareas y su horario?',
    evidencia: 'El cuadrante de turnos y la lista de tareas.',
    problema: 'Equipo sin funciones claras: errores y tiempos muertos.',
    imp: 3, urg: 3, via: 5, sos: 4, prot: 'MADE-07', kpis: ['K14'] },
  { id: 'Q13', p: 'P3', texto: '¿Hay una forma de atender al cliente acordada e igual para todos?',
    evidencia: 'El protocolo de atención escrito (o se observa en el servicio).',
    problema: 'Cada cliente recibe un servicio distinto según quién le atienda.',
    imp: 4, urg: 3, via: 4, sos: 4, prot: 'MADE-08', kpis: ['K15'] },
  { id: 'Q14', p: 'P3', texto: '¿El equipo recibe formación para atender y para recomendar o vender más?',
    evidencia: 'Fecha y contenido de la última formación.',
    problema: 'El equipo no recomienda ni vende más por mesa.',
    imp: 4, urg: 3, via: 4, sos: 4, prot: 'MADE-08', kpis: ['K02', 'K16'] },
  { id: 'Q15', p: 'P3', texto: '¿El equipo conoce los objetivos del negocio, como las ventas del mes?',
    evidencia: 'Un empleado sabe decir el objetivo del mes.',
    problema: 'El equipo no sabe qué se espera de él cada mes.',
    imp: 3, urg: 3, via: 5, sos: 4, prot: 'MADE-07', kpis: ['K17'] },
  // P4 Redes que atraen clientes
  { id: 'Q16', p: 'P4', texto: '¿Tiene perfil activo en Instagram o TikTok?',
    evidencia: 'Una publicación en los últimos 15 días.',
    problema: 'Si no publica, para muchos clientes el negocio no existe.',
    imp: 4, urg: 3, via: 5, sos: 3, prot: 'MADE-09', kpis: ['K18'] },
  { id: 'Q17', p: 'P4', texto: '¿Tiene alguna estrategia para administrar el Instagram o el TikTok?',
    evidencia: 'Un calendario o plan de contenidos.',
    problema: 'Publicaciones sin plan ni objetivo.',
    imp: 3, urg: 2, via: 4, sos: 4, prot: 'MADE-09', kpis: ['K18', 'K19'] },
  { id: 'Q18', p: 'P4', texto: '¿Ha usado pauta con un objetivo y midiendo el resultado?',
    evidencia: 'Los resultados de una campaña en el gestor de anuncios.',
    problema: 'Dinero en anuncios sin saber qué devuelve.',
    imp: 3, urg: 2, via: 3, sos: 3, prot: 'MADE-10', kpis: ['K20'] },
  { id: 'Q19', p: 'P4', texto: '¿Usa las redes para anunciar eventos y promociones planificados?',
    evidencia: 'El calendario de eventos (semanal, quincenal o mensual).',
    problema: 'Eventos y promociones que nadie se entera de que existen.',
    imp: 3, urg: 3, via: 4, sos: 3, prot: 'MADE-09', kpis: ['K21'] },
  { id: 'Q20', p: 'P4', texto: '¿Lee y responde las reseñas?',
    evidencia: 'Reseñas respondidas en los últimos 30 días.',
    problema: 'Reseñas sin responder que espantan a clientes nuevos.',
    imp: 4, urg: 4, via: 5, sos: 4, prot: 'MADE-11', kpis: ['K22', 'K15'] },
  // P5 Ventas por WhatsApp y fidelización
  { id: 'Q21', p: 'P5', texto: '¿Responde rápido y con mensajes preparados las consultas por WhatsApp y redes?',
    evidencia: 'WhatsApp Business con respuestas rápidas configuradas.',
    problema: 'Consultas que se enfrían por responder tarde.',
    imp: 4, urg: 4, via: 5, sos: 4, prot: 'MADE-12', kpis: ['K23'] },
  { id: 'Q22', p: 'P5', texto: '¿Hace seguimiento a quien preguntó y no compró o no reservó?',
    evidencia: 'Lista o etiquetas de seguimiento en WhatsApp.',
    problema: 'Clientes interesados que se pierden sin seguimiento.',
    imp: 4, urg: 3, via: 4, sos: 4, prot: 'MADE-12', kpis: ['K24'] },
  { id: 'Q23', p: 'P5', texto: '¿Vende por WhatsApp o internet productos para llevar, encargos o eventos?',
    evidencia: 'Catálogo y ventas del último mes por ese canal.',
    problema: 'Ventas para llevar, encargos y eventos sin un canal propio.',
    imp: 3, urg: 2, via: 3, sos: 4, prot: 'MADE-13', kpis: ['K25'] },
  { id: 'Q24', p: 'P5', texto: '¿Guarda los datos de los clientes, con su permiso, y les escribe para que vuelvan?',
    evidencia: 'La base de clientes y el último mensaje enviado.',
    problema: 'Clientes que vienen una vez y no vuelven.',
    imp: 4, urg: 2, via: 4, sos: 5, prot: 'MADE-14', kpis: ['K26'] },
];

// Banco de 26 indicadores. dir: 'up' mejora si sube · 'down' mejora si baja.
export const KPIS = [
  { id: 'K01', p: 'P1', nombre: 'Ventas netas del mes', unidad: '€', dir: 'up', impl: false,
    formula: 'Suma de ventas sin IVA del mes' },
  { id: 'K02', p: 'P1', nombre: 'Ticket medio', unidad: '€', dir: 'up', impl: false,
    formula: 'Ventas netas ÷ número de tickets' },
  { id: 'K03', p: 'P1', nombre: 'Descuadre de caja', unidad: '€', dir: 'down', impl: true,
    formula: 'Suma de diferencias entre caja contada y caja teórica' },
  { id: 'K04', p: 'P1', nombre: 'Consumos, invitaciones y regalos', unidad: '%', dir: 'down', impl: true,
    formula: 'Valor a coste de lo consumido, invitado o regalado ÷ ventas netas × 100' },
  { id: 'K05', p: 'P1', nombre: 'Resultado mensual', unidad: '€', dir: 'up', impl: true,
    formula: 'Ventas netas del mes − gastos del mes' },
  { id: 'K06', p: 'P1', nombre: 'Gastos fijos sobre ventas', unidad: '%', dir: 'down', impl: true,
    formula: 'Gastos fijos del mes ÷ ventas netas × 100' },
  { id: 'K07', p: 'P2', nombre: 'Productos con receta escrita', unidad: '%', dir: 'up', impl: true,
    formula: 'Productos con ficha técnica ÷ productos de la carta × 100' },
  { id: 'K08', p: 'P2', nombre: 'Coste de materia prima', unidad: '%', dir: 'down', impl: true,
    formula: 'Compras ajustadas por inventario ÷ ventas netas × 100' },
  { id: 'K09', p: 'P2', nombre: 'Margen medio por producto', unidad: '€', dir: 'up', impl: true,
    formula: 'Precio sin IVA − coste de la receta (media de la carta)' },
  { id: 'K10', p: 'P2', nombre: 'Diferencia de inventario', unidad: '%', dir: 'down', impl: true,
    formula: '(Stock teórico − stock contado) ÷ stock teórico × 100' },
  { id: 'K11', p: 'P2', nombre: 'Merma', unidad: '%', dir: 'down', impl: true,
    formula: 'Valor de lo desechado ÷ compras del mes × 100' },
  { id: 'K12', p: 'P2', nombre: 'Ahorro en compras', unidad: '€', dir: 'up', impl: true,
    formula: 'Diferencia de precio tras comparar proveedores × unidades compradas' },
  { id: 'K13', p: 'P2', nombre: 'Productos de baja venta en carta', unidad: 'nº', dir: 'down', impl: true,
    formula: 'Productos por debajo del 2 % de las ventas del mes' },
  { id: 'K14', p: 'P3', nombre: 'Coste de personal sobre ventas', unidad: '%', dir: 'down', impl: false,
    formula: 'Coste total de personal ÷ ventas netas × 100' },
  { id: 'K15', p: 'P3', nombre: 'Valoración media en reseñas', unidad: '/5', dir: 'up', impl: false,
    formula: 'Media de valoraciones de Google del mes' },
  { id: 'K16', p: 'P3', nombre: 'Mesas con venta sugerida', unidad: '%', dir: 'up', impl: true,
    formula: 'Mesas con postre, café o bebida extra ÷ mesas atendidas × 100' },
  { id: 'K17', p: 'P3', nombre: 'Cumplimiento del objetivo de ventas', unidad: '%', dir: 'up', impl: true,
    formula: 'Ventas netas ÷ objetivo del mes × 100' },
  { id: 'K18', p: 'P4', nombre: 'Publicaciones al mes', unidad: 'nº', dir: 'up', impl: false,
    formula: 'Publicaciones y reels en Instagram o TikTok en el mes' },
  { id: 'K19', p: 'P4', nombre: 'Alcance mensual', unidad: 'nº', dir: 'up', impl: false,
    formula: 'Cuentas alcanzadas en el mes (estadísticas de la red)' },
  { id: 'K20', p: 'P4', nombre: 'Coste por contacto o reserva', unidad: '€', dir: 'down', impl: true,
    formula: 'Inversión en anuncios ÷ contactos o reservas conseguidos' },
  { id: 'K21', p: 'P4', nombre: 'Ventas de eventos y promociones', unidad: '€', dir: 'up', impl: true,
    formula: 'Ventas atribuidas a eventos y promociones anunciados' },
  { id: 'K22', p: 'P4', nombre: 'Reseñas respondidas', unidad: '%', dir: 'up', impl: false,
    formula: 'Reseñas respondidas ÷ reseñas recibidas × 100' },
  { id: 'K23', p: 'P5', nombre: 'Tiempo medio de respuesta', unidad: 'min', dir: 'down', impl: true,
    formula: 'Minutos de media hasta la primera respuesta en WhatsApp' },
  { id: 'K24', p: 'P5', nombre: 'Consultas convertidas en venta', unidad: '%', dir: 'up', impl: true,
    formula: 'Consultas que acaban en venta o reserva ÷ consultas × 100' },
  { id: 'K25', p: 'P5', nombre: 'Ventas por WhatsApp e internet', unidad: '€', dir: 'up', impl: true,
    formula: 'Ventas de para llevar, encargos y eventos por canal directo' },
  { id: 'K26', p: 'P5', nombre: 'Clientes que repiten', unidad: '%', dir: 'up', impl: true,
    formula: 'Clientes de la base que volvieron en el mes ÷ clientes de la base × 100' },
];

export const TIPOS = ['Bar', 'Bar-cafetería', 'Restaurante', 'Repostería', 'Pastelería', 'Asador', 'Sidrería', 'Otro'];
export const MUNICIPIOS = ['Aretxabaleta', 'Arrasate-Mondragón', 'Bergara', 'Eskoriatza', 'Oñati', 'Antzuola', 'Elgeta', 'Leintz-Gatzaga', 'Otro'];
export const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
export const CANALES = ['Sala', 'Barra', 'Terraza', 'Para llevar', 'Apps de reparto', 'WhatsApp', 'Web propia', 'Encargos y eventos'];

export const FASES = [
  { id: 'ficha', nombre: 'Ficha', pct: 10 },
  { id: 'diagnostico', nombre: 'Diagnóstico', pct: 30 },
  { id: 'prioridades', nombre: 'Prioridades', pct: 45 },
  { id: 'indicadores', nombre: 'Indicadores', pct: 55 },
  { id: 'mes1', nombre: 'Seguimiento · mes 1', pct: 70 },
  { id: 'mes2', nombre: 'Seguimiento · mes 2', pct: 85 },
  { id: 'mes3', nombre: 'Cierre 90 días', pct: 100 },
];

export const pilar = id => PILARES.find(p => p.id === id);
export const pregunta = id => PREGUNTAS.find(q => q.id === id);
export const kpi = id => KPIS.find(k => k.id === id);
