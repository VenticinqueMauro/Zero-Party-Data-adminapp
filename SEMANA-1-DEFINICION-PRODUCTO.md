# Zero-Party Data - Encuestas Post-Compra

## VTEX Admin App Challenge - Semana 1

**Proyecto:** Zero-Party Data Survey Manager  
**Fecha:** Febrero 2025  
**Entorno:** Red Clover QA (`redcloverqa`)  
**Autor:** Mauro - Frontend Developer

---

## 1. Descripción del Problema

### 1.1 El Contexto

Google Analytics y las herramientas de atribución digital funcionan bien para trackear canales digitales con UTMs y clics medibles. Sin embargo, existe una brecha significativa: **los "canales oscuros"** (dark social/dark funnel) que estas herramientas no pueden capturar.

### 1.2 El Problema Específico

**El ecommerce manager tiene visibilidad parcial de su funnel de adquisición.**

Google Analytics puede responder:
- ✅ ¿Cuántos vinieron de Instagram Ads?
- ✅ ¿Cuántos desde Google Shopping?
- ✅ ¿Qué campaña de email convirtió mejor?

Pero **no puede responder**:
- ❌ ¿Cuántos vinieron por recomendación de un amigo/familiar?
- ❌ ¿Quién compró porque vio un TikTok orgánico (sin link)?
- ❌ ¿Cuántos escucharon de nosotros en un podcast?
- ❌ ¿Quién nos descubrió en una tienda física y luego compró online?
- ❌ ¿Por qué eligieron comprarnos a nosotros vs. la competencia?

**Esta brecha se conoce como "Dark Funnel" o "Dark Social"** - canales donde el cliente llega sin un tracking digital claro.

### 1.3 Zero-Party Data vs. Analytics: Complementos, No Reemplazo

| Herramienta | Qué Captura | Limitación |
|-------------|-------------|------------|
| **Google Analytics** | Comportamiento digital, clics, UTMs | Solo canales trackeables |
| **Meta/TikTok Pixels** | Conversiones de ads | Atribución modelada, no real |
| **Zero-Party Data** | Lo que el cliente **dice** que lo trajo | Requiere que el cliente responda |

**Zero-Party Data no reemplaza GA4 — lo complementa** capturando la "atribución percibida" y los canales que las herramientas digitales no ven.

### 1.4 El Costo del Problema

| Problema | Impacto |
|----------|---------|
| **Canales invisibles** | Boca a boca, podcasts, TV, influencers orgánicos no se miden |
| **Atribución incompleta** | GA muestra "Direct" cuando no sabe de dónde vino |
| **Decisiones sesgadas** | Se sobreinvierte en canales fáciles de medir (Ads) |
| **Motivaciones desconocidas** | Sabemos "qué hizo" el cliente, no "por qué" |

### 1.5 La Oportunidad

El momento post-compra (Thank You Page) es el de mayor engagement:
- El cliente acaba de comprar y está satisfecho
- Tiene 30 segundos mientras espera su confirmación
- Está dispuesto a ayudar a la marca
- **Es el momento perfecto para hacer UNA pregunta**

> **Referencia de mercado:** Apps como Fairing (antes EnquireLabs) y KnoCommerce están creciendo rápidamente resolviendo este problema. Capturan "Zero-Party Data" - datos que el cliente proporciona voluntariamente.

### 1.6 Casos de Uso Reales

**Caso 1: El podcast invisible**
- GA4 muestra: "Direct / None"
- Encuesta revela: "Te escuché en el podcast de [X]"
- Acción: Renovar sponsorship del podcast

**Caso 2: El influencer orgánico**
- GA4 muestra: "Social / Instagram" (sin UTM)
- Encuesta revela: "Vi el video de @influencer_xyz"
- Acción: Contactar al influencer para colaboración formal

**Caso 3: El boca a boca**
- GA4 muestra: "Direct"
- Encuesta revela: "Me lo recomendó un amigo"
- Acción: Implementar programa de referidos

---

## 2. Alcance del Producto

### 2.1 Usuario Objetivo

**Primario:** Ecommerce Manager / Marketing Manager

**Necesidades:**
- Saber de dónde vienen sus clientes
- Tomar decisiones de inversión en canales
- Entender el perfil de sus compradores
- Justificar presupuesto de marketing con data real

**Secundario:** Cliente final (responde la encuesta en storefront)

### 2.2 MVP - Qué SÍ Incluye (4 semanas)

