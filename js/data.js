// Contenido del método. Fuente oficial: «Modelo de Diagnóstico v3» (Excel, 6-nov-2026) y «Respuestas para Matías».
// Escala de respuesta: 0 = No existe · 1 = A veces o de palabra · 2 = Siempre y lo enseña · 'na' = No aplica (no cuenta)

export const PILARES = [
  { id: 'P1', nombre: 'Gestión administrativa y financiera', area: 'Control económico', corto: 'Gestión', cimiento: true,
    desc: 'Saber cada día cuánto vendes, cuánto gastas y que la caja cuadra.' },
  { id: 'P2', nombre: 'Producto rentable', area: 'Producto, compras y costes', corto: 'Producto', cimiento: true,
    desc: 'Que cada plato y cada bebida dejen el margen que deben.' },
  { id: 'P3', nombre: 'Equipo de alto desempeño', area: 'Equipo y servicio', corto: 'Equipo', cimiento: false,
    desc: 'Un equipo organizado que atiende bien y sabe vender más.' },
  { id: 'P4', nombre: 'Administración estratégica de redes sociales', area: 'Presencia digital y captación', corto: 'Redes', cimiento: false, digital: true,
    desc: 'Que te encuentren y te elijan en Instagram y TikTok.' },
  { id: 'P5', nombre: 'Ventas por WhatsApp y fidelización', area: 'Gestión comercial y fidelización', corto: 'WhatsApp', cimiento: false, digital: true,
    desc: 'Convertir consultas en ventas y clientes en clientes que vuelven.' },
];

export const ESCALA = [
  { v: 0, t: '0', l: 'No existe' },
  { v: 1, t: '1', l: 'A veces o de palabra' },
  { v: 2, t: '2', l: 'Siempre y lo enseña' },
  { v: 'na', t: 'N/A', l: 'No aplica' },
];

// Protocolos oficiales P-01 a P-14 con dos acciones cada uno (los pasos completos los completa la consultora).
export const PROTOCOLOS = {
  'P-01': { nombre: 'Registro diario de ventas y cierre de caja', acciones: [
    'Apuntar las ventas de cada día en el TPV o en la plantilla de cierre.',
    'Contar la caja al cerrar y anotar la diferencia con lo vendido.'] },
  'P-02': { nombre: 'Control de consumos, invitaciones y mermas', acciones: [
    'Usar la hoja de consumos: fecha, producto, persona y motivo.',
    'Revisar cada semana el total a precio de coste.'] },
  'P-03': { nombre: 'Control de gastos y separación de cuentas', acciones: [
    'Usar una cuenta solo del negocio y pagar todo desde ahí.',
    'Guardar cada factura y pasarla a la gestoría antes del día 5.'] },
  'P-04': { nombre: 'Recetas y escandallos', acciones: [
    'Escribir la receta con cantidades de los 10 productos más vendidos.',
    'Calcular el coste de cada uno y ajustar los precios que no dejan margen.'] },
  'P-05': { nombre: 'Compras e inventario', acciones: [
    'Contar almacén y cámara cada 15 días con la misma plantilla.',
    'Pedir precio a dos proveedores alternativos de los 5 productos de más gasto.'] },
  'P-06': { nombre: 'Ingeniería de carta', acciones: [
    'Sacar el informe de ventas por producto de los últimos 3 meses.',
    'Quitar o cambiar los productos que no llegan al mínimo de ventas.'] },
  'P-07': { nombre: 'Organización y objetivos del equipo', acciones: [
    'Publicar el cuadrante de turnos y la lista de tareas por puesto.',
    'Contar al equipo el objetivo de ventas del mes y cómo va cada semana.'] },
  'P-08': { nombre: 'Protocolo de servicio y venta sugerida', acciones: [
    'Acordar por escrito los pasos de atención: saludo, recomendación y despedida.',
    'Hacer una formación corta de venta sugerida (postre, café, bebida).'] },
  'P-09': { nombre: 'Plan de contenidos en redes', acciones: [
    'Preparar un calendario mensual con 3 publicaciones por semana.',
    'Anunciar cada evento o promoción con una semana de antelación.'] },
  'P-10': { nombre: 'Publicidad con objetivo', acciones: [
    'Definir un objetivo por campaña (reservas, mensajes o visitas).',
    'Medir cuánto cuesta cada cliente captado y parar lo que no funciona.'] },
  'P-11': { nombre: 'Gestión de reseñas', acciones: [
    'Responder todas las reseñas en menos de 48 horas.',
    'Pedir la reseña al cliente contento al despedirle.'] },
  'P-12': { nombre: 'Atención y seguimiento por WhatsApp', acciones: [
    'Configurar WhatsApp Business con respuestas rápidas y horario.',
    'Etiquetar a quien pregunta y escribirle a las 48 horas si no reservó.'] },
  'P-13': { nombre: 'Venta directa: para llevar, encargos y eventos', acciones: [
    'Crear el catálogo de WhatsApp con precios de para llevar y encargos.',
    'Anunciar el catálogo en redes y en el local.'] },
  'P-14': { nombre: 'Base de clientes y fidelización', acciones: [
    'Recoger teléfono y permiso del cliente con un motivo claro (club, sorteo).',
    'Enviar un mensaje al mes con una razón para volver.'] },
};

