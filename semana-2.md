
## Zero-Party Data Survey Manager

### Diseño Técnico: Entidades Master Data, Schema y GraphQL

|Campo|Detalle|
|---|---|
|**Proyecto**|Zero-Party Data Survey Manager|
|**Semana**|2 - Diseño Técnico|
|**Entorno**|Red Clover QA (`redcloverqa`)|
|**Autor**|Mauro - Frontend Developer|
|**Fecha**|Febrero 2025|

---

## 1. Resumen Ejecutivo

Este documento presenta el diseño técnico correspondiente a la Semana 2 del Challenge de Febrero. Partiendo de la definición de producto realizada en la Semana 1, aquí se definen las entidades de Master Data v2, los JSON Schemas para validación de datos, los índices necesarios para búsquedas eficientes, y la capa GraphQL completa (types, queries, mutations y resolvers) que servirá de backend para la Admin App.

### Contexto de Negocio

Como se definió en la Semana 1, este producto nace para cubrir una brecha concreta: los **canales oscuros (dark funnel / dark social)** que Google Analytics y los píxeles de atribución no pueden capturar. Herramientas como GA4 miden bien los canales digitales con UTMs y clics, pero no pueden responder preguntas como "¿cuántos vinieron por recomendación de un amigo?", "¿quién compró porque vio un TikTok orgánico sin link?" o "¿cuántos nos escucharon en un podcast?".

Zero-Party Data **complementa** a GA4 — no lo reemplaza — capturando la **atribución percibida** directamente del cliente en el momento post-compra. Los tres casos de uso documentados en la Semana 1 ilustran por qué cada campo y decisión de diseño en este documento existe:

- **El podcast invisible:** GA4 muestra "Direct/None" → la encuesta revela el podcast → `selectedOption` captura ese dato.
- **El influencer orgánico:** GA4 muestra "Social/Instagram" sin UTM → la encuesta identifica al influencer → `otherText` permite al cliente escribir "@influencer_xyz".
- **El boca a boca:** GA4 muestra "Direct" → la encuesta revela la recomendación → `selectedOption` = "Amigo/Familiar".

### Decisiones Técnicas Clave

El sistema utiliza dos entidades principales en Master Data v2: una para las encuestas (`zpd_surveys`) y otra para las respuestas individuales (`zpd_responses`). La comunicación entre el frontend (Admin App y Widget Storefront) y Master Data se realiza mediante una capa GraphQL implementada con el builder `graphql 1.x` y `node 7.x` de VTEX IO.

> **Nota sobre evolución futura:** La Semana 1 documenta una entidad `SurveyReward` para incentivos post-respuesta (cupones, puntos de fidelidad, sorteos, envío gratis) como consideración post-MVP. El diseño actual de `zpd_surveys` es extensible para incorporar esa entidad en el futuro mediante una relación `surveyId` sin necesidad de modificar los schemas existentes. Ver sección 11.3 para el análisis de extensibilidad.

---

## 2. Arquitectura General

### 2.1 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                         │
│                                                                 │
│  ┌───────────────────────┐      ┌───────────────────────────┐   │
│  │     Admin App         │      │   Widget Storefront       │   │
│  │  (React + Admin UI)   │      │  (React - Order Placed)   │   │
│  │                       │      │                           │   │
│  │  • Lista encuestas    │      │  • Mostrar encuesta       │   │
│  │  • Crear/Editar       │      │  • Capturar respuesta     │   │
│  │  • Ver respuestas     │      │  • Feedback "gracias"     │   │
│  │  • Dashboard          │      │                           │   │
│  └──────────┬────────────┘      └──────────────┬────────────┘   │
│             │                                  │                │
│             │  useQuery / useMutation (Apollo) │                │
└─────────────┼──────────────────────────────────┼────────────────┘
              │                                  │
              ▼                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE SERVICIOS (GraphQL)                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Service App VTEX IO (node 7.x + graphql 1.x)           │    │
│  │                                                         │    │
│  │  schema.graphql ──► Resolvers (TypeScript)              │    │
│  │                          │                              │    │
│  │  Queries:                │  Mutations:                  │    │
│  │  • getSurveys            │  • createSurvey              │    │
│  │  • getSurvey             │  • updateSurvey              │    │
│  │  • getActiveSurvey       │  • deleteSurvey              │    │
│  │  • getResponses          │  • toggleSurveyStatus        │    │
│  │  • getSurveyDashboard    │  • submitResponse            │    │
│  │  • hasOrderResponded     │                              │    │
│  └──────────────────────────┼──────────────────────────────┘    │
│                             │                                   │
│                             │ MasterData Client (@vtex/api)     │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE DATOS (Master Data v2)               │
│                                                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐   │
│  │  zpd_surveys            │  │  zpd_responses              │   │
│  │  (survey-schema-v1)     │  │  (response-schema-v1)       │   │
│  │                         │  │                             │   │
│  │  • question             │  │ • surveyId  ──► zpd_surveys │   │
│  │  • options[]            │  │ • selectedOption            │   │
│  │  • isActive             │  │ • otherText                 │   │
│  │  • allowOther           │  │ • orderId                   │   │
│  │  • responseCount        │  │ • clientEmail               │   │
│  │  • createdAt/updatedAt  │  │ • respondedAt               │   │
│  └─────────────────────────┘  └─────────────────────────────┘   │
│                                                                 │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐                                 │
│    zpd_rewards (POST-MVP)        ◄── Documentada en Semana 1    │
│  │ • surveyId                   │    Sección 2.4 como           │
│    • rewardType (coupon/points)      evolución futura           │
│  │ • rewardValue                │                               │
│    • validityDays                                               │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘                                 │
│                                                                 │
│  Índices: isActive, createdAt, surveyId, orderId,               │
│           clientEmail, respondedAt, selectedOption              │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Flujo de Datos

