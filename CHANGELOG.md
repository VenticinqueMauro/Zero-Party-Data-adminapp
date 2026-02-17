# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-02-17

### Added

- **SurveyList component**: Lista de encuestas con cards, toggle status, acciones (editar, ver respuestas, eliminar), empty state y modal de confirmación
- **SurveyForm component**: Formulario crear/editar con pregunta, opciones dinámicas (min 2), checkbox allowOther, validación
- **SurveyResponses component**: Dashboard con gráfico de barras CSS, filtros de fecha, tabla paginada de respuestas
- **TypeScript interfaces**: Survey, SurveyResponse, OptionCount, RuntimeContext en `react/types/index.ts`
- **Mock data en español**: 3 encuestas, 12 respuestas, distribución dashboard en `react/mocks/data.ts`
- **Navegación completa**: Entre lista, formulario y respuestas usando withRuntimeContext

### Fixed

- **navigation.json**: Corregido path de `/admin/app/zpd-surveys` a `/admin/zpd-surveys` para que el sidebar funcione correctamente

### Notes

- UI navegable con datos mock (no conectada a GraphQL todavía)
- Próximo paso: Registrar JSON Schemas en Master Data v2 y conectar con API GraphQL

## [0.0.12] - 2021-08-26

### Fixed

- Navigation in sidebar 

### Removed

- Broken avatars

## [0.0.11] - 2021-08-11

## [0.0.10] - 2021-08-11

## [0.0.9] - 2021-08-11

### Added

- Initial release.
