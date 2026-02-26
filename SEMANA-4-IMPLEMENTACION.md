# Semana 4 - Implementación y Estado Final

## Zero-Party Data Survey Manager

| Campo | Detalle |
|-------|---------|
| **Proyecto** | Zero-Party Data Survey Manager |
| **Semana** | 4 - Conexión GraphQL + Widget Storefront |
| **Entorno** | Red Clover QA (`redcloverqa`) |
| **Autor** | Mauro - Frontend Developer |
| **Fecha** | Febrero 2025 |

---

## 1. Resumen Ejecutivo

La Semana 4 completó la conexión del frontend Admin con el backend GraphQL real (eliminando los datos mock de Semana 3) e implementó el Widget Storefront para la Thank You Page. El único paso pendiente de ejecución es el registro de los JSON Schemas en Master Data v2, que requiere credenciales de administrador del entorno `redcloverqa`.

---

## 2. Estado del Proyecto por Semana

| Semana | Entregable | Estado |
|--------|------------|--------|
| **Semana 1** | Definición de producto, wireframes, user stories | ✅ Completo |
| **Semana 2** | Diseño técnico: entidades MD, JSON Schemas, GraphQL schema, resolvers | ✅ Completo |
| **Semana 3** | Frontend Admin App UI con datos mock | ✅ Completo |
| **Semana 4** | Conexión GraphQL real + Widget Storefront | ✅ Código completo — ⏳ Pendiente: registro MD + integración store theme |

---

## 3. Todo lo implementado en Semana 4

### 3.1 Script de Registro de Master Data v2

**Archivo:** `scripts/register-md-schemas.sh`

Script bash listo para ejecutar. Registra los dos JSON Schemas en el entorno `redcloverqa` via REST API de Master Data v2.

**Uso:**
```bash
cd admin-example
chmod +x scripts/register-md-schemas.sh
APP_KEY="vtexappkey-redcloverqa-XXXXX" APP_TOKEN="tu-token" ./scripts/register-md-schemas.sh
```

Registra:
- `zpd_surveys` / `survey-schema-v1`
- `zpd_responses` / `response-schema-v1`

> **IMPORTANTE:** Este paso debe ejecutarse ANTES de hacer `vtex link`, de lo contrario los resolvers GraphQL no pueden conectar con Master Data.

---

### 3.2 Archivos GraphQL en React

**Directorio:** `react/graphql/`

Se crearon 11 archivos `.graphql` que son importados directamente por los componentes React via el builder `react 3.x` de VTEX IO:

#### Para la Admin App:
| Archivo | Operación | Usado en |
|---------|-----------|----------|
| `getSurveys.graphql` | Query - lista todas las encuestas | SurveyList |
| `getSurvey.graphql` | Query - una encuesta por ID | SurveyForm (modo edición) |
| `createSurvey.graphql` | Mutation - crear encuesta | SurveyForm |
| `updateSurvey.graphql` | Mutation - editar encuesta | SurveyForm |
| `deleteSurvey.graphql` | Mutation - eliminar encuesta | SurveyList |
| `toggleSurveyStatus.graphql` | Mutation - activar/desactivar | SurveyList |
| `getResponses.graphql` | Query - respuestas paginadas con filtros | SurveyResponses |
| `getSurveyDashboard.graphql` | Query - distribución para el gráfico | SurveyResponses |

#### Para el Widget Storefront:
| Archivo | Operación | Usado en |
|---------|-----------|----------|
| `getActiveSurvey.graphql` | Query - encuesta activa actual | SurveyWidget |
| `hasOrderResponded.graphql` | Query - si el pedido ya respondió | SurveyWidget |
| `submitResponse.graphql` | Mutation - registrar respuesta | SurveyWidget |

**Patrón de importación en VTEX IO:**
```tsx
import { useQuery, useMutation } from 'react-apollo'
import GET_SURVEYS from './graphql/getSurveys.graphql'
```
> Apollo Client es provisto automáticamente por la plataforma VTEX IO. No hay que instalar ni configurar `@apollo/client`.

