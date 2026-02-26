#!/bin/bash
# Script para registrar los JSON Schemas en Master Data v2
# Entorno: redcloverqa
#
# Uso:
#   chmod +x register-md-schemas.sh
#   APP_KEY="tu-app-key" APP_TOKEN="tu-app-token" ./register-md-schemas.sh

set -e

ACCOUNT="redcloverqa"
BASE_URL="https://${ACCOUNT}.vtexcommercestable.com.br"

if [ -z "$APP_KEY" ] || [ -z "$APP_TOKEN" ]; then
  echo "ERROR: Debes definir APP_KEY y APP_TOKEN como variables de entorno."
  echo "Uso: APP_KEY=\"...\" APP_TOKEN=\"...\" ./register-md-schemas.sh"
  exit 1
fi

echo "=== Registrando schemas en Master Data v2 (${ACCOUNT}) ==="

# ─────────────────────────────────────────────
# 1. Schema: zpd_surveys / survey-schema-v1
# ─────────────────────────────────────────────
echo ""
echo "[1/2] Registrando zpd_surveys / survey-schema-v1 ..."

curl -s -o /tmp/response_surveys.json -w "%{http_code}" \
  -X PUT \
  "${BASE_URL}/api/dataentities/zpd_surveys/schemas/survey-schema-v1" \
  -H "Content-Type: application/json" \
  -H "X-VTEX-API-AppKey: ${APP_KEY}" \
  -H "X-VTEX-API-AppToken: ${APP_TOKEN}" \
  -d '{
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
      "description": "Fecha ISO de creacion"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time",
      "description": "Fecha ISO de ultima actualizacion"
    }
  },
  "v-default-fields": [
    "id", "question", "options", "isActive",
    "allowOther", "responseCount", "createdAt", "updatedAt"
  ],
  "v-indexed": ["isActive", "createdAt"],
  "v-cache": false
}' > /tmp/status_surveys.txt

HTTP_STATUS=$(cat /tmp/status_surveys.txt)
RESPONSE=$(cat /tmp/response_surveys.json)

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ] || [ "$HTTP_STATUS" = "204" ]; then
  echo "  ✅ zpd_surveys schema registrado (HTTP ${HTTP_STATUS})"
else
  echo "  ❌ Error registrando zpd_surveys (HTTP ${HTTP_STATUS})"
  echo "  Respuesta: ${RESPONSE}"
  exit 1
fi

# ─────────────────────────────────────────────
# 2. Schema: zpd_responses / response-schema-v1
# ─────────────────────────────────────────────
echo ""
echo "[2/2] Registrando zpd_responses / response-schema-v1 ..."

curl -s -o /tmp/response_responses.json -w "%{http_code}" \
  -X PUT \
  "${BASE_URL}/api/dataentities/zpd_responses/schemas/response-schema-v1" \
  -H "Content-Type: application/json" \
  -H "X-VTEX-API-AppKey: ${APP_KEY}" \
  -H "X-VTEX-API-AppToken: ${APP_TOKEN}" \
  -d '{
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
      "description": "Opcion seleccionada"
    },
    "otherText": {
      "type": "string",
      "maxLength": 500,
      "description": "Texto libre para opcion Otro"
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
}' > /tmp/status_responses.txt

HTTP_STATUS=$(cat /tmp/status_responses.txt)
RESPONSE=$(cat /tmp/response_responses.json)

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ] || [ "$HTTP_STATUS" = "204" ]; then
  echo "  ✅ zpd_responses schema registrado (HTTP ${HTTP_STATUS})"
else
  echo "  ❌ Error registrando zpd_responses (HTTP ${HTTP_STATUS})"
  echo "  Respuesta: ${RESPONSE}"
  exit 1
fi

echo ""
echo "=== Registro completado exitosamente ==="
echo ""
echo "Proximos pasos:"
echo "  1. Verificar entidades en: ${BASE_URL}/api/dataentities/zpd_surveys/schemas/survey-schema-v1"
echo "  2. Ejecutar vtex link para conectar la Admin App"