// Preguntas que se ocultan si el negocio solo revende y no elabora producto.
export const SOLO_SI_ELABORA = ['Q06', 'Q07'];

// imp = impacto, urg = urgencia, via = viabilidad, sos = sostenibilidad (1 a 5). kpis = KPI de seguimiento.
export const PREGUNTAS = [
  { id: "Q01", p: "P1", texto: "¿Se apuntan las ventas de cada día?",
    evidencia: "El TPV o el cuaderno con las ventas del último mes.",
    problema: "No sabe cuánto vende ni si gana dinero.",
    imp: 5, urg: 5, via: 5, sos: 4, prot: "P-01", kpis: ["K01", "K02"] },
  { id: "Q02", p: "P1", texto: "¿Se cuenta la caja al cerrar y se compara con lo vendido?",
    evidencia: "La hoja de cierre de caja de los últimos días.",
    problema: "Se pierde dinero en caja sin detectarlo.",
    imp: 4, urg: 5, via: 5, sos: 5, prot: "P-01", kpis: ["K03"] },
  { id: "Q03", p: "P1", texto: "¿Se apuntan las invitaciones, lo que consume el personal y lo que se regala?",
    evidencia: "El registro con fecha, producto y persona.",
    problema: "Producto que sale sin cobrarse y reduce el margen.",
    imp: 4, urg: 5, via: 5, sos: 4, prot: "P-02", kpis: ["K04"] },
  { id: "Q04", p: "P1", texto: "¿Se apuntan todos los gastos y pagos, y la gestoría tiene los impuestos al día?",
    evidencia: "El registro de gastos del último mes y la última declaración.",
    problema: "Gastos sin control y riesgo fiscal.",
    imp: 4, urg: 4, via: 4, sos: 4, prot: "P-03", kpis: ["K05"] },
  { id: "Q05", p: "P1", texto: "¿El dinero del negocio está separado del dinero personal?",
    evidencia: "Una cuenta bancaria solo del negocio.",
    problema: "No se sabe qué gana el negocio y qué se lleva el dueño.",
    imp: 3, urg: 3, via: 5, sos: 5, prot: "P-03", kpis: ["K05"] },
  { id: "Q06", p: "P2", texto: "¿Cada plato o bebida tiene su receta con cantidades escritas?",
    evidencia: "Las recetas escritas de 5 productos elegidos al azar.",
    problema: "Porciones y costes distintos cada día.",
    imp: 4, urg: 3, via: 3, sos: 5, prot: "P-04", kpis: ["K08"] },
  { id: "Q07", p: "P2", texto: "¿Sabe cuánto le cuesta cada plato y cuánto gana con él?",
    evidencia: "El cálculo de coste y margen de 3 platos.",
    problema: "Precios sin relación con el coste; platos que no dejan margen.",
    imp: 5, urg: 4, via: 3, sos: 4, prot: "P-04", kpis: ["K06", "K07"] },
  { id: "Q08", p: "P2", texto: "¿Se cuenta con frecuencia lo que hay en el almacén y la cámara?",
    evidencia: "El último inventario con fecha (máximo 15 días).",
    problema: "Compras sin saber qué hay; roturas de stock o exceso.",
    imp: 4, urg: 3, via: 3, sos: 3, prot: "P-05", kpis: ["K09"] },
  { id: "Q09", p: "P2", texto: "¿Se apunta lo que se tira y por qué?",
    evidencia: "El registro de lo desechado con su causa.",
    problema: "Producto desechado sin saber cuánto ni por qué.",
    imp: 4, urg: 3, via: 4, sos: 4, prot: "P-02", kpis: ["K10"] },
  { id: "Q10", p: "P2", texto: "¿Compara precios entre proveedores al menos una vez cada tres meses?",
    evidencia: "Presupuestos o comparativa de los últimos 3 meses.",
    problema: "Se paga de más a proveedores.",
    imp: 3, urg: 2, via: 4, sos: 3, prot: "P-05", kpis: ["K11"] },
  { id: "Q11", p: "P2", texto: "¿Revisa la carta según lo que más y lo que menos se vende?",
    evidencia: "El informe de ventas por producto y el último cambio de carta.",
    problema: "Carta con productos que no se venden.",
    imp: 3, urg: 2, via: 4, sos: 4, prot: "P-06", kpis: ["K12"] },
  { id: "Q12", p: "P3", texto: "¿Cada persona sabe por escrito cuáles son sus tareas y su horario?",
    evidencia: "El cuadrante de turnos y la lista de tareas.",
    problema: "Tareas que nadie asume o se duplican.",
    imp: 2, urg: 3, via: 5, sos: 4, prot: "P-07", kpis: ["K14"] },
  { id: "Q13", p: "P3", texto: "¿Hay una forma de atender al cliente acordada e igual para todos?",
    evidencia: "El protocolo de atención escrito (o se observa en el servicio).",
    problema: "Servicio irregular según quién atienda.",
    imp: 3, urg: 3, via: 5, sos: 4, prot: "P-08", kpis: ["K20"] },
  { id: "Q14", p: "P3", texto: "¿El equipo recibe formación para atender y para recomendar o vender más?",
    evidencia: "Fecha y contenido de la última formación.",
    problema: "Equipo que atiende pero no vende.",
    imp: 3, urg: 3, via: 4, sos: 3, prot: "P-08", kpis: ["K13", "K02"] },
  { id: "Q15", p: "P3", texto: "¿El equipo conoce los objetivos del negocio, como las ventas del mes?",
    evidencia: "Un empleado sabe decir el objetivo del mes.",
    problema: "Equipo sin rumbo ni motivación.",
    imp: 2, urg: 2, via: 4, sos: 3, prot: "P-07", kpis: ["K14", "K01"] },
  { id: "Q16", p: "P4", texto: "¿Tiene perfil activo en Instagram o TikTok?",
    evidencia: "Una publicación en los últimos 15 días.",
    problema: "Negocio invisible para clientes nuevos.",
    imp: 3, urg: 3, via: 5, sos: 3, prot: "P-09", kpis: ["K15", "K17"] },
  { id: "Q17", p: "P4", texto: "¿Tiene alguna estrategia para administrar el Instagram o el TikTok?",
    evidencia: "Un calendario o plan de contenidos.",
    problema: "Fotos sin objetivo que no crean comunidad.",
    imp: 3, urg: 3, via: 4, sos: 4, prot: "P-09", kpis: ["K16", "K17"] },
  { id: "Q18", p: "P4", texto: "¿Ha usado pauta con un objetivo y midiendo el resultado?",
    evidencia: "Los resultados de una campaña en el gestor de anuncios.",
    problema: "Dinero en publicidad sin saber qué devuelve, o ningún uso.",
    imp: 3, urg: 2, via: 3, sos: 3, prot: "P-10", kpis: ["K18"] },
  { id: "Q19", p: "P4", texto: "¿Usa las redes para anunciar eventos y promociones planificados?",
    evidencia: "El calendario de eventos (semanal, quincenal o mensual).",
    problema: "Promociones improvisadas sin resultado medido.",
    imp: 3, urg: 2, via: 4, sos: 3, prot: "P-09", kpis: ["K19"] },
  { id: "Q20", p: "P4", texto: "¿Lee y responde las reseñas?",
    evidencia: "Reseñas respondidas en los últimos 30 días.",
    problema: "Mala reputación sin respuesta.",
    imp: 3, urg: 3, via: 5, sos: 4, prot: "P-11", kpis: ["K20", "K21"] },
  { id: "Q21", p: "P5", texto: "¿Responde rápido y con mensajes preparados las consultas por WhatsApp y redes?",
    evidencia: "WhatsApp Business con respuestas rápidas configuradas.",
    problema: "Consultas perdidas por respuesta lenta o improvisada.",
    imp: 4, urg: 3, via: 5, sos: 4, prot: "P-12", kpis: ["K22", "K23"] },
  { id: "Q22", p: "P5", texto: "¿Hace seguimiento a quien preguntó y no compró o no reservó?",
    evidencia: "Lista o etiquetas de seguimiento en WhatsApp.",
    problema: "Ventas perdidas por falta de seguimiento.",
    imp: 4, urg: 3, via: 5, sos: 4, prot: "P-12", kpis: ["K23"] },
  { id: "Q23", p: "P5", texto: "¿Vende por WhatsApp o internet productos para llevar, encargos o eventos?",
    evidencia: "Catálogo y ventas del último mes por ese canal.",
    problema: "Ingresos posibles que no se aprovechan.",
    imp: 4, urg: 2, via: 3, sos: 4, prot: "P-13", kpis: ["K24"] },
  { id: "Q24", p: "P5", texto: "¿Guarda los datos de los clientes, con su permiso, y les escribe para que vuelvan?",
    evidencia: "La base de clientes y el último mensaje enviado.",
    problema: "Los clientes no vuelven y no hay forma de contactarlos.",
    imp: 4, urg: 2, via: 3, sos: 4, prot: "P-14", kpis: ["K25", "K26"] },
];