---

### 3.3 Componentes Admin App — Migración de Mocks a GraphQL

#### SurveyList.tsx
- ❌ Eliminado: `import { MOCK_SURVEYS } from './mocks/data'`
- ❌ Eliminado: `useState<Survey[]>(MOCK_SURVEYS)` (estado local de surveys)
- ✅ Agregado: `useQuery(GET_SURVEYS)` → lista carga desde Master Data
- ✅ Agregado: `useMutation(TOGGLE_SURVEY_STATUS)` + `refetch()` al completar
- ✅ Agregado: `useMutation(DELETE_SURVEY)` + `refetch()` al completar
- ✅ Agregado: `<Spinner />` durante carga inicial
- ✅ Agregado: `<Alert type="error">` para errores de red y de mutation
- ✅ Simplificado: `handleToggleStatus` ya no reimplementa RN-01 (lo maneja el resolver)

#### SurveyForm.tsx
- ❌ Eliminado: `import { findSurveyById } from './mocks/data'`
- ❌ Eliminado: `useEffect` que llamaba a `findSurveyById` para prellenar el form
- ✅ Agregado: `useQuery(GET_SURVEY, { variables: { id }, skip: !isEditMode })` para modo edición
- ✅ Agregado: `useEffect` sobre `surveyData` para prellenar question/options/allowOther cuando llega el query
- ✅ Agregado: `useMutation(CREATE_SURVEY)` para modo crear
- ✅ Agregado: `useMutation(UPDATE_SURVEY)` para modo editar
- ✅ Agregado: `isLoading` state en botón Guardar (previene doble submit)
- ✅ Agregado: `<Spinner />` mientras carga la encuesta en modo edición

#### SurveyResponses.tsx
- ❌ Eliminado: `import { findSurveyById, getResponsesBySurveyId, MOCK_DASHBOARD_DISTRIBUTION } from './mocks/data'`
- ❌ Eliminado: `filteredResponses` useMemo (filtrado client-side)
- ❌ Eliminado: `paginatedResponses` useMemo (paginación client-side)
- ✅ Agregado: `useQuery(GET_SURVEY_DASHBOARD)` → question + totalResponses + distribution
- ✅ Agregado: `useQuery(GET_RESPONSES)` con variables: `{ surveyId, page, pageSize, dateFrom, dateTo }`
- ✅ Migrado: Paginación a **server-side** usando `total` del `ResponseList`
- ✅ Migrado: Filtros de fecha pasan como variables GraphQL (re-fetch automático al cambiar)
- ✅ Agregado: `<Spinner />` en dashboard y en tabla de respuestas
- ✅ Agregado: `<Alert type="error">` para errores de ambos queries

---

### 3.4 Resolver: Cascade Delete

**Archivo:** `node/resolvers/survey.ts` (línea ~210)

Se implementó el scroll paginado para eliminar todas las respuestas asociadas a una encuesta antes de eliminarla. Reemplaza el comentario `// TODO: Implementar scroll para eliminar todas las respuestas`.

```typescript
// Elimina respuestas en lotes de 100 hasta vaciar
let page = 1
while (true) {
  const responses = await masterdata.searchDocuments<{ id: string }>({
    dataEntity: DATA_ENTITY_RESPONSES,
    schema: SCHEMA_RESPONSES,
    fields: ['id'],
    where: `surveyId=${id}`,
    pagination: { page, pageSize: 100 },
  })
  if (responses.length === 0) break
  for (const resp of responses) {
    await masterdata.deleteDocument({ dataEntity: DATA_ENTITY_RESPONSES, id: resp.id })
  }
  if (responses.length < 100) break
  page++
}
```

También se agregaron los imports necesarios: `DATA_ENTITY_RESPONSES` y `SCHEMA_RESPONSES` desde `../utils/constants`.

---

### 3.5 Widget Storefront