**Flujo Admin (autenticado):**

```
Admin App (React)
  → useQuery/useMutation (Apollo Client)
    → GraphQL Schema (schema.graphql)
      → Resolver (Node/TypeScript)
        → MasterData Client (@vtex/api)
          → Master Data v2 REST API
            → zpd_surveys / zpd_responses
```

**Flujo Storefront (público):**

```
Widget Order Placed (React)
  → useQuery/useMutation (Apollo Client)
    → GraphQL Schema (schema.graphql)
      → Resolver (Node/TypeScript)
        → MasterData Client (@vtex/api)
          → Master Data v2 REST API
            → zpd_responses
```

---

## 3. Entidades Master Data v2

Se definen dos data entities custom en Master Data v2. Siguiendo la convención de VTEX, los nombres de entidades custom deben ser alfanuméricos y en minúsculas con guiones bajos. Se usa el prefijo `zpd_` (Zero-Party Data) para evitar colisiones con otras apps.

### 3.1 Entidad: `zpd_surveys` (Encuestas)

Almacena la configuración de cada encuesta creada por el ecommerce manager.

|Campo|Tipo|Requerido|Índice|Ejemplo|Descripción|
|---|---|---|---|---|---|
|`id`|string|Auto|PK|(auto-generado)|ID único del documento (generado por MD)|
|`question`|string|Sí|No|¿Cómo nos conociste?|Texto de la pregunta de la encuesta|
|`options`|array<string>|Sí|No|["Instagram","TikTok"]|Opciones de respuesta (mínimo 2)|
|`isActive`|boolean|Sí|Sí|true|Si la encuesta está activa (solo 1 a la vez)|
|`allowOther`|boolean|No|No|true|Habilitar opción "Otro" con texto libre|
|`responseCount`|integer|No|No|234|Contador de respuestas (desnormalizado)|
|`createdAt`|string (ISO)|Sí|Sí|2025-02-15T14:30:00Z|Fecha de creación|
|`updatedAt`|string (ISO)|Sí|No|2025-02-15T14:30:00Z|Fecha de última actualización|

> **Relación con casos de uso:** El campo `options` almacena las opciones que revelan los canales oscuros — por ejemplo: "Podcast", "Recomendación de amigo", "TikTok orgánico", "Tienda física" — canales que GA4 simplemente no puede capturar. El campo `allowOther` es especialmente valioso porque habilita descubrir canales que ni el ecommerce manager anticipó al crear la encuesta.

### 3.2 Entidad: `zpd_responses` (Respuestas)

Almacena cada respuesta individual de un cliente en el storefront.

|Campo|Tipo|Requerido|Índice|Ejemplo|Descripción|
|---|---|---|---|---|---|
|`id`|string|Auto|PK|(auto-generado)|ID único del documento|
|`surveyId`|string|Sí|Sí|abc123|Referencia a `zpd_surveys.id`|
|`selectedOption`|string|Sí|Sí|Instagram|Opción seleccionada por el cliente|
|`otherText`|string|No|No|Vi un video en...|Texto libre cuando elige "Otro"|
|`orderId`|string|Sí|Sí|1234567890-01|ID del pedido VTEX|
|`clientEmail`|string|Sí|Sí|maria@email.com|Email del cliente que respondió|
|`respondedAt`|string (ISO)|Sí|Sí|2025-02-16T10:22:00Z|Fecha y hora de la respuesta|

> **Relación con casos de uso:** `selectedOption` es el dato más valioso del sistema — es lo que revela el canal oscuro. Cuando un cliente selecciona "Podcast" o "Amigo", esa información no existe en ninguna otra herramienta de analytics. El campo `otherText` es especialmente útil para el caso del influencer orgánico: el cliente puede escribir "Vi el video de @influencer_xyz en TikTok", dando al ecommerce manager información accionable para contactar al influencer.

---

## 4. JSON Schemas (Master Data v2)