| Funcionalidad | Descripción | Prioridad |
|---------------|-------------|-----------|
| **CRUD de Encuestas** | Crear, editar, eliminar encuestas desde Admin | P0 |
| **Configuración de opciones** | Definir pregunta + múltiples opciones de respuesta | P0 |
| **Activar/Desactivar** | Toggle para controlar qué encuesta está activa | P0 |
| **Vista de Respuestas** | Lista de respuestas con filtros básicos | P0 |
| **Dashboard Simple** | Gráfico de barras con distribución de respuestas | P1 |
| **Widget Storefront** | Componente que se renderiza en Order Placed | P0 |
| **Campo "Otro"** | Opción de texto libre para respuestas no listadas | P1 |
| **Paginación** | Navegación en lista de respuestas | P1 |

### 2.3 Qué NO Incluye (Futuro / Post-MVP)

| Funcionalidad | Razón de Exclusión |
|---------------|-------------------|
| Múltiples encuestas simultáneas | Complejidad de lógica de display |
| Recompensas automáticas (cupón) | Requiere integración con promociones VTEX |
| Segmentación por categoría/producto | Scope demasiado amplio para MVP |
| Exportar a CSV/Excel | Nice-to-have, no esencial para validar |
| Integración con CRM externo | Fuera de alcance del challenge |
| Encuestas multi-pregunta | MVP es single-question para simplicidad |
| A/B testing de preguntas | Fase 2 |
| Métricas de tasa de respuesta | Requiere tracking adicional |

### 2.4 Consideración Futura: Incentivos para Responder

> **Nota:** Esta funcionalidad queda fuera del MVP pero se documenta como evolución natural del producto.

#### El Problema de Tasa de Respuesta
Sin incentivo, las encuestas post-compra típicamente tienen tasas de respuesta del 10-20%. Con incentivo, pueden superar el 40%.

#### Opciones de Incentivo (Post-MVP)

| Tipo de Incentivo | Complejidad | Impacto Esperado |
|-------------------|-------------|------------------|
| **Cupón de descuento** | Media (integración con promociones VTEX) | Alto |
| **Puntos de fidelidad** | Alta (requiere sistema de loyalty) | Alto |
| **Entrada a sorteo** | Baja (solo registro en MD) | Medio |
| **Contenido exclusivo** | Baja (link a recurso) | Bajo |
| **Envío gratis próxima compra** | Media (cupón específico) | Alto |

#### Flujo con Incentivo (Futuro)

```
┌─────────────────────────────────────────┐
│  ¿Cómo nos conociste?                   │
│                                         │
│  Responde y obtén 10% OFF en tu         │
│  próxima compra 🎁                      │
│                                         │
│  [Instagram] [TikTok] [Google] [Amigo]  │
└─────────────────────────────────────────┘
                    │
                    ▼ (responde)
┌─────────────────────────────────────────┐
│  ¡Gracias! Tu cupón: GRACIAS10          │
│  Válido por 30 días                     │
└─────────────────────────────────────────┘
```

#### Entidad Adicional Requerida (Futuro)
```
SurveyReward:
- id
- surveyId
- rewardType (coupon | points | raffle)
- rewardValue (código cupón, cantidad puntos, etc.)
- validityDays
- isActive
```

**Decisión MVP:** Se excluye para mantener el alcance manejable en 4 semanas. El CRUD básico de encuestas + respuestas es suficiente para validar la propuesta de valor.

---

## 3. User Stories MVP

### 3.1 Como Ecommerce Manager

| ID | Historia | Criterios de Aceptación |
|----|----------|------------------------|
| US-01 | **Quiero crear una encuesta** con una pregunta y varias opciones para capturar datos de atribución | - Puedo escribir una pregunta<br>- Puedo agregar múltiples opciones<br>- Puedo guardar la encuesta |
| US-02 | **Quiero ver todas mis encuestas** para saber cuáles tengo configuradas | - Veo lista de encuestas<br>- Veo estado (activa/inactiva)<br>- Veo cantidad de respuestas |
| US-03 | **Quiero activar/desactivar una encuesta** para controlar cuándo se muestra | - Toggle funcional<br>- Solo una encuesta activa a la vez<br>- Cambio inmediato |
| US-04 | **Quiero editar una encuesta existente** para corregir opciones o la pregunta | - Puedo modificar pregunta<br>- Puedo agregar/quitar opciones<br>- Se preservan respuestas existentes |
| US-05 | **Quiero eliminar una encuesta** que ya no necesito | - Confirmación antes de eliminar<br>- Se eliminan respuestas asociadas<br>- No se puede eliminar encuesta activa |
| US-06 | **Quiero ver las respuestas recopiladas** para entender de dónde vienen mis clientes | - Lista de respuestas<br>- Filtro por fecha<br>- Ver email del cliente |
| US-07 | **Quiero ver un resumen visual** (gráfico) de las respuestas para tomar decisiones rápidas | - Gráfico de barras/torta<br>- Porcentajes por opción<br>- Cantidad total de respuestas |

