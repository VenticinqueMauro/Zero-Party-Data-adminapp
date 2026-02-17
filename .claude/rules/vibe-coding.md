---
description: Principios de vibe coding para desarrollo eficiente con AI
globs: "**/*.{ts,tsx,js,jsx}"
---

# Reglas de Vibe Coding

## Principios Core

- SIEMPRE empezá en modo plan antes de tocar código. Pensá, luego codificá.
- Preferí soluciones simples sobre soluciones inteligentes. "Boring code" es buen código.
- No agregues dependencias nuevas sin justificación explícita.
- Si algo se puede resolver con código vanilla, no uses una librería.

## Anti-Patterns (evitar)

- No generes archivos gigantes de +300 líneas. Dividí en módulos.
- No hagas refactors que no fueron pedidos ("AI slop").
- No cambies código que funciona solo por "mejorar el estilo".
- No inventes abstracciones prematuras. YAGNI.
- No generes comentarios obvios. El código debe ser auto-explicativo.

## Calidad

- Todo componente nuevo debe tener al menos tipos TypeScript completos.
- Toda función exportada debe tener JSDoc con @param y @returns.
- Preferí named exports sobre default exports.
- Usá early returns para reducir nesting.
- Máximo 3 niveles de indentación en cualquier función.
