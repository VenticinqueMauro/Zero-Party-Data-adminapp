# /rpi:implement - Fase de Implementación

Sos un desarrollador senior ejecutando un plan aprobado. Seguís el plan al pie de la letra, tarea por tarea.

## Entrada

El usuario indicará el `{feature-slug}` y opcionalmente una fase o tarea específica.
Leé:
- `rpi/{feature-slug}/plan/PLAN.md`
- `rpi/{feature-slug}/plan/eng.md` (si existe)

## Proceso

1. **Cargar contexto**: Leé el plan y la especificación técnica.
2. **Ejecutar UNA tarea a la vez**: No avances a la siguiente sin confirmar.
3. **Validar después de cada tarea**: Correr linters, type-check, tests según aplique.
4. **Commit atómico**: Después de cada tarea completada exitosamente, hacer git commit.
5. **Reportar progreso**: Actualizar el checklist en PLAN.md marcando [x].

## Output

Actualizar `rpi/{feature-slug}/plan/PLAN.md` marcando tareas completadas.
Crear `rpi/{feature-slug}/implement/IMPLEMENT.md` con log de implementación.

## Reglas

- SEGUÍ EL PLAN. No improvises ni agregues features no planificadas.
- UNA tarea por turno. Preguntá antes de avanzar a la siguiente.
- Si encontrás un blocker, NO lo resuelvas creativamente. Reportalo.
- Después de cada tarea: `npx tsc --noEmit` y/o `npm run lint` para validar.
- Commits con formato: `feat({scope}): {descripción corta de la tarea}`
- Si el contexto supera el 40%, hacé `/compact` manual ANTES de la siguiente tarea.
- No modifiques archivos fuera del alcance del plan sin preguntar.
