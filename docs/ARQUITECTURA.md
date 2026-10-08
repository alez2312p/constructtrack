# Arquitectura Técnica, Sincronización Offline y Seguridad

Este documento describe la arquitectura interna de **ConstructTrack**, los mecanismos de sincronización diferida para aplicaciones móviles en obra y las políticas de seguridad implementadas en el sistema.

---

## 🏗️ 1. Sincronización Móvil Offline-First (Modo Obra)

En la industria de la construcción, las obras suelen presentar zonas sin conectividad a internet (sótanos, excavaciones, túneles, áreas rurales). Para garantizar que las operaciones de almacén no se detengan, el backend proporciona soporte para sincronización por lotes diferida.

### Flujo de Sincronización en Terreno

```
┌─────────────────────────────────┐
│ Operador registra salida en app │
└────────────────┬────────────────┘
                 │
      ¿Hay conexión a Internet?
        /                  \
    [SÍ]                    [NO]
     /                        \
┌───▼────────────────┐   ┌─────▼──────────────────────────────┐
│ Envío inmediato a  │   │ Encolar en almacenamiento local    │
│  /api/movements    │   │ (SQLite / AsyncStorage en el móvil)│
└────────────────────┘   └─────┬──────────────────────────────┘
                               │
                      Al recuperar señal
                               │
                 ┌─────────────▼────────────────────────┐
                 │ Envío de lote masivo                 │
                 │ POST /api/sync/full-batch            │
                 └─────────────┬────────────────────────┘
                               │
                 ┌─────────────▼────────────────────────┐
                 │ Procesamiento atómico en servidor y  │
                 │ respuesta con catálogos actualizados │
                 └──────────────────────────────────────┘
```

### Endpoint de Sincronización Masiva
* **Ruta:** `POST /api/sync/full-batch`
* **Cabecera:** `Authorization: Bearer <TOKEN>`
* **Propósito:** Enviar todos los movimientos registrados offline y, en la misma respuesta, recibir los catálogos actualizados de materiales, proyectos y proveedores para renovar la caché del dispositivo.

#### Payload de Ejemplo
```json
{
  "deviceId": "tablet-bodega-norte-01",
  "authorizedBy": "operador@constructtrack.com",
  "payload": {
    "movements": [
      {
        "materialId": "mat-101",
        "type": "OUT",
        "quantity": 10,
        "projectId": "proj-torre-a",
        "receiverName": "Juan Pérez",
        "signature": "data:image/png;base64,...",
        "notes": "Despacho en sótano -2"
      }
    ]
  }
}
```

#### Tratamiento en el Servidor
1. **Transaccionalidad:** Los movimientos se procesan secuencialmente validando integridad de IDs y recalculando el stock.
2. **Respuesta Unificada:** El servidor retorna `success: true` junto con los catálogos actualizados para refrescar el estado del dispositivo móvil sin requerir múltiples consultas adicionales.

---

## 🛡️ 2. Seguridad y Mitigación de Abusos

### Rate Limiting Defensivo
Para mitigar ataques de fuerza bruta (especialmente en endpoints de autenticación como `/api/auth/login`) y abusos en Server Actions críticas:
* Se implementa un limitador de tasa mediante **Upstash Redis** (`@upstash/ratelimit`).
* **Fallback inteligente en memoria:** Si las variables `UPSTASH_REDIS_URL` o `UPSTASH_REDIS_TOKEN` no están definidas (desarrollo local o entornos sin Redis), el sistema conmuta automáticamente a un limitador en memoria local sin interrumpir el servicio.

### Autenticación Criptográfica Dual
* **Web:** Cookies HTTP-Only con banderas `SameSite: Lax` y `Secure` que previenen ataques XSS y CSRF.
* **API / Clientes Móviles:** Cabeceras Bearer con tokens JWT firmados con algoritmo HS256 (`jose`).
* **Tokens de Acceso de Corta Duración:** Los Access Tokens expiran en 15 minutos para minimizar la ventana de exposición.
* **Refresh Tokens Rotativos:** Los Refresh Tokens se persisten con hash criptográfico en la base de datos (`model RefreshToken`), lo que permite revocar sesiones específicas o cerrar sesión en todos los dispositivos de forma remota.

### Validación de Datos en Todas las Capas (Zod)
* Ninguna entrada de datos (ni en Server Actions ni en endpoints REST) interactúa con la base de datos sin pasar previamente por esquemas estrictos de **Zod** (`src/lib/validation/schemas.ts`).
* Se previenen inyecciones, tipos inesperados o cantidades negativas que puedan desvirtuar el inventario.

### Middleware en el Edge
* El archivo `src/middleware.ts` opera en el Edge runtime de Next.js, verificando la presencia y validez criptográfica del token antes de permitir la ejecución de cualquier ruta protegida en `/app`, reduciendo la carga del servidor de base de datos ante peticiones no autorizadas.

---

## 🪵 3. Observabilidad y Logs Estructurados

El sistema incluye una instancia centralizada de **Winston** (`src/lib/logger.ts`) que formatea los eventos del sistema:
* **Entornos soportados:** Salida formateada con colores para consola en desarrollo y formato JSON estructurado para producción.
* **Configuración:** El nivel de severidad se controla mediante la variable de entorno `LOG_LEVEL` (`debug`, `info`, `warn`, `error`).
* **Bitácora de Auditoría en Base de Datos:** Las acciones del negocio (crear material, modificar obra, eliminar usuario) se registran de forma permanente en la tabla `AuditLog` para auditorías de cumplimiento.