### 3.2 Como Cliente (Storefront)

| ID | Historia | Criterios de Aceptación |
|----|----------|------------------------|
| US-08 | **Veo una encuesta simple en la página de confirmación** que puedo responder en 1 click | - Encuesta visible en Order Placed<br>- Opciones clickeables<br>- Feedback de "gracias" al responder |

---

## 4. Wireframes

### 4.1 Pantalla: Lista de Encuestas (Home)

```
┌─────────────────────────────────────────────────────────────────┐
│  Zero-Party Data - Encuestas Post-Compra                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [+ Nueva Encuesta]                                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📊 ¿Cómo nos conociste?                                  │   │
│  │ Estado: ● Activa    Respuestas: 234    Creada: 15/01    │   │
│  │ [Ver Respuestas]  [Editar]  [Desactivar]                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📊 ¿Para quién es esta compra?                          │   │
│  │ Estado: ○ Inactiva  Respuestas: 89     Creada: 10/01    │   │
│  │ [Ver Respuestas]  [Editar]  [Activar]   [Eliminar]      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📊 ¿Qué te convenció de comprar?                        │   │
│  │ Estado: ○ Inactiva  Respuestas: 156    Creada: 05/01    │   │
│  │ [Ver Respuestas]  [Editar]  [Activar]   [Eliminar]      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Elementos clave:**
- Botón prominente para crear nueva encuesta
- Cards con información resumida de cada encuesta
- Indicador visual de estado (activa/inactiva)
- Acciones contextuales según estado

---

### 4.2 Pantalla: Crear/Editar Encuesta

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Volver                                                       │
│                                                                 │
│  Nueva Encuesta                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Pregunta *                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ¿Cómo nos conociste?                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Opciones de respuesta                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Instagram                                          [×]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ TikTok                                             [×]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Google                                             [×]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Recomendación de amigo                             [×]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Otro                                               [×]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [+ Agregar opción]                                             │
│                                                                 │
│  ☑ Incluir campo "Otro" con texto libre                        │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Estado inicial                                                 │
│  ○ Activa (se mostrará inmediatamente)                         │
│  ● Inactiva (guardar como borrador)                            │
│                                                                 │
│                              [Cancelar]  [Guardar Encuesta]     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Elementos clave:**
- Campo de texto para la pregunta
- Lista dinámica de opciones (agregar/eliminar)
- Checkbox para habilitar "Otro" con texto libre
- Selección de estado inicial
- Validación: mínimo 2 opciones

---

### 4.3 Pantalla: Ver Respuestas + Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Volver                                                       │
│                                                                 │
│  📊 ¿Cómo nos conociste?                                        │
│  234 respuestas desde 15/01/2025                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    DISTRIBUCIÓN                         │   │
│  │                                                         │   │
│  │   Instagram ████████████████████░░░░░  42% (98)        │   │
│  │   TikTok    ████████████░░░░░░░░░░░░░  28% (66)        │   │
│  │   Google    ████████░░░░░░░░░░░░░░░░░  15% (35)        │   │
│  │   Amigo     ████░░░░░░░░░░░░░░░░░░░░░  10% (23)        │   │
│  │   Otro      ██░░░░░░░░░░░░░░░░░░░░░░░   5% (12)        │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Respuestas recientes                     [Filtrar por fecha ▼] │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📧 maria@email.com     │ Instagram    │ 02/02 14:32    │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ 📧 juan@email.com      │ TikTok       │ 02/02 13:15    │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ 📧 pedro@email.com     │ Otro: "Vi... │ 02/02 11:44    │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ 📧 ana@email.com       │ Google       │ 02/02 10:22    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [← Anterior]  Página 1 de 24  [Siguiente →]                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Elementos clave:**
- Resumen visual con gráfico de barras horizontales
- Porcentajes y números absolutos
- Tabla de respuestas individuales
- Filtro por rango de fechas
- Paginación

---

### 4.4 Widget: Storefront (Order Placed)

**Estado inicial:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              ✓ ¡Gracias por tu compra!                         │
│                                                                 │
│              Tu pedido #12345 está confirmado                   │
│              Recibirás un email con los detalles                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Ayúdanos con una pregunta rápida 🙏                    │   │
│  │                                                         │   │
│  │  ¿Cómo nos conociste?                                   │   │
│  │                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │  Instagram  │  │   TikTok    │  │   Google    │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  │                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐                      │   │
│  │  │    Amigo    │  │    Otro     │                      │   │
│  │  └─────────────┘  └─────────────┘                      │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│              [Ver mis pedidos]   [Seguir comprando]             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Estado post-respuesta:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │              ✓ ¡Gracias por tu respuesta!               │   │
│  │                                                         │   │
│  │         Nos ayuda a mejorar tu experiencia              │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Consideraciones UX:**
- Diseño no intrusivo, complementa la página de confirmación
- Opciones como botones/chips para 1-click
- Feedback inmediato al responder
- No bloquea la navegación del usuario

---

## 5. Flujo de Navegación

```
                    ┌─────────────────┐
                    │  Lista Encuestas │
                    │     (Home)       │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────────┐
        │  Nueva   │  │  Editar  │  │     Ver      │
        │ Encuesta │  │ Encuesta │  │  Respuestas  │
        └────┬─────┘  └────┬─────┘  └──────────────┘
             │              │              
             │              │              
             ▼              ▼              
        ┌──────────────────────┐          
        │       Guardar        │          
        │    (vuelve a Home)   │          
        └──────────────────────┘          
