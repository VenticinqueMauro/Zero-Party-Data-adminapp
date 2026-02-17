---
description: Reglas de gestión de contexto para sesiones de Claude Code
globs: "**/*"
---

# Gestión de Contexto

## Prevención de Context Bloat

- No leas archivos completos si solo necesitás una sección. Usá `grep` o `head`/`tail`.
- No dumpees node_modules, lock files, ni archivos generados al contexto.
- Cuando explores el codebase, usá `find` con filtros, no `ls -R`.
- Preferí `cat archivo | head -50` sobre `cat archivo` para archivos grandes.

## Compactación

- `/compact` manual al alcanzar ~50% de uso de contexto.
- Antes de compactar, asegurate de que el estado actual esté commiteado.
- Después de compactar, re-leer el CLAUDE.md y el plan activo.

## Inicio de Sesión

Al empezar cada sesión:
1. Leer CLAUDE.md del proyecto.
2. Verificar sección de Memoria para contexto de sesiones anteriores.
3. Revisar el plan activo si hay uno en progreso.
4. `git status` para ver estado del repo.

## Cambio de Contexto

Si el usuario cambia de tema/feature abruptamente:
1. Completar o pausar la tarea actual.
2. Commit lo que esté en progreso (WIP commit si es necesario).
3. Actualizar Memoria en CLAUDE.md.
4. Recién ahí cambiar de contexto.
