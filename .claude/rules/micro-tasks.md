---
description: Gestión de micro-tareas y workflow con Claude Code
globs: "**/*"
---

# Gestión de Micro-Tareas

## Regla del 50%

- Cada tarea individual debe poder completarse usando menos del 50% del contexto.
- Si una tarea es demasiado grande, descomponela antes de empezar.
- Hacé `/compact` manual cuando el contexto alcance ~50%.

## Flujo de Trabajo por Tarea

1. Leer y entender la tarea específica.
2. Identificar archivos involucrados (máximo 3-4 por tarea).
3. Implementar el cambio mínimo necesario.
4. Validar: type-check, lint, test.
5. Commit atómico.
6. Pasar a la siguiente tarea.

## Checklist de Tareas

- Usá formato `- [ ]` para trackear progreso en archivos de plan.
- Marcá `- [x]` al completar cada tarea.
- Si una tarea se bloquea, marcala como `- [!] BLOQUEADA: {razón}`.

## Gestión de Bloqueos

- Si encontrás un error inesperado: PARÁ, describí el problema, preguntá.
- No intentes "arreglar creativamente" errores fuera del scope del plan.
- Si una dependencia falla: documentá la versión exacta y el error.

## Sesiones Largas

- Cada 3-4 tareas completadas, hacé un resumen de progreso.
- Si tenés que continuar en nueva sesión, actualizá la sección de Memoria del CLAUDE.md.