Los JSON Schemas se registran en Master Data v2 mediante la API `PUT /api/dataentities/{entity}/schemas/{schemaName}`. Estos schemas validan la estructura de los documentos y definen qué campos son públicos (`v-indexed`, `v-default-fields`) para consultas desde el storefront.

### 4.1 Schema: `zpd_surveys` / `survey-schema-v1`

**Endpoint para registrar:**

```
PUT https://redcloverqa.vtexcommercestable.com.br/api/dataentities/zpd_surveys/schemas/survey-schema-v1

Headers:
  Content-Type: application/json
  X-VTEX-API-AppKey: {appKey}
  X-VTEX-API-AppToken: {appToken}
```

**Body del JSON Schema:**

```json
{
  "title": "Zero-Party Data Survey",
  "type": "object",
  "required": ["question", "options", "isActive", "createdAt", "updatedAt"],
  "properties": {
    "question": {
      "type": "string",
      "minLength": 1,
      "maxLength": 500,
      "description": "Texto de la pregunta de la encuesta"
    },
    "options": {
      "type": "array",
      "items": { "type": "string", "minLength": 1 },
      "minItems": 2,
      "maxItems": 20,
      "description": "Opciones de respuesta"
    },
    "isActive": {
      "type": "boolean",
      "default": false,
      "description": "Estado activo/inactivo"
    },
    "allowOther": {
      "type": "boolean",
      "default": false,
      "description": "Habilitar campo Otro con texto libre"
    },
    "responseCount": {
      "type": "integer",
      "default": 0,
      "minimum": 0,
      "description": "Contador desnormalizado de respuestas"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "description": "Fecha ISO de creación"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time",
      "description": "Fecha ISO de última actualización"
    }
  },
  "v-default-fields": [
    "id", "question", "options", "isActive",
    "allowOther", "responseCount", "createdAt", "updatedAt"
  ],
  "v-indexed": ["isActive", "createdAt"],
  "v-cache": false
}
```

### 4.2 Schema: `zpd_responses` / `response-schema-v1`

**Endpoint para registrar:**

```
PUT https://redcloverqa.vtexcommercestable.com.br/api/dataentities/zpd_responses/schemas/response-schema-v1

Headers:
  Content-Type: application/json
  X-VTEX-API-AppKey: {appKey}
  X-VTEX-API-AppToken: {appToken}
```

**Body del JSON Schema:**

```json
{
  "title": "Zero-Party Data Survey Response",
  "type": "object",
  "required": ["surveyId", "selectedOption", "orderId", "clientEmail", "respondedAt"],
  "properties": {
    "surveyId": {
      "type": "string",
      "description": "ID de la encuesta asociada"
    },
    "selectedOption": {
      "type": "string",
      "minLength": 1,
      "description": "Opción seleccionada"
    },
    "otherText": {
      "type": "string",
      "maxLength": 500,
      "description": "Texto libre para opción Otro"
    },
    "orderId": {
      "type": "string",
      "description": "ID del pedido VTEX"
    },
    "clientEmail": {
      "type": "string",
      "format": "email",
      "description": "Email del cliente"
    },
    "respondedAt": {
      "type": "string",
      "format": "date-time",
      "description": "Fecha y hora de la respuesta"
    }
  },
  "v-default-fields": [
    "id", "surveyId", "selectedOption", "otherText",
    "orderId", "clientEmail", "respondedAt"
  ],
  "v-indexed": ["surveyId", "orderId", "clientEmail", "respondedAt", "selectedOption"],
  "v-cache": false
}
```

> **Nota:** `selectedOption` se incluye en `v-indexed` para permitir filtrado eficiente al calcular la distribución de respuestas en el dashboard.

---

## 5. Índices de Master Data v2

Los índices se configuran en el JSON Schema mediante `v-indexed`. Esto permite realizar búsquedas eficientes con el endpoint `GET /search` y filtrar por campos específicos.

### 5.1 Índices para `zpd_surveys`

|Índice|Campos|Uso / Justificación|
|---|---|---|
|`isActive`|`isActive`|Buscar la encuesta activa para mostrar en storefront: `GET /search?isActive=true`|
|`createdAt`|`createdAt`|Ordenar encuestas por fecha de creación en la lista del Admin: `_sort=createdAt DESC`|

### 5.2 Índices para `zpd_responses`

|Índice|Campos|Uso / Justificación|
|---|---|---|
|`surveyId`|`surveyId`|Filtrar respuestas por encuesta: `GET /search?surveyId={id}`|
|`orderId`|`orderId`|Verificar si ya respondió (RN-06): `GET /search?orderId={id}&surveyId={id}`|
|`clientEmail`|`clientEmail`|Buscar respuestas de un cliente específico|
|`respondedAt`|`respondedAt`|Ordenar respuestas cronológicamente y filtrar por rango de fechas|
|`selectedOption`|`selectedOption`|Agregación por opción para el dashboard (conteo por canal)|

---

## 6. Capa GraphQL

