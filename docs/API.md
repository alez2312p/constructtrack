# ConstructTrack - Especificación de API REST

Esta documentación técnica está dirigida a desarrolladores que deseen integrar clientes móviles (React Native, Expo, Flutter) o sistemas externos (ERPs, software de contabilidad) con el backend de **ConstructTrack**.

---

## 🔐 Autenticación y Cabeceras

La API admite autenticación mediante **Tokens JWT**:
* **Cabecera HTTP:** `Authorization: Bearer <ACCESS_TOKEN>`
* **CORS:** Preconfigurado para admitir orígenes externos con credenciales.

### 1. Iniciar Sesión (Login)
* **Endpoint:** `POST /api/auth/login`
* **Acceso:** Público (Protegido por Rate Limiting)
* **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "email": "operador@constructtrack.com",
  "password": "operator123"
}
```

#### Response (200 OK)
```json
{
  "user": {
    "id": "cm1234567890abcdefg",
    "name": "Operador",
    "email": "operador@constructtrack.com",
    "role": "OPERATOR"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
*(Nota: Para clientes web, también se establecen cookies HTTP-Only seguras).*

---

### 2. Renovar Access Token
* **Endpoint:** `POST /api/auth/refresh`
* **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (200 OK)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Cerrar Sesión (Logout)
* **Endpoint:** `POST /api/auth/logout`
* **Headers:** `Authorization: Bearer <ACCESS_TOKEN>`

Revoca el Refresh Token en la base de datos y destruye las cookies de sesión activas.

---

## 📦 Catálogo de Materiales

### Consultar Materiales
* **Endpoint:** `GET /api/materials`
* **Headers:** `Authorization: Bearer <ACCESS_TOKEN>`
* **Query Params (Opcionales):**
  * `search`: Texto para buscar por nombre o SKU.
  * `category`: ID de la categoría.
  * `location`: ID de la ubicación.
  * `lowStock`: `true` para filtrar únicamente ítems con stock menor o igual al mínimo.

#### Response (200 OK)
```json
{
  "materials": [
    {
      "id": "mat-001",
      "sku": "CEM-PORT-50",
      "name": "Cemento Portland Tipo I",
      "unit": "Bolsa 50kg",
      "currentStock": 140,
      "minStock": 30,
      "unitCost": 8.50,
      "category": { "id": "cat-1", "name": "Cementos" },
      "location": { "id": "loc-1", "name": "Almacén A" }
    }
  ],
  "total": 1
}
```

---

## 🔄 Movimientos de Inventario

### Registrar Entrada o Salida
* **Endpoint:** `POST /api/movements`
* **Headers:** `Authorization: Bearer <ACCESS_TOKEN>`, `Content-Type: application/json`

#### Request Body
```json
{
  "materialId": "mat-001",
  "type": "OUT",
  "quantity": 15,
  "projectId": "proj-torre-norte",
  "receiverName": "Carlos Mendoza (Capataz)",
  "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "notes": "Despacho para fundición de losa piso 3"
}
```

> **Reglas de Negocio:**
> * `type`: Debe ser `"IN"` (Entrada) o `"OUT"` (Salida).
> * Si el tipo es `"OUT"`, se valida que `quantity <= currentStock`.
> * La firma digital (`signature`) se almacena en formato Base64.
> * Las transacciones de stock son atómicas y actualizan el inventario de inmediato.

---

## 🏗️ Obras / Proyectos y Proveedores

### Listar Obras Activas
* **Endpoint:** `GET /api/projects`
* **Headers:** `Authorization: Bearer <ACCESS_TOKEN>`

Retorna la lista de proyectos con estado `ACTIVE` para selección en terreno.

### Listar Proveedores
* **Endpoint:** `GET /api/suppliers`
* **Headers:** `Authorization: Bearer <ACCESS_TOKEN>`

Retorna el directorio de proveedores con datos fiscales y de contacto.

---

## 📡 Sincronización Batch para Apps Móviles

Para aplicaciones de campo que trabajan sin conexión (Offline-First), consulta la guía de arquitectura y sincronización por lotes en:
👉 [Guía de Arquitectura y Sincronización Offline](ARQUITECTURA.md)