#### store/interfaces.json (NUEVO)
```json
{
  "zpd-survey-manager.survey-widget": {
    "component": "SurveyWidget",
    "allowed": []
  }
}
```
Registra el bloque para que pueda ser usado en el store theme.

#### manifest.json — nueva dependencia
```json
"vtex.order-placed": "3.x"
```
Necesaria para acceder al `useOrder()` hook que provee `orderId` y `clientEmail` en la página de confirmación de pedido.

#### react/SurveyWidget.tsx (NUEVO)
Componente completo para la Thank You Page. Flujo:

```
1. useQuery(GET_ACTIVE_SURVEY)
   → Si no hay encuesta activa → return null (widget invisible)

2. useOrder() de vtex.order-placed
   → Obtiene orderId y clientEmail del pedido actual
   → Si no hay orderId → return null

3. useQuery(HAS_ORDER_RESPONDED, { orderId, surveyId })
   → Si ya respondió → muestra mensaje "¡Gracias!"

4. Renderiza opciones como botones
   → Click en opción → useMutation(SUBMIT_RESPONSE)
   → Si allowOther → muestra input texto libre + botón Enviar

5. Post-respuesta → mensaje "¡Gracias por tu respuesta!"
```

**Características del widget:**
- No intrusivo: invisible si no hay encuesta activa o el pedido ya respondió
- 1-click para opciones simples
- Campo "Otro" con input de texto libre y submit con Enter o botón
- Maneja RN-06 (una respuesta por pedido) del lado del cliente Y del servidor
- Sin dependencias CSS externas (estilos inline)

---

## 4. Arquitectura de Archivos — Estado Final

```
admin-example/
├── manifest.json                      ← vtex.order-placed: 3.x agregado
├── scripts/
│   └── register-md-schemas.sh         ← NUEVO: script para registrar MD schemas
├── graphql/
│   ├── schema.graphql                 ← Sin cambios
│   └── types/                         ← Sin cambios
├── node/
│   ├── resolvers/
│   │   ├── survey.ts                  ← MODIFICADO: cascade delete implementado
│   │   ├── response.ts                ← Sin cambios
│   │   └── dashboard.ts               ← Sin cambios
│   └── utils/constants.ts             ← Sin cambios
├── react/
│   ├── graphql/                       ← NUEVO directorio con 11 archivos .graphql
│   │   ├── getSurveys.graphql
│   │   ├── getSurvey.graphql
│   │   ├── createSurvey.graphql
│   │   ├── updateSurvey.graphql
│   │   ├── deleteSurvey.graphql
│   │   ├── toggleSurveyStatus.graphql
│   │   ├── getResponses.graphql
│   │   ├── getSurveyDashboard.graphql
│   │   ├── getActiveSurvey.graphql
│   │   ├── hasOrderResponded.graphql
│   │   └── submitResponse.graphql
│   ├── SurveyList.tsx                 ← MODIFICADO: mocks → GraphQL
│   ├── SurveyForm.tsx                 ← MODIFICADO: mocks → GraphQL
│   ├── SurveyResponses.tsx            ← MODIFICADO: mocks → GraphQL
│   ├── SurveyWidget.tsx               ← NUEVO: widget storefront
│   ├── types/index.ts                 ← Sin cambios
│   └── mocks/data.ts                  ← Conservado (no usado en producción)
├── store/
│   └── interfaces.json                ← NUEVO: registra el bloque del widget
├── admin/
│   ├── navigation.json                ← Sin cambios
│   └── routes.json                    ← Sin cambios
└── messages/                          ← Sin cambios
```

---

## 5. Lo que queda pendiente

### 5.1 Pendiente crítico — Registro de Schemas en Master Data v2

**Blocker para todo lo que sigue.** Sin este paso, los resolvers GraphQL no pueden leer/escribir en Master Data.