La capa GraphQL se implementa como parte de la Service App de VTEX IO usando los builders `graphql 1.x` y `node 7.x`. Siguiendo la guía oficial de VTEX, la estructura de archivos se organiza en la carpeta `graphql/` para tipos y schemas, y `node/` para resolvers y clients.

### 6.1 `manifest.json` (fragmento relevante)

```json
{
  "name": "zpd-survey-manager",
  "vendor": "redcloverqa",
  "version": "0.1.0",
  "builders": {
    "node": "7.x",
    "graphql": "1.x",
    "admin": "0.x",
    "react": "3.x",
    "store": "0.x",
    "messages": "1.x"
  },
  "policies": [
    {
      "name": "ADMIN_DS"
    },
    {
      "name": "outbound-access",
      "attrs": {
        "host": "api.vtex.com",
        "path": "/dataentities/*"
      }
    },
    {
      "name": "outbound-access",
      "attrs": {
        "host": "redcloverqa.vtexcommercestable.com.br",
        "path": "/api/dataentities/*"
      }
    }
  ]
}
```

### 6.2 Estructura de Archivos GraphQL

```
graphql/
├── schema.graphql            # Queries y Mutations
└── types/
    ├── Survey.graphql        # Type Survey
    ├── SurveyInput.graphql   # Input para crear/editar
    ├── Response.graphql      # Type SurveyResponse
    ├── ResponseInput.graphql # Input para crear respuesta
    └── Dashboard.graphql     # Types para dashboard
```

### 6.3 Types GraphQL

**`graphql/types/Survey.graphql`**

```graphql
type Survey {
  id: ID!
  question: String!
  options: [String!]!
  isActive: Boolean!
  allowOther: Boolean
  responseCount: Int
  createdAt: String!
  updatedAt: String!
}
```

**`graphql/types/SurveyInput.graphql`**

```graphql
input SurveyInput {
  question: String!
  options: [String!]!
  isActive: Boolean
  allowOther: Boolean
}
```

**`graphql/types/Response.graphql`**

```graphql
type SurveyResponse {
  id: ID!
  surveyId: String!
  selectedOption: String!
  otherText: String
  orderId: String!
  clientEmail: String!
  respondedAt: String!
}
```

**`graphql/types/ResponseInput.graphql`**

```graphql
input ResponseInput {
  surveyId: String!
  selectedOption: String!
  otherText: String
  orderId: String!
  clientEmail: String!
}
```

**`graphql/types/Dashboard.graphql`**

```graphql
type OptionCount {
  option: String!
  count: Int!
  percentage: Float!
}

type SurveyDashboard {
  surveyId: ID!
  question: String!
  totalResponses: Int!
  distribution: [OptionCount!]!
}
```

### 6.4 Schema Principal (Queries y Mutations)

**`graphql/schema.graphql`**

```graphql
type Query {
  """Lista todas las encuestas, ordenadas por fecha de creación descendente"""
  getSurveys: [Survey!]!

  """Obtiene una encuesta por su ID"""
  getSurvey(id: ID!): Survey

  """Obtiene la encuesta activa actualmente (para storefront)"""
  getActiveSurvey: Survey

  """Lista respuestas de una encuesta con paginación y filtros"""
  getResponses(
    surveyId: String!
    page: Int
    pageSize: Int
    dateFrom: String
    dateTo: String
  ): ResponseList!

  """Dashboard con distribución de respuestas por opción"""
  getSurveyDashboard(surveyId: String!): SurveyDashboard!

  """Verifica si un pedido ya respondió una encuesta (RN-06)"""
  hasOrderResponded(
    orderId: String!
    surveyId: String!
  ): Boolean!
}

type ResponseList {
  data: [SurveyResponse!]!
  total: Int!
  page: Int!
  pageSize: Int!
}

type Mutation {
  """Crea una nueva encuesta"""
  createSurvey(input: SurveyInput!): Survey!

  """Actualiza una encuesta existente"""
  updateSurvey(id: ID!, input: SurveyInput!): Survey!

  """Elimina una encuesta y sus respuestas asociadas"""
  deleteSurvey(id: ID!): Boolean!

  """Activa/desactiva una encuesta (desactiva automáticamente la anterior)"""
  toggleSurveyStatus(id: ID!, isActive: Boolean!): Survey!

  """Registra una respuesta desde el storefront"""
  submitResponse(input: ResponseInput!): SurveyResponse!
}
```

---

## 7. Resolvers (Node.js / TypeScript)

Los resolvers se implementan en TypeScript dentro de la carpeta `node/resolvers/`. Cada resolver interactúa con Master Data v2 a través del cliente nativo `MasterData` disponible en `ctx.clients.masterdata`.

### 7.1 Estructura de Archivos Node

```
node/
├── index.ts                # Entry point, registra resolvers
├── clients/
│   └── index.ts            # Clients class (extiende IOClients)
├── resolvers/
│   ├── survey.ts           # Resolvers de encuestas (CRUD + toggle)
│   ├── response.ts         # Resolvers de respuestas (submit + list)
│   └── dashboard.ts        # Resolver del dashboard (agregación)
└── utils/
    └── constants.ts        # Nombres de entidades, schemas, fields
```

