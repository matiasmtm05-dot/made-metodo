# Plataforma de diagnóstico y seguimiento para pequeña hostelería

Prototipo funcional. **Solo datos ficticios.** El nombre definitivo está pendiente: se cambia en *Ajustes* y se actualiza en toda la plataforma y en los informes.

## Qué demuestra

1. **El método está sistematizado.** 24 prácticas observables en 5 pilares, puntuadas 0, 1, 2 o N/A con la evidencia que hay que pedir, y un motor de priorización con reglas explícitas.
2. **Funciona con datos y mide resultados.** Línea base, objetivo a 90 días, dato mensual, gráficas, alertas y comparación entre el diagnóstico inicial y el final.
3. **Es escalable.** La consultora gestiona varios negocios desde un panel con fases, avance, alertas y la media de la cartera por pilar.

## Estudio de campo

La sección *Estudio de campo* muestra, de forma agregada y anónima, las entrevistas del estudio de mercado en Debagoiena (hoja «Registro» del Excel): dónde falla la zona, media por pilar, prioridades que saldrían con el motor, disposición a pagar y preocupaciones. Solo entran entrevistas con consentimiento y nunca nombres ni contactos. La consultora puede actualizarla subiendo un Excel nuevo con la misma plantilla (lector SheetJS, licencia Apache 2.0, alojado en `assets/vendor`).

## Reglas (Modelo de Diagnóstico v3)

- Pilar = puntos ÷ (2 × preguntas aplicables). Índice = media de los 5 pilares.
- Niveles: menos de 40 % crítico · 40 a 69 % en desarrollo · 70 % o más sólido.
- Prioridad = 2 × impacto + urgencia + viabilidad + sostenibilidad + bono de cimientos (+2 en P1 y P2 cuando su pilar está en nivel crítico).
- Candidatas: preguntas con 0; si hay menos de 3, también las de 1. Desempate: mayor impacto, después P1 y P2, después el orden.
- Activación digital: P4 y P5 no pueden ser prioridad hasta que P1 llegue al 40 %.
- Seguimiento: 3 a 6 de los 26 KPI, objetivo fijado por la consultora, dato mensual hasta el día 5 del mes siguiente.
- Alertas: dato pendiente, KPI que empeora un mes (aviso) o dos meses seguidos (alerta) y prioridad sin avances en 30 días.
- Fases: diagnóstico, línea base (semanas 1 y 2), implantación (3 a 8), consolidación (9 a 12), cierre (12) y continuidad (desde el mes 4).

El contenido del método está en `js/data.js` y las reglas en `js/engine.js`.

## Cuentas de demostración

| Rol | Acceso |
| --- | --- |
| Consultora | consultora@demo.es · contraseña `demo1234` |
| Solo lectura (evaluadores) | evaluador@demo.es · contraseña `demo1234` |
| Dueños | Entran con un enlace al correo, sin contraseña. En el prototipo el enlace se abre en pantalla: bar.ejemplo@demo.es, restaurante.demo@demo.es, obrador.prueba@demo.es |

Negocios ficticios: Bar Ejemplo (consolidación, con alertas), Restaurante Demo (90 días cerrados y continuidad) y Obrador Prueba (diagnóstico a medias). El prototipo trabaja con una fecha simulada en 2027 y numera los meses del programa (mes 1, mes 2, mes 3) para no mostrar fechas reales.

## Tecnología

- HTML, CSS y JavaScript sin dependencias ni compilación.
- Tipografías alojadas en el propio sitio (Public Sans y Source Serif 4, licencia OFL): no se llama a servidores de terceros.
- Prototipo: los datos se guardan en el navegador de cada persona (`localStorage`). Siguiente fase: base de datos en la UE (Supabase, Fráncfort). La capa de datos está aislada en `js/store.js`.

## Probar en local

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```