**Qué hacer:**
1. Obtener credenciales (AppKey + AppToken) con permisos de Master Data del entorno `redcloverqa`
2. Ejecutar:
   ```bash
   APP_KEY="vtexappkey-redcloverqa-XXXXX" \
   APP_TOKEN="tu-token-completo" \
   ./scripts/register-md-schemas.sh
   ```
3. Verificar respuesta HTTP 200/201/204 para ambas entidades

**Verificación manual (opcional):**
```
GET https://redcloverqa.vtexcommercestable.com.br/api/dataentities/zpd_surveys/schemas/survey-schema-v1
```
Debe retornar el JSON Schema registrado.

---

### 5.2 Pendiente — Testing con vtex link

Una vez registrados los schemas, linkear la app y probar el CRUD completo:

```bash
cd admin-example
vtex use {workspace-de-prueba}
vtex link
```

**Checklist de testing Admin App:**

- [ ] Lista de encuestas carga (vacía al inicio, sin errores)
- [ ] Crear encuesta → aparece en la lista con responseCount: 0
- [ ] Editar encuesta → los campos se precargan correctamente
- [ ] Toggle Activa/Inactiva → solo una activa a la vez (RN-01/RN-02)
- [ ] Intentar eliminar encuesta activa → error "Desactivela primero" (RN-03)
- [ ] Eliminar encuesta inactiva → desaparece de la lista
- [ ] Ver Respuestas → dashboard carga (vacío al inicio)
- [ ] Dashboard → distribución aparece al existir respuestas

---

### 5.3 Pendiente — Integración Widget en Store Theme

El widget **no puede inyectarse automáticamente** en la Thank You Page desde este repo. Requiere modificar el store theme (`redcloverqa.store-theme` o similar), que es un **repositorio separado**.

**Qué hacer cuando tengas acceso al store theme:**

**Paso 1** — Agregar dependencia en `manifest.json` del store theme:
```json
"dependencies": {
  "redcloverqa.zpd-survey-manager": "0.x"
}
```

**Paso 2** — Agregar el bloque al template de Order Placed.

Buscar el archivo que define el `order-placed` template (generalmente en `store/blocks/` o `store/blocks/order-placed.jsonc`):
```jsonc
{
  "order-placed": {
    "blocks": [
      "order-placed-header",
      "zpd-survey-manager.survey-widget",
      "order-placed-items",
      "order-placed-footer"
    ]
  }
}
```

**Paso 3** — Linkear el store theme con la app en el mismo workspace:
```bash
# Terminal 1: linkear la app del survey manager
cd admin-example && vtex link

# Terminal 2: linkear el store theme
cd store-theme && vtex link
```

**Paso 4** — Verificar en el workspace:
- Realizar una compra de prueba
- Confirmar que el widget aparece en la Thank You Page
- Responder la encuesta
- Verificar en el Admin que la respuesta aparece en el dashboard

---

### 5.4 Pendiente — Consideraciones para Producción

Antes de deployar a producción (fuera del scope del challenge pero importante documentar):

| Ítem | Descripción |
|------|-------------|
| **Auth directives** | Actualmente todas las operaciones son `@auth(scope: PUBLIC)`. Las operaciones de Admin deberían ser `@auth(scope: ADMIN)` para seguridad |
| **Total count en getResponses** | El resolver retorna `responses.length` como `total`, no el conteo real de documentos en MD. Para paginación precisa se necesita un query separado de conteo |
| **Rate limiting en submitResponse** | Agregar validación adicional en el resolver para prevenir abuso |
| **Error tracking** | Integrar con Splunk/Datadog para monitorear errores de resolvers en producción |

---

## 6. Diagrama de Flujo Final del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN APP                                 │
│                                                             │
│  SurveyList ──useQuery──► getSurveys                        │
│      │       ──useMutation► toggleSurveyStatus + refetch    │
│      │       ──useMutation► deleteSurvey + refetch          │
│      │                                                      │
│  SurveyForm ──useQuery──► getSurvey (edit mode)             │
│             ──useMutation► createSurvey → navigate back     │
│             ──useMutation► updateSurvey → navigate back     │
│                                                             │
│  SurveyResponses ──useQuery──► getSurveyDashboard           │
│                  ──useQuery──► getResponses (server-side pg) │
└─────────────────────────────────────────────────────────────┘
                              │
              react-apollo (Apollo Client — provisto por VTEX IO)
                              │