```

**Navegación Admin App:**
1. Home → Lista de todas las encuestas
2. Home → Nueva Encuesta → Guardar → Home
3. Home → Editar Encuesta → Guardar → Home
4. Home → Ver Respuestas (de una encuesta específica)

---

## 6. Reglas de Negocio

| Regla | Descripción |
|-------|-------------|
| RN-01 | Solo puede haber **una encuesta activa** a la vez |
| RN-02 | Al activar una encuesta, la anterior se desactiva automáticamente |
| RN-03 | No se puede eliminar una encuesta activa (debe desactivarse primero) |
| RN-04 | Una encuesta debe tener mínimo **2 opciones** de respuesta |
| RN-05 | La pregunta es obligatoria y no puede estar vacía |
| RN-06 | Cada cliente solo puede responder **una vez por pedido** |
| RN-07 | Las respuestas se asocian al **orderId** y **email** del cliente |

---

## 7. Métricas de Éxito

### 7.1 Métricas del Producto

| Métrica | Objetivo MVP | Cómo se mide |
|---------|--------------|--------------|
| Tasa de respuesta | > 15% | Respuestas / Pedidos completados |
| Encuestas creadas | ≥ 3 | Conteo en Master Data |
| Respuestas totales | > 100 | Conteo en Master Data |

### 7.2 Métricas Técnicas

| Métrica | Objetivo |
|---------|----------|
| CRUD funcional | 100% operaciones funcionando |
| Tiempo de carga Admin | < 2 segundos |
| Widget renderiza | Sin errores en Order Placed |

---

## 8. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Complejidad GraphQL MD | Media | Alto | Investigar docs semana 2 |
| Widget no renderiza en Order Placed | Baja | Alto | Probar early, tener fallback |
| Scope creep | Alta | Medio | Mantener MVP estricto |
| Performance con muchas respuestas | Baja | Medio | Paginación desde el inicio |

---

## 9. Cronograma

| Semana | Entregables |
|--------|-------------|
| **Semana 1** | ✅ Definición de producto, wireframes, user stories |
| **Semana 2** | Diseño de entidades Master Data, schema GraphQL |
| **Semana 3** | Frontend Admin App (UI navegable, no funcional) |
| **Semana 4** | Backend completo, integración MD GraphQL, CRUD funcional |

---

## 10. Anexos

### 10.1 Preguntas Ejemplo para Encuestas

**Atribución de canal:**
- ¿Cómo nos conociste?
- ¿Dónde viste nuestro producto por primera vez?
- ¿Qué te trajo a nuestra tienda hoy?

**Perfil de comprador:**
- ¿Para quién es esta compra?
- ¿Es tu primera compra con nosotros?
- ¿Cómo describirías tu estilo?

**Motivación de compra:**
- ¿Qué te convenció de comprar?
- ¿Qué casi te hace abandonar la compra?
- ¿Qué podríamos mejorar?

### 10.2 Referencias de Mercado

- **Fairing** (antes EnquireLabs): https://fairing.co
- **KnoCommerce**: https://knocommerce.com
- **Enquire Labs**: Post-purchase surveys

---

## Próximos Pasos

**Semana 2 - Diseño Técnico:**
1. Definir schema de entidades Master Data
2. Diseñar queries y mutations GraphQL
3. Documentar endpoints necesarios
4. Validar factibilidad técnica con MD v2

---

*Documento generado para el challenge VTEX Admin App + Master Data GraphQL - Red Clover 2025*
