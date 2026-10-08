# ConstructTrack 🏗️ - Sistema Integral de Gestión de Inventario y Control de Obras

[![Next.js](https://img.shields.io/badge/Next.js-16.1.7-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-v7.5.0-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**ConstructTrack** es una plataforma integral para el control de inventario, pañol, logística y gestión de materiales diseñada específicamente para empresas constructoras, contratistas y administradores de proyectos de edificación y obras civiles.

Digitaliza el ciclo completo de abastecimiento en obra: desde la recepción de compras de insumos por parte de proveedores, el control de existencias en almacenes físicos mediante **etiquetas y escáner QR**, hasta la entrega de materiales con **firma digital táctil** y **generación de vales oficiales**.

---

## 📑 Tabla de Contenidos

1. [Características Destacadas](#-características-destacadas)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Módulos del Sistema](#-módulos-del-sistema)
4. [Suite de Etiquetado QR e Impresión Física](#-suite-de-etiquetado-qr-e-impresión-física)
5. [Dashboard Analítico y Control Financiero](#-dashboard-analítico-y-control-financiero)
6. [Modo Demo Interactivo (Sin Base de Datos)](#-modo-demo-interactivo-sin-base-de-datos)
7. [Puesta en Marcha](#-puesta-en-marcha)
8. [Scripts Disponibles](#-scripts-disponibles)
9. [Estructura del Proyecto](#-estructura-del-proyecto)
10. [Documentación Técnica e Integraciones](#-documentación-técnica-e-integraciones)
11. [Testing y Despliegue](#-testing-y-despliegue)

---

## 🚀 Características Destacadas

* **Gestión de Obras y Proyectos (`/projects`):** Imputación de consumos y salidas de materiales directamente a obras activas, permitiendo controlar costes y desvíos presupuestarios.
* **Directorio de Proveedores (`/suppliers`):** Control de compras y proveedores con datos fiscales (RUT/CIF), teléfonos y trazabilidad de ingresos.
* **Suite de Etiquetado QR e Impresión:** Generación individual y por lotes de etiquetas QR para el almacén, lectura directa mediante cámara web o móvil, y planillas oficiales de inventario físico.
* **Vales de Despacho con Firma Digital:** Emisión de remitos/comprobantes con captura de firma táctil manuscrita (`SignaturePad`) en pantalla o smartphone.
* **Importación Masiva desde Excel:** Carga de catálogos e inventarios en lote mediante hojas de cálculo `.xlsx` y `.csv`.
* **Tablero Analítico Ejecutivo:** Gráficos interactivos de operaciones, rotación de insumos, valorización monetaria de stock y distribución por obra.
* **Modo Demo Interactivo:** Prueba la aplicación al instante en memoria sin necesidad de instalar o configurar bases de datos externas.
* **Preparado para Aplicaciones Móviles:** Arquitectura lista para sincronización en obra con clientes móviles externos (React Native / Expo).

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router, React Compiler habilitado), [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) |
| **Estilos e Interfaz** | [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn/ui](https://ui.shadcn.com/), [Base UI](https://base-ui.com/), [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/) |
| **Gráficos y Métricas** | [Recharts](https://recharts.org/) |
| **Backend & Mutaciones** | Server Actions de Next.js, API Routes RESTful, Middleware en el Edge |
| **Base de Datos & ORM** | [PostgreSQL](https://www.postgresql.org/) con [Prisma ORM v7](https://www.prisma.io/) (`@prisma/adapter-pg`) |
| **Autenticación** | Sesiones JWT con [jose](https://github.com/panva/jose) y [bcryptjs](https://github.com/dcodeIO/bcrypt.js), Refresh Tokens en base de datos |
| **Hardware & Captura** | [qrcode](https://www.npmjs.com/package/qrcode) (etiquetas), [html5-qrcode](https://github.com/mebjas/html5-qrcode) (cámara), HTML5 Canvas (firma) |
| **Ofimática & Datos** | [xlsx](https://sheetjs.com/) (importación y exportación de hojas de cálculo Excel) |
| **Gestor de Paquetes** | [pnpm](https://pnpm.io/) |

---

## 📦 Módulos del Sistema

### 1. Inventario y Materiales (`/inventory`)
* **Ficha Técnica del Insumo:** Nombre, unidad de medida, stock actual, stock mínimo para alertas, costo unitario (`unitCost`) y código SKU.
* **Taxonomía:** Agrupación por familias de materiales (`/categories`) y zonas físicas de bodegaje (`/locations`).
* **Buscador Dinámico:** Búsqueda en tiempo real por nombre, SKU o identificador, con filtros rápidos (*Todos, Stock Bajo, Agotados*) y paginación rápida.
* **Importación Masiva:** Carga de materiales vía plantillas Excel con validación de datos.

### 2. Control de Movimientos y Remitos (`/movements`)
* **Entradas (+):** Registro de recepciones asociadas a proveedores y coste de compra.
* **Salidas (-):** Despacho de insumos a obras específicas con control estricto de stock para evitar saldos negativos.
* **Escaneo con Cámara:** Selección inmediata del insumo enfocando la etiqueta QR física con la cámara del dispositivo.
* **Firma de Retiro:** Captura digital de la firma del receptor en pantalla táctil para constancia de entrega.
* **Historial Completo (`/movements/history`):** Auditoría histórica con filtros por fecha, tipo, obra y material, exportable a CSV y Excel.

### 3. Obras y Proyectos (`/projects`)
* Catálogo de obras civiles en ejecución con estado (*Activa, En Pausa, Finalizada*), código, presupuesto y dirección física.
* Consulta de materiales y costes consumidos por cada proyecto.

### 4. Proveedores (`/suppliers`)
* Directorio de contactos y razón social de proveedores, identificador tributario (RUT / CIF / Tax ID), dirección y teléfonos.

### 5. Configuración, Usuarios y Auditoría (`/settings`)
* **Gestión de Cuentas (`/settings/users`):** Administración de usuarios con roles diferenciados:
  * **ADMIN:** Acceso completo al sistema, configuración, obras, proveedores y auditoría.
  * **OPERATOR:** Operación de bodega, registro de movimientos, consultas de stock y vales.
* **Trazabilidad (`/settings/audit`):** Bitácora inmutable de eventos (`AuditLog`) para auditar altas, bajas y modificaciones realizadas por los usuarios.
* **Tema Visual:** Soporte nativo para modo claro y modo oscuro.

---

## 🏷️ Suite de Etiquetado QR e Impresión Física

ConstructTrack conecta la gestión digital con las operaciones físicas en el pañol de obra:

```
                    ┌────────────────────────┐
                    │ Material en Inventario │
                    └───────────┬────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│ Etiqueta QR   │       │ Planilla de   │       │ Vale Oficial  │
│  Individual   │       │  Inventario   │       │  de Despacho  │
│  o en Lote    │       │ Físico (Ciego)│       │ c/Firma Táctil│
└───────────────┘       └───────────────┘       └───────────────┘
```

1. **Etiquetas QR por Lote (`BatchQRPrintModal`):** Impresión masiva en cuadrículas compatibles con hojas adhesivas y rotuladoras térmicas para etiquetar estanterías y paquetes.
2. **Escáner QR Integrado (`CameraScannerModal`):** Permite usar la cámara de cualquier teléfono, tablet o portátil para seleccionar materiales en segundos.
3. **Planillas de Toma de Inventario Físico (`PhysicalInventoryPrintModal`):** Genera hojas oficiales de auditoría listas para imprimir, con soporte para *Conteo Ciego* (ocultando el stock del sistema para mayor rigor en la auditoría) y casillas para firmas.
4. **Vales y Remitos de Salida (`MovementReceiptModal`):** Comprobante formal imprimible de despacho de materiales con los datos de la obra, receptor y su firma digital estampada.

---

## 📊 Dashboard Analítico y Control Financiero

El panel principal (`/dashboard`) ofrece visualizaciones interactivas mediante **Recharts** con cuatro modos de visualización:

* **Modo Flujo & Salud:** Operaciones diarias (entradas vs. salidas) y semáforo de existencias (óptimo, bajo stock y crítico).
* **Modo Financiero:** Capital monetario total inmovilizado en almacén y distribución del valor por categoría.
* **Modo Rotación & Obras:** Ranking de materiales más demandados y desglose de despachos por obra/proyecto.
* **Indicadores Clave (KPIs):** Resumen en tiempo real de insumos totales, stock crítico, proyectos activos y movimientos del día.

---

## 🧪 Modo Demo Interactivo (Sin Base de Datos)

Para explorar, evaluar o presentar la plataforma sin tener que instalar o configurar PostgreSQL ni servicios externos, ConstructTrack incluye un **Modo Demo Interactivo en memoria**:

* **0 Configuración:** No requiere bases de datos locales ni en la nube.
* **Acceso Inmediato en 1-Clic:** En la pantalla de login (`/login`), utiliza los accesos directos:
  * **Entrar como Administrador (Demo)**
  * **Entrar como Operador (Demo)**
* **Datos Realistas Precargados:** Incluye proyectos de edificación, proveedores de materiales, catálogo clasificado, historial de movimientos y auditorías de prueba.
* **Banner de Control:** Un banner superior fijo permite conocer el estado de la sesión demo y reiniciar los datos a su estado original cuando lo desees.

---

## 💻 Puesta en Marcha

### Prerrequisitos
* **Node.js:** Versión 18.18 o superior (recomendado 20+).
* **pnpm:** Versión 9+ (o npm / yarn).
* **PostgreSQL:** Base de datos relacional local o en la nube (Neon, Supabase, Render). *(Opcional si usas el Modo Demo)*.

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/constructtrack.git
   cd constructtrack
   ```

2. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```

   Valores principales en `.env`:
   ```env
   # Base de Datos PostgreSQL
   DATABASE_URL="postgresql://usuario:password@localhost:5432/constructtrack?schema=public"

   # Secretos Criptográficos JWT (mínimo 32 caracteres)
   ACCESS_TOKEN_SECRET="genera-un-secreto-aleatorio-muy-seguro-para-access-token"
   REFRESH_TOKEN_SECRET="genera-un-secreto-aleatorio-muy-seguro-para-refresh-token"

   # Rate Limiting con Upstash Redis (Opcional - usa memoria local si no se define)
   UPSTASH_REDIS_URL="https://tu-instancia.upstash.io"
   UPSTASH_REDIS_TOKEN="tu-token-de-upstash"
   ```

4. **Inicializar la Base de Datos (Omitir si usas Modo Demo):**
   ```bash
   pnpm prisma migrate dev
   pnpm db:seed
   ```

5. **Iniciar en modo desarrollo:**
   ```bash
   pnpm dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Credenciales por Defecto (Base de Datos)
* **Administrador:** `admin@constructtrack.com` / `admin123`
* **Operador:** `operador@constructtrack.com` / `operator123`

---

## 📜 Scripts Disponibles

```bash
pnpm dev        # Inicia el entorno de desarrollo
pnpm build      # Compila la aplicación para producción
pnpm build-bd   # Genera Prisma, corre migraciones y compila (ideal para CI/CD)
pnpm start      # Inicia el servidor compilado en producción
pnpm test       # Ejecuta la suite de pruebas unitarias con Jest
pnpm lint       # Analiza el código con ESLint
pnpm db:seed    # Puebla la base de datos con información inicial
pnpm db:reset   # Resetea y repuebla la base de datos desde cero
```

---

## 📂 Estructura del Proyecto

```
constructtrack/
├── docs/                        # Documentación técnica avanzada
│   ├── API.md                   # Especificación de endpoints REST y ejemplos
│   └── ARQUITECTURA.md          # Sincronización móvil offline y seguridad
├── prisma/
│   ├── schema.prisma            # Modelado de datos (User, Material, Project, etc.)
│   └── seed.ts                  # Semilla de datos de prueba
├── src/
│   ├── actions/                 # Server Actions tipadas para mutaciones
│   ├── app/                     # Rutas de Next.js App Router (Páginas y APIs)
│   ├── components/              # Componentes de UI modulares y reutilizables
│   │   ├── audit/               # Visor de bitácora de auditoría
│   │   ├── dashboard/           # Analítica Recharts y tarjetas KPI
│   │   ├── inventory/           # Tablas, importación Excel, etiquetas QR
│   │   ├── movements/           # Escáner de cámara, firma digital y vales
│   │   ├── projects/            # Gestión de obras y proyectos
│   │   └── suppliers/           # Directorio de proveedores
│   ├── lib/                     # Utilidades, esquemas Zod, Prisma y DemoStore
│   └── middleware.ts            # Middleware Edge de autenticación y seguridad
└── package.json
```

---

## 📚 Documentación Técnica e Integraciones

Para equipos de desarrollo, integraciones con ERPs o desarrollo de aplicaciones móviles complementarias:

* 👉 [**Especificación de la API REST**](docs/API.md): Documentación de endpoints (`/api/materials`, `/api/movements`, etc.), autenticación con Bearer Tokens y ejemplos de peticiones.
* 👉 [**Arquitectura, Sincronización Offline y Seguridad**](docs/ARQUITECTURA.md): Funcionamiento de la sincronización por lotes para zonas sin cobertura, Rate Limiting defensivo y trazabilidad.

---

## 🧪 Testing y Despliegue

### Pruebas Unitarias
Ejecuta las pruebas automatizadas con:
```bash
pnpm test
```
Verifica la validez de los esquemas Zod y la lógica transaccional del almacén en memoria (`DemoStore`).

### Despliegue en Vercel
1. Conecta el repositorio a [Vercel](https://vercel.com/).
2. Asocia una base de datos PostgreSQL (Neon, Supabase o Prisma Postgres).
3. Configura las variables `DATABASE_URL`, `ACCESS_TOKEN_SECRET` y `REFRESH_TOKEN_SECRET`.
4. Define el comando de construcción (**Build Command**) como:
   ```bash
   pnpm build-bd
   ```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
