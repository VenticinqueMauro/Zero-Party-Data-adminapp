# CLAUDE.md

> Context guide for Claude Code - Zero-Party Data Survey Manager

## Project

- **Name**: Zero-Party Data Survey Manager
- **Description**: VTEX Admin App para capturar Zero-Party Data mediante encuestas post-compra en la Thank You Page. Complementa GA4 capturando "canales oscuros" (dark funnel) que las herramientas de analytics no pueden medir.
- **Repo**: https://github.com/VenticinqueMauro/Zero-Party-Data-adminapp.git
- **Entorno**: Red Clover QA (`redcloverqa`)

## Stack

- **Platform**: VTEX IO
- **Language**: TypeScript
- **Builders**:
  - `node` 7.x (resolvers GraphQL)
  - `graphql` 1.x (schema y types)
  - `admin` 0.x (Admin App UI)
  - `react` 3.x (componentes React)
  - `store` 0.x (widget storefront)
  - `messages` 1.x (i18n)
- **UI**: VTEX Admin UI / Styleguide
- **Data Layer**: Master Data v2 + GraphQL
- **Package Manager**: yarn

## Main Commands

```bash
vtex link              # Development (link app to workspace)
vtex publish           # Publish app
vtex deploy            # Deploy to production
yarn lint              # Linting
yarn test              # Tests
```

## Project Structure

```
├── manifest.json              # VTEX IO app manifest (actualizado)
├── graphql/
│   ├── schema.graphql         # Queries y Mutations principales
│   └── types/
│       ├── Survey.graphql     # Type Survey
│       ├── SurveyInput.graphql
│       ├── Response.graphql   # Type SurveyResponse + ResponseList
│       ├── ResponseInput.graphql
│       └── Dashboard.graphql  # OptionCount + SurveyDashboard
├── node/
│   ├── index.ts               # Entry point, registra resolvers
│   ├── package.json           # Dependencias node
│   ├── tsconfig.json          # Config TypeScript
│   ├── clients/
│   │   └── index.ts           # Clients class (IOClients)
│   ├── resolvers/
│   │   ├── survey.ts          # CRUD encuestas + toggle (implementado)
│   │   ├── response.ts        # Submit + list respuestas (implementado)
│   │   └── dashboard.ts       # Agregaciones dashboard (implementado)
│   └── utils/
│       └── constants.ts       # Entidades, schemas, fields
├── admin/
│   ├── navigation.json        # Menu lateral VTEX Admin
│   └── routes.json            # Rutas: SurveyList, SurveyForm, SurveyResponses
├── react/                     # Componentes React Admin UI
│   ├── types/index.ts         # Interfaces TypeScript (Survey, SurveyResponse, etc.)
│   ├── mocks/data.ts          # Datos mock para desarrollo (en español)
│   ├── SurveyList.tsx         # Lista de encuestas con cards y acciones
│   ├── SurveyForm.tsx         # Crear/Editar encuesta con opciones dinámicas
│   └── SurveyResponses.tsx    # Dashboard con gráfico + tabla paginada
├── store/                     # Widget Storefront (Semana 4)
│   └── ...
└── messages/
    ├── en.json                # i18n English
    ├── es.json                # i18n Espanol
    └── pt.json                # i18n Portugues
```

## Master Data v2 Entities

| Entidad | Schema | Descripcion |
|---------|--------|-------------|
| `zpd_surveys` | `survey-schema-v1` | Configuracion de encuestas |
| `zpd_responses` | `response-schema-v1` | Respuestas individuales |

### zpd_surveys fields
- `id`, `question`, `options[]`, `isActive`, `allowOther`, `responseCount`, `createdAt`, `updatedAt`

### zpd_responses fields
- `id`, `surveyId`, `selectedOption`, `otherText`, `orderId`, `clientEmail`, `respondedAt`

## GraphQL API

### Queries
- `getSurveys` - Lista todas las encuestas
- `getSurvey(id)` - Obtiene una encuesta por ID
- `getActiveSurvey` - Encuesta activa (para storefront)
- `getResponses(surveyId, page, pageSize, dateFrom, dateTo)` - Respuestas paginadas
- `getSurveyDashboard(surveyId)` - Dashboard con distribucion
- `hasOrderResponded(orderId, surveyId)` - Verifica si ya respondio (RN-06)

### Mutations
- `createSurvey(input)` - Crear encuesta
- `updateSurvey(id, input)` - Actualizar encuesta
- `deleteSurvey(id)` - Eliminar encuesta (solo si inactiva)
- `toggleSurveyStatus(id, isActive)` - Activar/desactivar
- `submitResponse(input)` - Registrar respuesta (storefront)

## Business Rules

| Regla | Descripcion |
|-------|-------------|
| RN-01 | Solo una encuesta activa a la vez |
| RN-02 | Al activar, la anterior se desactiva automaticamente |
| RN-03 | No se puede eliminar encuesta activa |
| RN-04 | Minimo 2 opciones de respuesta |
| RN-05 | Pregunta obligatoria y no vacia |
| RN-06 | Cliente responde una vez por pedido |
| RN-07 | Respuestas asociadas a orderId y email |

## Code Conventions

- Seguir patrones existentes de VTEX IO
- Usar componentes de VTEX Admin UI / Styleguide
- TypeScript strict mode
- Resolver errors tipados con `UserInputError`
- Tests para nueva funcionalidad