### 7.2 Constantes

**`node/utils/constants.ts`**

```typescript
export const DATA_ENTITY_SURVEYS = 'zpd_surveys'
export const DATA_ENTITY_RESPONSES = 'zpd_responses'
export const SCHEMA_SURVEYS = 'survey-schema-v1'
export const SCHEMA_RESPONSES = 'response-schema-v1'

export const SURVEY_FIELDS = [
  'id', 'question', 'options', 'isActive',
  'allowOther', 'responseCount', 'createdAt', 'updatedAt'
]

export const RESPONSE_FIELDS = [
  'id', 'surveyId', 'selectedOption', 'otherText',
  'orderId', 'clientEmail', 'respondedAt'
]
```

### 7.3 Lógica de Resolvers Clave

#### `createSurvey`

Al crear una encuesta, el resolver genera las fechas `createdAt` y `updatedAt` automáticamente, establece `responseCount` en 0, y si `isActive` es true, primero busca y desactiva cualquier encuesta activa existente (RN-01, RN-02). Usa `masterdata.createDocument()` para persistir en `zpd_surveys` con el schema `survey-schema-v1`.

```typescript
// node/resolvers/survey.ts — createSurvey (pseudocódigo)
export const createSurvey = async (_: any, { input }: { input: SurveyInput }, ctx: Context) => {
  const { masterdata } = ctx.clients
  const now = new Date().toISOString()

  // RN-01/RN-02: Si se crea como activa, desactivar la actual
  if (input.isActive) {
    const activeSurveys = await masterdata.searchDocuments({
      dataEntity: DATA_ENTITY_SURVEYS,
      schema: SCHEMA_SURVEYS,
      fields: ['id'],
      where: 'isActive=true',
    })
    for (const survey of activeSurveys) {
      await masterdata.updatePartialDocument({
        dataEntity: DATA_ENTITY_SURVEYS,
        id: survey.id,
        fields: { isActive: false, updatedAt: now },
      })
    }
  }

  // Crear documento
  const response = await masterdata.createDocument({
    dataEntity: DATA_ENTITY_SURVEYS,
    schema: SCHEMA_SURVEYS,
    fields: {
      ...input,
      isActive: input.isActive ?? false,
      allowOther: input.allowOther ?? false,
      responseCount: 0,
      createdAt: now,
      updatedAt: now,
    },
  })

  // Retornar el documento creado
  return masterdata.getDocument({
    dataEntity: DATA_ENTITY_SURVEYS,
    id: response.DocumentId,
    fields: SURVEY_FIELDS,
  })
}
```

#### `toggleSurveyStatus`

Este resolver es crítico para la regla RN-01 (solo una encuesta activa a la vez). Si se activa una encuesta (`isActive = true`), primero busca en `zpd_surveys` con `isActive=true`, y si encuentra otra encuesta activa, la desactiva mediante `masterdata.updatePartialDocument()`. Luego actualiza el estado de la encuesta solicitada.

```typescript
// node/resolvers/survey.ts — toggleSurveyStatus (pseudocódigo)
export const toggleSurveyStatus = async (
  _: any,
  { id, isActive }: { id: string; isActive: boolean },
  ctx: Context
) => {
  const { masterdata } = ctx.clients
  const now = new Date().toISOString()

  // Verificar que la encuesta existe
  const survey = await masterdata.getDocument({
    dataEntity: DATA_ENTITY_SURVEYS,
    id,
    fields: SURVEY_FIELDS,
  })

  if (!survey) {
    throw new UserInputError('Encuesta no encontrada')
  }

  // RN-01: Si se activa, desactivar cualquier otra activa
  if (isActive) {
    const activeSurveys = await masterdata.searchDocuments({
      dataEntity: DATA_ENTITY_SURVEYS,
      schema: SCHEMA_SURVEYS,
      fields: ['id'],
      where: 'isActive=true',
    })
    for (const s of activeSurveys) {
      if (s.id !== id) {
        await masterdata.updatePartialDocument({
          dataEntity: DATA_ENTITY_SURVEYS,
          id: s.id,
          fields: { isActive: false, updatedAt: now },
        })
      }
    }
  }

  // Actualizar estado de la encuesta solicitada
  await masterdata.updatePartialDocument({
    dataEntity: DATA_ENTITY_SURVEYS,
    id,
    fields: { isActive, updatedAt: now },
  })

  return masterdata.getDocument({
    dataEntity: DATA_ENTITY_SURVEYS,
    id,
    fields: SURVEY_FIELDS,
  })
}
```

#### `deleteSurvey`

Antes de eliminar, verifica que la encuesta no esté activa (RN-03). Si está activa, lanza un error GraphQL. Si está inactiva, primero elimina todas las respuestas asociadas usando scroll en `zpd_responses` con filtro `surveyId`, y luego elimina el documento de la encuesta.