// Banco oficial de 26 KPI. dir: 'up' mejora si sube · 'down' mejora si baja · 'zero' mejora si se acerca a 0.
// impl: true = requiere implantación (el negocio aún no tiene el dato) · false = dato fácil.
export const KPIS = [
  { id: "K01", p: "P1", nombre: "Ventas mensuales", unidad: "€", dir: "up", impl: false,
    formula: "Suma de ventas netas del mes", preguntas: ["Q01", "Q15"] },
  { id: "K02", p: "P1", nombre: "Ticket medio", unidad: "€", dir: "up", impl: false,
    formula: "Ventas netas ÷ número de tickets", preguntas: ["Q01", "Q14"] },
  { id: "K03", p: "P1", nombre: "Descuadre de caja", unidad: "%", dir: "zero", impl: true,
    formula: "(Caja contada − caja teórica) ÷ ventas del turno × 100", preguntas: ["Q02"] },
  { id: "K04", p: "P1", nombre: "Consumos, invitaciones y regalos", unidad: "%", dir: "down", impl: true,
    formula: "Valor a precio de coste de lo consumido, invitado o regalado ÷ ventas netas × 100", preguntas: ["Q03"] },
  { id: "K05", p: "P1", nombre: "Resultado mensual", unidad: "€", dir: "up", impl: true,
    formula: "Ventas netas del mes − gastos del mes", preguntas: ["Q04", "Q05"] },
  { id: "K06", p: "P2", nombre: "Coste de materia prima", unidad: "%", dir: "down", impl: true,
    formula: "Compras ajustadas por inventario ÷ ventas netas × 100", preguntas: ["Q07"] },
  { id: "K07", p: "P2", nombre: "Margen por producto", unidad: "€", dir: "up", impl: true,
    formula: "Precio sin IVA − coste de la receta", preguntas: ["Q07"] },
  { id: "K08", p: "P2", nombre: "Recetas con cantidades escritas", unidad: "%", dir: "up", impl: false,
    formula: "Productos con receta ÷ productos de la carta × 100", preguntas: ["Q06"] },
  { id: "K09", p: "P2", nombre: "Días de inventario", unidad: "días", dir: "down", impl: true,
    formula: "Valor del inventario ÷ coste diario medio de materia prima", preguntas: ["Q08"] },
  { id: "K10", p: "P2", nombre: "Merma", unidad: "%", dir: "down", impl: true,
    formula: "Valor de lo desechado ÷ valor de lo comprado × 100", preguntas: ["Q09"] },
  { id: "K11", p: "P2", nombre: "Variación de precio de proveedores", unidad: "%", dir: "down", impl: true,
    formula: "(Precio actual − precio de referencia) ÷ precio de referencia × 100, en los 10 productos de más gasto", preguntas: ["Q10"] },
  { id: "K12", p: "P2", nombre: "Productos de baja rotación", unidad: "nº", dir: "down", impl: true,
    formula: "Productos con menos del 2 % de las unidades vendidas en el mes", preguntas: ["Q11"] },
  { id: "K13", p: "P3", nombre: "Horas de formación por empleado", unidad: "h", dir: "up", impl: false,
    formula: "Horas de formación del trimestre ÷ empleados", preguntas: ["Q14"] },
  { id: "K14", p: "P3", nombre: "Rotación de personal", unidad: "%", dir: "down", impl: false,
    formula: "Bajas del año ÷ plantilla media × 100", preguntas: ["Q12", "Q15"] },
  { id: "K15", p: "P4", nombre: "Publicaciones al mes", unidad: "nº", dir: "up", impl: false,
    formula: "Publicaciones en Instagram y TikTok en el mes", preguntas: ["Q16"] },
  { id: "K16", p: "P4", nombre: "Crecimiento de seguidores", unidad: "%", dir: "up", impl: false,
    formula: "(Seguidores fin de mes − inicio) ÷ seguidores al inicio × 100", preguntas: ["Q17"] },
  { id: "K17", p: "P4", nombre: "Alcance mensual en redes", unidad: "nº", dir: "up", impl: false,
    formula: "Cuentas únicas alcanzadas en el mes", preguntas: ["Q16", "Q17"] },
  { id: "K18", p: "P4", nombre: "Coste por cliente captado con pauta", unidad: "€", dir: "down", impl: true,
    formula: "Gasto en pauta ÷ clientes o consultas atribuibles", preguntas: ["Q18"] },
  { id: "K19", p: "P4", nombre: "Resultado de evento o promoción", unidad: "%", dir: "up", impl: true,
    formula: "(Ventas del día del evento − ventas de un día comparable) ÷ ventas del día comparable × 100", preguntas: ["Q19"] },
  { id: "K20", p: "P4", nombre: "Nota media en Google", unidad: "/5", dir: "up", impl: false,
    formula: "Valor que muestra la ficha de Google", preguntas: ["Q13", "Q20"] },
  { id: "K21", p: "P4", nombre: "Reseñas respondidas", unidad: "%", dir: "up", impl: false,
    formula: "Reseñas respondidas ÷ reseñas recibidas × 100", preguntas: ["Q20"] },
  { id: "K22", p: "P5", nombre: "Tiempo medio de respuesta en WhatsApp", unidad: "min", dir: "down", impl: true,
    formula: "Media de minutos hasta la primera respuesta, en una muestra de consultas", preguntas: ["Q21"] },
  { id: "K23", p: "P5", nombre: "Conversión de consultas en ventas o reservas", unidad: "%", dir: "up", impl: true,
    formula: "Ventas o reservas cerradas ÷ consultas recibidas × 100", preguntas: ["Q21", "Q22"] },
  { id: "K24", p: "P5", nombre: "Ventas por WhatsApp e internet", unidad: "€", dir: "up", impl: true,
    formula: "Suma de ventas cerradas por esos canales en el mes", preguntas: ["Q23"] },
  { id: "K25", p: "P5", nombre: "Clientes que repiten", unidad: "%", dir: "up", impl: true,
    formula: "Clientes identificados que vuelven en 60 días ÷ clientes identificados × 100", preguntas: ["Q24"] },
  { id: "K26", p: "P5", nombre: "Contactos con consentimiento", unidad: "nº", dir: "up", impl: false,
    formula: "Clientes en la base de datos con permiso de contacto (RGPD)", preguntas: ["Q24"] },
];

export const TIPOS = ['Bar', 'Bar-cafetería', 'Cafetería', 'Restaurante', 'Asador', 'Sidrería', 'Repostería', 'Pastelería', 'Obrador', 'Hotel o alojamiento', 'Otro'];
export const MUNICIPIOS = ['Antzuola', 'Aretxabaleta', 'Arrasate-Mondragón', 'Bergara', 'Elgeta', 'Eskoriatza', 'Leintz-Gatzaga', 'Oñati'];
export const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
export const CANALES = ['Sala', 'Barra', 'Terraza', 'Para llevar', 'Apps de reparto', 'WhatsApp', 'Web propia', 'Encargos y eventos'];
export const RANGOS_VENTAS = ['Menos de 10.000 €', '10.000 a 20.000 €', '20.000 a 40.000 €', '40.000 a 80.000 €', 'Más de 80.000 €'];
export const REDES_QUIEN = ['El dueño', 'Alguien del equipo', 'Agencia o persona externa', 'Nadie'];

export const pilar = id => PILARES.find(p => p.id === id);
export const pregunta = id => PREGUNTAS.find(q => q.id === id);
export const kpi = id => KPIS.find(k => k.id === id);
