# Made · Método

Prototipo funcional de la plataforma del **Método Made**: diagnóstico digital, priorización automática e indicadores de seguimiento para negocios de hostelería (bares, restaurantes, reposterías…).

> Prototipo en construcción. Solo usa **datos ficticios** (3 negocios de ejemplo inventados).

## Qué demuestra

1. **Método sistematizado.** 24 preguntas cerradas en 5 pilares, con la evidencia que hay que pedir para cada respuesta.
2. **Funciona con datos y mide resultados.** Calcula el Índice Made (0–100) por pilar y en global, y hace el seguimiento mensual de los indicadores con gráficas.
3. **Escalable.** Una consultora gestiona muchos negocios a la vez desde un panel con fases, avance y alertas.

## Módulos

| Módulo | Dónde |
| --- | --- |
| Ficha del negocio (tipo, municipio, aforo, ticket medio, días, canales) | Negocio → Ficha |
| Diagnóstico de 24 preguntas (0 / 1 / 2 / N/A) | Negocio → Diagnóstico |
| Índice Made por pilar y global, bloqueo de la línea digital | Negocio → Resultados |
| Motor de priorización: 2 × impacto + urgencia + viabilidad + sostenibilidad + bono de cimientos | Negocio → Resultados |
| Selección de 3 a 6 indicadores del banco de 26, con valor inicial y objetivo a 90 días | Negocio → Indicadores |
| Seguimiento mensual con gráficas y alertas | Negocio → Seguimiento |
| Informe para el cliente (web y PDF) | Botón «Informe» |
| Panel de la consultora: fases, avance, alertas y cartera por pilar | Panel |
| Vista del dueño (móvil): índice, prioridades, acciones y dato del mes | Acceso del dueño |

## Cuentas de demostración

Contraseña de todas: `made2026`

| Rol | Correo |
| --- | --- |
| Consultora | consultora@made.demo |
| Dueño · Bar Txoko (en seguimiento, con alertas) | txoko@made.demo |
| Dueño · Itsasargi Jatetxea (programa completado) | itsasargi@made.demo |
| Dueño · Goxoki Etxea (diagnóstico a medias) | goxoki@made.demo |

## Tecnología

- HTML, CSS y JavaScript sin dependencias ni paso de compilación. Se publica tal cual con GitHub Pages.
- Tipografías de marca (Italiana y Space Grotesk) alojadas en el propio sitio: no se llama a servidores de terceros.
- Los datos se guardan en el navegador de cada persona (`localStorage`). El botón «Restablecer datos de ejemplo» vuelve al estado inicial.
- La capa de datos está aislada en `js/store.js` para conectarla en la siguiente fase a una base de datos con servidores en la UE (por ejemplo, Supabase en Fráncfort).

## Estructura

```
index.html        Página única y logotipo de Made
css/app.css       Estilos con el manual de marca de Made Studio
js/data.js        Contenido del método: pilares, preguntas, protocolos e indicadores
js/engine.js      Puntuaciones, niveles, priorización, fases y alertas
js/store.js       Datos de ejemplo, sesión y almacenamiento
js/charts.js      Gráficas en SVG
js/app.js         Vistas y navegación
```

## Probar en local

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

---

Made Studio · made for you