```typescript
// node/resolvers/survey.ts — deleteSurvey (pseudocódigo)
export const deleteSurvey = async (_: any, { id }: { id: string }, ctx: Context) => {
  const { masterdata } = ctx.clients

  // Obtener encuesta para verificar estado
  const survey = await masterdata.getDocument({
    dataEntity: DATA_ENTITY_SURVEYS,
    id,
    fields: SURVEY_FIELDS,
  })

  if (!survey) {
    throw new UserInputError('Encuesta no encontrada')
  }

  // RN-03: No eliminar encuesta activa
  if (survey.isActive) {
    throw new UserInputError('No se puede eliminar una encuesta activa. Desactívela primero.')
  }

  // Eliminar respuestas asociadas usando scroll
  let hasMore = true
  let scrollToken = null
  while (hasMore) {
    const responses = await masterdata.scrollDocuments({
      dataEntity: DATA_ENTITY_RESPONSES,
      schema: SCHEMA_RESPONSES,
      fields: ['id'],
      where: `surveyId=${id}`,
      size: 100,
      ...(scrollToken && { token: scrollToken }),
    })
    for (const response of responses.data) {
      await masterdata.deleteDocument({ dataEntity: DATA_ENTITY_RESPONSES, id: response.id })
    }
    scrollToken = responses.token
    hasMore = responses.data.length === 100
  }

  // Eliminar la encuesta
  await masterdata.deleteDocument({ dataEntity: DATA_ENTITY_SURVEYS, id })
  return true
}
```

#### `submitResponse`

Usado desde el widget storefront. Primero verifica que no exista ya una respuesta para el mismo `orderId` + `surveyId` (RN-06). Si no existe, crea el documento de respuesta con `respondedAt` automático, y luego incrementa el `responseCount` de la encuesta correspondiente.

```typescript
// node/resolvers/response.ts — submitResponse (pseudocódigo)
export const submitResponse = async (_: any, { input }: { input: ResponseInput }, ctx: Context) => {
  const { masterdata } = ctx.clients
  const now = new Date().toISOString()

  // RN-06: Verificar que no haya respondido ya este pedido
  const existing = await masterdata.searchDocuments({
    dataEntity: DATA_ENTITY_RESPONSES,
    schema: SCHEMA_RESPONSES,
    fields: ['id'],
    where: `orderId=${input.orderId} AND surveyId=${input.surveyId}`,
  })

  if (existing.length > 0) {
    throw new UserInputError('Este pedido ya tiene una respuesta registrada para esta encuesta.')
  }

  // Crear respuesta
  const response = await masterdata.createDocument({
    dataEntity: DATA_ENTITY_RESPONSES,
    schema: SCHEMA_RESPONSES,
    fields: {
      ...input,
      respondedAt: now,
    },
  })

  // Incrementar responseCount en la encuesta (desnormalización)
  const survey = await masterdata.getDocument({
    dataEntity: DATA_ENTITY_SURVEYS,
    id: input.surveyId,
    fields: ['responseCount'],
  })

  await masterdata.updatePartialDocument({
    dataEntity: DATA_ENTITY_SURVEYS,
    id: input.surveyId,
    fields: { responseCount: (survey.responseCount || 0) + 1 },
  })

  return masterdata.getDocument({
    dataEntity: DATA_ENTITY_RESPONSES,
    id: response.DocumentId,
    fields: RESPONSE_FIELDS,
  })
}
```

#### `getSurveyDashboard`

Consulta todas las respuestas de una encuesta usando scroll (para manejar más de 100 resultados). Agrupa por `selectedOption` y calcula `count` y `percentage` para cada opción. Retorna la distribución completa ordenada por count descendente.

```typescript
// node/resolvers/dashboard.ts — getSurveyDashboard (pseudocódigo)
export const getSurveyDashboard = async (
  _: any,
  { surveyId }: { surveyId: string },
  ctx: Context
) => {
  const { masterdata } = ctx.clients

  // Obtener info de la encuesta
  const survey = await masterdata.getDocument({
    dataEntity: DATA_ENTITY_SURVEYS,
    id: surveyId,
    fields: ['id', 'question', 'responseCount'],
  })

  if (!survey) {
    throw new UserInputError('Encuesta no encontrada')
  }

  // Obtener todas las respuestas con scroll
  const allResponses: Array<{ selectedOption: string }> = []
  let hasMore = true
  let scrollToken = null

  while (hasMore) {
    const batch = await masterdata.scrollDocuments({
      dataEntity: DATA_ENTITY_RESPONSES,
      schema: SCHEMA_RESPONSES,
      fields: ['selectedOption'],
      where: `surveyId=${surveyId}`,
      size: 100,
      ...(scrollToken && { token: scrollToken }),
    })
    allResponses.push(...batch.data)
    scrollToken = batch.token
    hasMore = batch.data.length === 100
  }

  // Agregar por opción
  const counts: Record<string, number> = {}
  for (const resp of allResponses) {
    counts[resp.selectedOption] = (counts[resp.selectedOption] || 0) + 1
  }

  const total = allResponses.length
  const distribution = Object.entries(counts)
    .map(([option, count]) => ({
      option,
      count,
      percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    surveyId,
    question: survey.question,
    totalResponses: total,
    distribution,
  }
}
```

