# ConstructTrack - Sistema de Gestión de Inventario de Construcción

## Descripción

ConstructTrack es un sistema completo de gestión de inventario diseñado específicamente para la industria de la construcción. Permite controlar materiales, registrar movimientos de entradas y salidas, gestionar categorías y ubicaciones, y generar alertas cuando el stock alcanza niveles críticos.

Desarrollado con las últimas tecnologías para garantizar rendimiento, seguridad y una experiencia de usuario óptima tanto en dispositivos móviles como de escritorio.

## Stack Tecnológico

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend:** Next.js API Routes, Auth.js v5 (NextAuth) con Credentials Provider
- **Base de Datos:** PostgreSQL con Prisma ORM v7 (@prisma/adapter-pg)
- **Estado:** MVP Completo - Funcionalidades core implementadas y probadas
- **Gestor de Paquetes:** pnpm
- **Despliegue:** Entorno Ubuntu (local/producción)

## Características Principales

### Autenticación y Seguridad

- Sistema de login con Auth.js v5 (NextAuth)
- Roles de usuario: Administrador y Operador
- Protección de rutas mediante middleware
- Sesiones seguras con encriptación

### Gestión de Inventario

- CRUD completo de materiales (nombre, unidad, stock mínimo, categoría, ubicación)
- Visualización de stock actual vs mínimo
- Alertas visuales para stock bajo y agotado
- Historial detallado de todos los movimientos

### Movimientos de Stock

- Registro de entradas y salidas de materiales
- Validación de stock suficiente para salidas
- Actualización transaccional del stock
- Notas opcionales para cada movimiento
- Exportación a CSV del historial

### Administración

- Gestión de categorías de materiales
- Gestión de ubicaciones de almacenamiento
- Panel de resumen con estadísticas clave
- Tema claro/oscuro (predeterminado en oscuro)

## Comenzando

### Prerrequisitos

- Node.js 18+
- PostgreSQL
- pnpm (recomendado) o npm/yarn

### Instalación

1. Clonar el repositorio

```bash
git clone <repository-url>
cd constructtrack
```

2. Instalar dependencias

```bash
pnpm install
```

3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con sus credenciales de PostgreSQL y secretos de Auth
```

4. Inicializar la base de datos

```bash
pnpm prisma migrate dev
pnpm db:seed
```

5. Ejecutar el proyecto

```bash
pnpm dev
```

### Credenciales de Acceso

- **Administrador:** admin@constructtrack.com / admin123
- **Operador:** operador@constructtrack.com / operator123

## Estructura del Proyecto

```
constructtrack/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (routes)/           # Rutas protegidas y públicas
│   │   ├── api/                # API routes (Auth)
│   │   ├── dashboard/          # Panel principal
│   │   ├── inventory/          # Gestión de materiales
│   │   ├── movements/          # Registro e historial de movimientos
│   │   ├── categories/         # Gestión de categorías
│   │   ├── locations/          # Gestión de ubicaciones
│   │   └── settings/           # Configuración del sistema
│   ├── actions/                # Server Actions para mutaciones de datos
│   ├── components/             # Componentes reutilizables de UI
│   │   ├── ui/                 # Componentes primitivos de Shadcn/ui
│   │   ├── inventory/          # Components específicos de inventario
│   │   ├── movements/          # Components específicos de movimientos
│   │   └── dashboard/          # Components del panel principal
│   ├── lib/                    # Utilidades y configuraciones
│   │   ├── prisma.ts           # Instancia de Prisma client
│   │   ├── utils.ts            # Funciones de utilidad (clsx, etc.)
│   │   └── movement-utils.ts   # Utilidades específicas para movimientos
│   └── auth.ts                 # Configuración de Auth.js
├── prisma/                     # Esquema y migraciones de Prisma
│   ├── schema.prisma           # Definición del modelo de datos
│   └── seed.ts                 # Script de poblado inicial de datos
├── public/                     # Recursos estáticos
└── .env.example                # Plantilla de variables de entorno
```

## Uso

### Panel Principal (`/dashboard`)

- Vista general del inventario
- Tarjetas de resumen: total de materiales, stock bajo, movimientos hoy
- Alertas de stock que requieren atención
- Botón de acceso rápido a inventario y movimientos

### Inventario (`/inventory`)

- Lista completa de materiales con búsqueda en tiempo real
- Filtros: Todos, Stock Bajo, Stock Normal
- Vista de tarjetas (móvil) y tabla (escritorio)
- Acciones: Editar, Eliminar, Ver detalles
- Formulario para crear nuevos materiales (incluye categoría/ubicación opcional)

### Movimientos (`/movements`)

- Formulario para registrar nuevos movimientos
  - Selección de material con búsqueda
  - Tipo: Entrada (+) o Salida (-)
  - Cantidad, fecha y notas opcionales
  - Validación de stock suficiente para salidas
- Lista de movimientos recientes
  - Vista de tarjetas (móvil) y tabla (escritorio)
  - Detalles expandibles al hacer click
  - Información de categoría, ubicación, usuario y fecha

### Historial de Movimientos (`/movements/history`)

- Filtros avanzados: rango de fechas, material, tipo
- Paginetion eficiente
- Estadísticas de entradas/salidas totales
- Exportación a CSV del historial filtrado

### Categorías y Ubicaciones (`/categories`, `/locations`)

- CRUD completo para gestionar taxonomías
- Lista con búsqueda y acciones de edición/eliminación

### Configuración (`/settings`)

- Información del sistema
- Opciones de tema (claro/oscuro)

## Seguridad

Todas las mutaciones de datos están protegidas mediante:

1. Middleware de Next.js que verifica autenticación en todas las rutas de `/app`
2. Server Actions que validan el `userId` antes de ejecutar operaciones
3. Validación de esquemas con Zod para asegurar integridad de datos de entrada
4. Verificación adicional de existencia de usuario en base de datos para prevenir sesiones huérfanas

- **Nota:** Después de mucho tiempo de inactividad o borrado de cookies, el sistema mostrará un mensaje claro para volver a iniciar sesión en lugar de fallar silenciosamente

## Testing

El proyecto incluye:

- Scripts de semillado con datos de prueba realistas
- Validaciones tanto en cliente como en servidor
- Manejo de errores amigable para el usuario
- Estados de carga y vacíos en todas las listas
- Tests unitarios con Jest para esquemas de validación (cobertura inicial)

## Contribuir

1. Fork el repositorio
2. Crear una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit sus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - vea el archivo [LICENSE](LICENSE) para detalles.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Auth.js](https://authjs.dev/)
- [Prisma ORM](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [Sonner](https://sonner.emilkowal.ski/) (para notificaciones)