┌─────────────────────────────────────────────────────────────┐
│               GRAPHQL SERVICE (node 7.x + graphql 2.x)      │
│                                                             │
│  Resolvers: survey.ts | response.ts | dashboard.ts          │
│  ↓ MasterData client (@vtex/api)                            │
│  ↓ Master Data v2 REST API                                  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│               MASTER DATA v2                                 │
│                                                             │
│  zpd_surveys  (survey-schema-v1)   ← ⏳ PENDIENTE REGISTRAR│
│  zpd_responses (response-schema-v1) ← ⏳ PENDIENTE REGISTRAR│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    STOREFRONT                               │
│                                                             │
│  SurveyWidget                                               │
│      ├── useOrder() ────────────────► orderId + clientEmail │
│      ├── useQuery(getActiveSurvey) ─► survey data           │
│      ├── useQuery(hasOrderResponded)► check RN-06           │
│      └── useMutation(submitResponse)► registrar respuesta   │
│                                                             │
│  ⏳ PENDIENTE: agregar bloque al store theme order-placed   │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Reglas de Negocio — Estado de Implementación

| Regla | Descripción | Backend | Frontend |
|-------|-------------|---------|----------|
| **RN-01** | Solo una encuesta activa a la vez | ✅ resolver `toggleSurveyStatus` | ✅ refetch automático |
| **RN-02** | Al activar, la anterior se desactiva | ✅ resolver | ✅ via refetch |
| **RN-03** | No eliminar encuesta activa | ✅ resolver `deleteSurvey` | ✅ botón disabled |
| **RN-04** | Mínimo 2 opciones de respuesta | ✅ JSON Schema + resolver | ✅ validación en form |
| **RN-05** | Pregunta obligatoria | ✅ JSON Schema | ✅ validación en form |
| **RN-06** | Una respuesta por pedido | ✅ resolver `submitResponse` | ✅ `hasOrderResponded` query |
| **RN-07** | Respuestas asociadas a orderId y email | ✅ campos requeridos en schema | ✅ widget los envía |

---

## 8. Decisiones Técnicas Clave

| Decisión | Alternativa considerada | Razón |
|----------|------------------------|-------|
| `react-apollo` para hooks | `@apollo/client` v3 | VTEX IO provee Apollo automáticamente. No instalar nada extra. |
| `useOrder()` de `vtex.order-placed` | Parsear URL (`?og=`) | API oficial y tipada. Más confiable. |
| Paginación server-side en SurveyResponses | Client-side con useMemo | Escala correctamente para muchas respuestas. |
| Cascade delete con scroll paginado | DELETE en batch | MD v2 no tiene DELETE bulk. Scroll de 100 en 100 es el patrón correcto. |
| Widget `return null` si no hay encuesta | Mostrar placeholder | No intrusivo. El widget no existe si no hay encuesta activa. |

---

## 9. Próxima Sesión — Checklist de Retoma

Al retomar el proyecto, ejecutar en este orden:

```
1. [ ] Leer CLAUDE.md (sección Memory — Last Session)
2. [ ] git status — verificar estado del repo
3. [ ] Obtener credenciales AppKey/AppToken de redcloverqa
4. [ ] Ejecutar scripts/register-md-schemas.sh
5. [ ] vtex link en workspace de prueba
6. [ ] Testing Admin App — checklist sección 5.2
7. [ ] Obtener acceso al store theme repo
8. [ ] Agregar dependencia + bloque al store theme
9. [ ] Testing end-to-end con compra real
```

---

*Documento generado para el challenge VTEX Admin App + Master Data GraphQL — Red Clover 2025*