### 7.4 Entry Point del Service

**`node/index.ts`**

```typescript
import type { ClientsConfig, ServiceContext, RecorderState } from '@vtex/api'
import { Service } from '@vtex/api'
import { Clients } from './clients'

import {
  getSurveys,
  getSurvey,
  getActiveSurvey,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  toggleSurveyStatus,
} from './resolvers/survey'

import {
  getResponses,
  submitResponse,
  hasOrderResponded,
} from './resolvers/response'

import { getSurveyDashboard } from './resolvers/dashboard'

const TIMEOUT_MS = 5000

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
  },
}

export default new Service({
  clients,
  graphql: {
    resolvers: {
      Query: {
        getSurveys,
        getSurvey,
        getActiveSurvey,
        getResponses,
        getSurveyDashboard,
        hasOrderResponded,
      },
      Mutation: {
        createSurvey,
        updateSurvey,
        deleteSurvey,
        toggleSurveyStatus,
        submitResponse,
      },
    },
  },
})
```

---

## 8. Catálogo de Errores GraphQL

Los resolvers retornan errores tipados para facilitar el manejo en el frontend:

|Error|Resolver|Condición|Mensaje|
|---|---|---|---|
|`UserInputError`|`deleteSurvey`|Encuesta no encontrada|"Encuesta no encontrada"|
|`UserInputError`|`deleteSurvey`|Encuesta activa (RN-03)|"No se puede eliminar una encuesta activa. Desactívela primero."|
|`UserInputError`|`submitResponse`|Ya respondió (RN-06)|"Este pedido ya tiene una respuesta registrada para esta encuesta."|
|`UserInputError`|`updateSurvey`|Encuesta no encontrada|"Encuesta no encontrada"|
|`UserInputError`|`updateSurvey`|Menos de 2 opciones (RN-04)|"La encuesta debe tener al menos 2 opciones de respuesta."|
|`UserInputError`|`getSurveyDashboard`|Encuesta no encontrada|"Encuesta no encontrada"|
|`UserInputError`|`toggleSurveyStatus`|Encuesta no encontrada|"Encuesta no encontrada"|

> **Nota:** Los errores de validación de schema (pregunta vacía, opciones insuficientes) también son capturados por Master Data v2 al validar contra el JSON Schema antes de persistir el documento. Estos retornan un HTTP 400 que el resolver propaga como error GraphQL.

---

## 9. Mapeo Reglas de Negocio → Implementación Técnica

|Regla|Descripción|Implementación Técnica|
|---|---|---|
|**RN-01**|Solo una encuesta activa a la vez|`toggleSurveyStatus` busca `isActive=true` y desactiva antes de activar la nueva|
|**RN-02**|Al activar, la anterior se desactiva|Mismo resolver `toggleSurveyStatus` hace `updatePartialDocument({isActive: false})`|
|**RN-03**|No eliminar encuesta activa|`deleteSurvey` verifica `isActive`; si `true`, `throw UserInputError`|
|**RN-04**|Mínimo 2 opciones de respuesta|JSON Schema: `options.minItems: 2`. También validación en frontend|
|**RN-05**|Pregunta obligatoria y no vacía|JSON Schema: `required` + `question.minLength: 1`|
|**RN-06**|Cliente responde una vez por pedido|`submitResponse` busca `orderId`+`surveyId` antes de crear. Query `hasOrderResponded`|
|**RN-07**|Respuestas asociadas a orderId y email|Campos requeridos en `response-schema-v1`. Índices en ambos campos|

---

## 10. Seguridad y Permisos

La Admin App requiere autenticación de usuario admin de VTEX. Las queries y mutations de gestión (CRUD de encuestas, ver respuestas, dashboard) solo deben ser accesibles para usuarios autenticados del Admin. El widget storefront (`submitResponse` y `getActiveSurvey`) debe ser accesible públicamente sin autenticación.

- **Policy `ADMIN_DS`:** Otorga acceso a Master Data desde el servicio Node. Es requerida para que los resolvers puedan leer y escribir documentos.
    
- **Policy `outbound-access`:** Permite conexiones salientes a la API de Master Data v2 en el host de la tienda.
    
- **Directivas GraphQL (`@cacheControl`):** Se pueden usar para configurar cache en queries que no cambien frecuentemente como `getActiveSurvey` (scope `SEGMENT`, maxAge 60s).
    

---

## 11. Validación de Factibilidad Técnica

### 11.1 Compatibilidad Master Data v2