## Key Files

| File | Purpose |
|------|---------|
| `manifest.json` | VTEX IO app config, builders, policies |
| `graphql/schema.graphql` | Queries y Mutations |
| `node/index.ts` | Service entry point |
| `node/utils/constants.ts` | DATA_ENTITY_*, SCHEMA_*, FIELDS |
| `.env` | Environment variables (DO NOT READ) |

## Critical Rules

1. NEVER read `.env` or files in `secrets/`
2. ALWAYS run tests before committing
3. Atomic commits: one logical change per commit
4. Manual `/compact` at 50% context
5. Seguir el diseño tecnico de Semana 2 para implementacion

## Documentation References

- [Master Data API v2](https://developers.vtex.com/docs/api-reference/master-data-api-v2)
- [GraphQL in VTEX IO](https://developers.vtex.com/docs/guides/developing-a-graphql-api-in-service-apps)
- [VTEX Admin UI](https://styleguide.vtex.com/)

---

## Memory

{This section updates between sessions. Claude should read this at startup.}

### Last Session
- **Date**: 2026-02-17
- **Phase**: Semana 3 - Frontend Admin App UI
- **Status**: UI navegable completada con datos mock
- **Next step**:
  1. Registrar JSON Schemas en Master Data v2 (pendiente)
  2. Conectar UI con GraphQL API (reemplazar mocks por queries/mutations reales)
  3. Testing end-to-end de flujos completos
  4. Semana 4: Widget storefront para Thank You Page

### Completed Phases
- **Semana 1**: Definicion de producto, wireframes, user stories
- **Semana 2**: Diseno tecnico (entidades MD, JSON Schemas, GraphQL schema, resolvers)
- **Semana 3**: Frontend Admin App UI (completada)

### Recent Technical Decisions
- Dos entidades Master Data: `zpd_surveys`, `zpd_responses`
- GraphQL layer con builders `node 7.x` + `graphql 1.x`
- Campo `responseCount` desnormalizado para performance
- Scroll pagination para >100 respuestas en dashboard
- Extensibilidad preparada para `zpd_rewards` post-MVP

### Known Issues
- MD v2 search limit: 100 docs (usar scroll para mas)
- Sin agregaciones nativas en MD v2 (calcular en resolver)

### Semana 3 - Implementación Completada
- **navigation.json**: Fix aplicado - path sin `/app/` (`/admin/zpd-surveys`)
- **routes.json**: Mantiene path con `/app/` (`/admin/app/zpd-surveys`)
- **SurveyList.tsx**: Cards con toggle status, edit, view responses, delete + modal confirmación
- **SurveyForm.tsx**: Modo crear/editar, opciones dinámicas (min 2), validación, allowOther
- **SurveyResponses.tsx**: Dashboard con gráfico CSS (barras), filtros fecha, tabla paginada
- **Mocks en español**: 3 encuestas, 12 respuestas, distribución dashboard
- **Navegación**: withRuntimeContext + runtime.navigate() funcionando entre vistas

### Puntos para Próxima Sesión
1. **Registrar JSON Schemas en MD v2** antes de conectar GraphQL
2. **Reemplazar mocks por GraphQL**: useQuery/useMutation de react-apollo
3. **Manejar RN-01/RN-02**: Al activar encuesta, desactivar la anterior
4. **Testing**: Validar flujos completos con datos reales

---

## UI Screens (Semana 3) - COMPLETADO

### Pantallas implementadas:
1. **SurveyList (Home)** - Cards con pregunta, status tag, responseCount, fecha, acciones (toggle, edit, responses, delete), modal confirmación, empty state
2. **SurveyForm** - Input pregunta, opciones dinámicas (add/remove, min 2), checkbox allowOther, validación, modo crear/editar
3. **SurveyResponses** - Dashboard con total y gráfico barras CSS, filtros fecha (from/to), tabla paginada, error state

### Componentes VTEX Styleguide utilizados:
- `Layout`, `PageHeader`, `PageBlock`
- `Table`, `Pagination`, `Tag`
- `Input`, `Button`, `Checkbox`, `IconDelete`
- `Alert`, `Modal`, `EmptyState`
- Gráfico de barras: CSS custom (sin librería externa)

### Rutas configuradas (`admin/routes.json`):
| Page ID | Path | Componente |
|---------|------|------------|
| admin.app.zpd-surveys | /admin/app/zpd-surveys | SurveyList |
| admin.app.zpd-surveys-new | /admin/app/zpd-surveys/new | SurveyForm |
| admin.app.zpd-surveys-edit | /admin/app/zpd-surveys/:id/edit | SurveyForm |
| admin.app.zpd-surveys-responses | /admin/app/zpd-surveys/:id/responses | SurveyResponses |

---

## Skills

### Business Domain
- Zero-Party Data: datos que el cliente proporciona voluntariamente
- Dark Funnel: canales no trackeables por analytics (boca a boca, podcasts, TikTok organico)
- Atribucion percibida: lo que el cliente dice que lo trajo vs lo que GA4 mide

### External APIs
- Master Data v2: `api/dataentities/{entity}/documents`, `api/dataentities/{entity}/search`
- VTEX Order API: para obtener orderId y clientEmail en storefront

### Custom Patterns
- Solo 1 encuesta activa a la vez (desactivar anterior automaticamente)
- Paginacion con scroll para colecciones grandes
- Desnormalizacion de contadores para performance
