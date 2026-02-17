---
description: Convenciones de commits atómicos y control de versiones
globs: "**/*"
---

# Commits Atómicos

## Formato de Commit

```
{type}({scope}): {descripción en imperativo}

{cuerpo opcional con contexto}
```

## Types Permitidos

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `refactor`: Cambio de código sin alterar funcionalidad
- `style`: Formateo, semicolons faltantes (sin cambio de lógica)
- `test`: Agregar o corregir tests
- `docs`: Cambios en documentación
- `chore`: Tareas de mantenimiento, deps, config

## Reglas de Frecuencia

- Commitear INMEDIATAMENTE después de completar una tarea exitosamente.
- Un commit = una tarea completada. No acumules múltiples cambios.
- Nunca committear código que no compila o no pasa el type-check.

## Validación Pre-Commit

Antes de cada commit, ejecutar en este orden:
1. `npx tsc --noEmit` (verificar tipos)
2. `npm run lint` (verificar estilo)
3. Solo si ambos pasan → `git add` + `git commit`

## Scope Sugeridos para React/Next.js

- `ui`: Componentes visuales
- `api`: Routes, handlers, server actions
- `lib`: Utilidades, helpers, hooks
- `types`: Interfaces y tipos
- `config`: Configuración del proyecto
- `db`: Modelos, schemas, migrations