- Master Data v2 soporta entidades custom con nombres alfanuméricos. Los nombres `zpd_surveys` y `zpd_responses` son válidos.
- Los campos tipo array (`options`) son soportados por MD v2 como JSON. El JSON Schema con `type: array` valida correctamente.
- El campo `v-indexed` del schema configura los índices automáticamente al registrar el schema.
- MD v2 es compatible con el cliente `masterdata` de `@vtex/api` que se usa desde los resolvers Node.

### 11.2 Limitaciones Conocidas

- **Límite de 100 documentos por search:** MD v2 search retorna máximo 100 documentos por request. Para el dashboard con más de 100 respuestas, se usa `scroll` con paginación automática en el resolver `getSurveyDashboard`.
- **Sin agregaciones nativas:** No hay SUM, COUNT por grupo en MD v2. La lógica de distribución del dashboard se calcula en el resolver agrupando en memoria.
- **Campo desnormalizado `responseCount`:** Se actualiza desde `submitResponse` para evitar contar respuestas en cada listado de encuestas. Existe riesgo de desincronización si una respuesta se crea por fuera del resolver, pero para el MVP es aceptable.

### 11.3 Extensibilidad para Post-MVP (SurveyReward)

La Semana 1 documenta en su sección 2.4 una entidad `SurveyReward` para incentivos post-respuesta, con campos como `rewardType` (coupon, points, raffle), `rewardValue`, `validityDays` e `isActive`. El diseño actual soporta esta extensión sin cambios breaking:

- **Nueva entidad `zpd_rewards`** se vincularía a `zpd_surveys` mediante `surveyId`, siguiendo el mismo patrón de relación que `zpd_responses` → `zpd_surveys`.
- **El schema `survey-schema-v1` no requiere modificación.** La relación es unidireccional desde rewards hacia surveys.
- **El resolver `submitResponse` podría extenderse** para consultar si la encuesta tiene un reward activo y retornar el cupón/código junto con la respuesta de "gracias".
- **Nuevo type GraphQL `SurveyReward`** y mutation `createReward` se agregarían sin modificar los types existentes.

Esta consideración valida que el diseño del MVP no introduce deuda técnica para la evolución natural del producto.

---

## 12. Respuesta a Riesgos Identificados (Semana 1)

La Semana 1 identifica en su sección 8 cuatro riesgos principales. Este diseño técnico responde directamente a cada uno:

|Riesgo (Semana 1)|Probabilidad|Impacto|Mitigación Aplicada en Semana 2|
|---|---|---|---|
|**Complejidad GraphQL + MD**|Media|Alto|Investigación completada. Se validó que el cliente `masterdata` de `@vtex/api` soporta todas las operaciones necesarias (CRUD, search, scroll, updatePartial). Los resolvers documentados en sección 7 demuestran que cada operación es factible con las APIs existentes.|
|**Widget no renderiza en Order Placed**|Baja|Alto|El diseño separa claramente las queries públicas (`getActiveSurvey`, `submitResponse`) de las autenticadas. Se usará el builder `store 0.x` para registrar el bloque en el store theme. Testing temprano en Semana 3.|
|**Scope creep**|Alta|Medio|Se mantiene MVP estricto: solo 2 entidades, 6 queries, 5 mutations. Features como `SurveyReward` están documentadas como post-MVP (sección 11.3) sin implementación.|
|**Performance con muchas respuestas**|Baja|Medio|Paginación implementada desde el diseño: `getResponses` usa page/pageSize, `getSurveyDashboard` usa scroll para >100 docs, `responseCount` desnormalizado evita COUNT en cada listado.|

---

## 13. Próximos Pasos - Semana 3

Con el diseño técnico completo, la Semana 3 se enfoca en construir el frontend de la Admin App:

1. **Registrar los JSON Schemas en Master Data v2** del entorno `redcloverqa` usando las llamadas API documentadas en la sección 4.
    
2. **Implementar la UI de la Admin App** con React y componentes de VTEX Styleguide: lista de encuestas, formulario crear/editar, vista de respuestas con tabla paginada, y dashboard con gráfico de barras.
    
3. **Implementar navegación entre pantallas** siguiendo el flujo definido en la Semana 1: Home → Nueva Encuesta, Home → Editar, Home → Ver Respuestas.
    
4. **Crear mockups funcionales con datos estáticos** para validar la experiencia de usuario antes de conectar con el backend real en Semana 4.
    

---

## 14. Referencias

- **Master Data API v2:** https://developers.vtex.com/docs/api-reference/master-data-api-v2
- **Developing a GraphQL API in service apps:** https://developers.vtex.com/docs/guides/developing-a-graphql-api-in-service-apps
- **GraphQL + Master Data (Service Course):** https://developers.vtex.com/docs/guides/services-6-graphql-retrieving-data-from-master-data
- **Master Data v2 Basics:** https://developers.vtex.com/docs/guides/master-data-v2-basics
- **Semana 1 - Definición de Producto:** Semana_1_Challenge_Febrero.pdf