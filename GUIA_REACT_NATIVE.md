# Guía Paso a Paso: Creación de la App Móvil en React Native para ConstructTrack

Esta guía detalla la arquitectura, configuración e implementación paso a paso para desarrollar la aplicación móvil de **ConstructTrack** utilizando **React Native** con **Expo**.

---

## 1. Visión General y Objetivos del Proyecto Móvil

**ConstructTrack** es un sistema de control de inventario de materiales para construcción actualmente desarrollado como aplicación web en Next.js 15, Prisma ORM y PostgreSQL. En el entorno real de una obra o almacén, los operadores y supervisores necesitan una aplicación móvil nativa que aproveche el hardware del dispositivo para:

1. **Escaneo de Materiales en Campo:** Utilizar la cámara física del móvil como escáner de alta velocidad para códigos QR y códigos de barras (SKU o ID del material).
2. **Registro de Movimientos en Tiempo Real:** Registrar entradas (recepción de proveedores) y salidas (despacho a obras/frentes).
3. **Firma Digital de Recepción:** Capturar la firma táctil del receptor directamente en la pantalla del teléfono al despachar material.
4. **Comprobantes Digitales:** Visualizar y compartir comprobantes de entrega en formato digital o PDF.
5. **Resiliencia ante Baja Conectividad (Modo Obra/Offline):** Capacidad de consultar stock en caché y encolar movimientos cuando se trabaja en sótanos o zonas sin señal.

```
┌──────────────────────────────────────────────────────────┐
│                   Arquitectura del Sistema               │
└──────────────────────────────────────────────────────────┘
           ┌───────────────────────────────────┐
           │        ConstructTrack Web         │
           │  (Next.js 15 + Prisma + Postgres) │
           └─────────────────┬─────────────────┘
                             │ API REST / JSON
                             │ (Tokens Bearer JWT)
                             ▼
           ┌───────────────────────────────────┐
           │     ConstructTrack Mobile App     │
           │       (React Native + Expo)       │
           ├─────────────────┬─────────────────┤
           │                 │                 │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │   Cámara    │   │ Firma Táctil│   │ Modo Offline│
    │  Lector QR  │   │  Recepción  │   │ SQLite/Cache│
    └─────────────┘   └─────────────┘   └─────────────┘
```

---

## 2. Requisitos Previos y Stack Tecnológico Recomendado

### 2.1 Herramientas Requeridas en la Máquina de Desarrollo
- **Node.js:** Versión 20 LTS o superior.
- **Gestor de Paquetes:** `pnpm` o `npm`.
- **Git:** Configurado localmente.
- **Expo Go** o **Dispositivo móvil / Emulador Android / Simulador iOS**:
  - En Android: Android Studio con emulador configurado o teléfono físico con la app *Expo Go*.
  - En iOS: Xcode (requiere macOS) o dispositivo físico con la app *Expo Go*.

### 2.2 Stack Técnico de la App Móvil

| Área | Tecnología Recomendada | Justificación |
|---|---|---|
| **Framework Base** | **Expo (SDK 51 o 52)** + React Native | El estándar oficial de la industria; simplifica el manejo de cámara, permisos nativos, firmas y compilación con EAS. |
| **Lenguaje** | **TypeScript** | Coherencia tipada con los esquemas Zod e interfaces del backend actual. |
| **Navegación** | **React Navigation 6/7** o **Expo Router** | Pestañas inferiores (*Bottom Tabs*) para acceso rápido y pilas de navegación (*Stack Navigator*) para flujos. |
| **Estilos UI** | **NativeWind (Tailwind CSS)** | Permite reutilizar la misma mentalidad de diseño Tailwind usada en la app web de Next.js. |
| **Almacenamiento Seguro** | **`expo-secure-store`** | Para almacenar `accessToken` y `refreshToken` cifrados en el hardware (Keychain en iOS / KeyStore en Android). |
| **Cámara / Lector QR** | **`expo-camera`** | Reconocimiento nativo instantáneo de códigos QR y de barras (EAN-13, Code 128, etc.). |
| **Firma Digital** | **`react-native-signature-canvas`** | Permite dibujar la firma del receptor y exportarla en Base64 compatible con el campo `signature` de Prisma. |
| **Cliente HTTP y Caché** | **Axios** + **TanStack React Query v5** | Manejo de caché en memoria, reintentos y refresco automático de tokens mediante interceptores. |
| **Formularios & Validación** | **React Hook Form** + **Zod** | Reutiliza los mismos esquemas `loginSchema`, `movementSchema` y `materialSchema` del backend. |
| **Iconografía** | **`lucide-react-native`** | Mismos iconos que el proyecto Next.js (`lucide-react`). |

---

## 3. Fase 1: Adaptación del Backend Next.js para Clientes Móviles

Actualmente, el proyecto web gestiona sesiones mediante cookies HTTP-only (`setAuthCookies` en `src/lib/auth/tokens-server.ts`) y Server Actions. Las aplicaciones móviles en React Native se comunican mejor mediante encabezados estándar:
`Authorization: Bearer <accessToken>`.

### 3.1 Ajustar `/api/auth/login` para Devolver Tokens en el Body
En `src/app/api/auth/login/route.ts`, modificar la respuesta exitosa para que retorne los tokens en JSON además de las cookies:

```typescript
// En src/app/api/auth/login/route.ts
return NextResponse.json({
  success: true,
  accessToken: result.accessToken,
  refreshToken: result.refreshToken,
  user: {
    id: result.id,
    role: result.role,
    name: result.name,
    email: result.email,
  },
  redirectTo: "/dashboard",
});
```

### 3.2 Crear Helper para Validar `Bearer Token` en API Routes
Crear el archivo `src/lib/auth/verify-mobile-request.ts` en el backend para admitir peticiones móviles:

```typescript
import { verifyAccessToken } from "./tokens-edge";

export async function verifyApiAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = await verifyAccessToken(token);
  return payload; // { id, role, isDemo, demoSessionId }
}
```

### 3.3 Endpoints REST Mínimos Necesarios para la App Móvil

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión y obtener `{ accessToken, refreshToken }`. |
| `POST` | `/api/auth/refresh` | Renovar el Access Token vencido enviando el Refresh Token. |
| `GET` | `/api/materials` | Listar materiales con paginación, filtros de stock bajo y búsqueda. |
| `GET` | `/api/materials/:id` | Obtener detalle de material por ID o SKU escaneado. |
| `POST` | `/api/movements` | Registrar entrada o salida con firma táctil en Base64. |
| `GET` | `/api/movements` | Historial de movimientos con filtros de fecha y tipo. |
| `GET` | `/api/dashboard/stats` | Métricas resumidas: alertas de stock bajo, materiales totales, movimientos del día. |
| `GET` | `/api/projects` | Listar obras activas para selector de salida. |
| `GET` | `/api/suppliers` | Listar proveedores para selector de entrada. |

---

## 4. Fase 2: Creación e Inicialización del Proyecto Móvil

### Paso 4.1: Crear el proyecto con Expo CLI
Abre tu terminal en una carpeta independiente (por ejemplo `../constructtrack-mobile`):

```bash
npx create-expo-app@latest constructtrack-mobile --template blank-typescript
cd constructtrack-mobile
```

### Paso 4.2: Instalar Dependencias Principales

```bash
# Navegación
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack react-native-screens react-native-safe-area-context

# Hardware: Cámara y Almacenamiento seguro
npx expo install expo-camera expo-secure-store expo-haptics expo-print expo-sharing

# Firma digital
npm install react-native-signature-canvas react-native-webview

# Peticiones HTTP, Estado y Validación
npm install axios @tanstack/react-query zustand react-hook-form @hookform/resolvers zod date-fns

# Iconos y Estilos
npm install lucide-react-native nativewind tailwindcss react-native-svg
```

### Paso 4.3: Configurar Tailwind / NativeWind
Inicializa el archivo de configuración de Tailwind:

```bash
npx tailwindcss init
```

Edita `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ea580c", // Naranja de construcción (color corporativo)
        surface: "#0f172a", // Tema oscuro elegante similar al web
        card: "#1e293b",
        border: "#334155",
      },
    },
  },
  plugins: [],
};
```

Agrega la configuración al archivo `babel.config.js`:
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

---

## 5. Fase 3: Estructura de Directorios del Proyecto Móvil

Estructura modular recomendada para mantener el proyecto limpio y escalable:

```
constructtrack-mobile/
├── assets/                  # Logos, splash screen, iconos de app
├── src/
│   ├── api/                 # Cliente Axios e interceptores de autenticación
│   │   ├── client.ts        # Axios base con inyección de JWT y refresh automático
│   │   ├── auth.ts          # Métodos de login y logout
│   │   ├── materials.ts     # Peticiones de materiales y stock
│   │   ├── movements.ts     # Registro y consulta de movimientos
│   │   └── lookups.ts       # Listado de obras (proyectos) y proveedores
│   ├── components/          # Componentes reutilizables
│   │   ├── ui/              # Botones, inputs, badges de stock, tarjetas
│   │   ├── BarcodeScannerModal.tsx # Lector de código de barras con expo-camera
│   │   ├── SignatureModal.tsx      # Lienzo de firma para despachos
│   │   └── StockBadge.tsx          # Indicador visual de stock (Normal, Bajo, Agotado)
│   ├── navigation/          # Definición de rutas y navegación
│   │   ├── AppNavigator.tsx # Selector de flujo Auth vs Flujo Principal
│   │   ├── TabNavigator.tsx # Bottom Tabs (Dashboard, Inventario, Escáner, Movimientos)
│   │   └── types.ts         # Tipado de rutas de React Navigation
│   ├── screens/             # Pantallas de la aplicación
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── inventory/
│   │   │   ├── InventoryListScreen.tsx
│   │   │   └── MaterialDetailScreen.tsx
│   │   ├── movements/
│   │   │   ├── NewMovementScreen.tsx
│   │   │   ├── MovementsHistoryScreen.tsx
│   │   │   └── MovementReceiptScreen.tsx
│   │   └── settings/
│   │       └── SettingsScreen.tsx
│   ├── store/               # Estado global con Zustand
│   │   ├── useAuthStore.ts  # Sesión, usuario y tokens
│   │   └── useOfflineQueue.ts # Cola de movimientos pendientes si no hay red
│   ├── types/               # Tipos TypeScript (Material, Movimiento, Obra)
│   │   └── index.ts
│   └── utils/               # Funciones de formato, fechas y monedas
│       └── formatters.ts
├── App.tsx                  # Punto de entrada principal con QueryClientProvider
├── app.json                 # Configuración de Expo y permisos de cámara
├── package.json
└── tsconfig.json
```

---

## 6. Fase 4: Implementación de Módulos Clave con Código

### 6.1 Configuración de Permisos en `app.json`
Edita `app.json` para solicitar permisos de cámara en Android e iOS:

```json
{
  "expo": {
    "name": "ConstructTrack",
    "slug": "constructtrack-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "ConstructTrack necesita acceso a la cámara para escanear códigos QR de materiales en obra."
        }
      ]
    ],
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#0f172a"
      },
      "permissions": ["CAMERA"]
    },
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "ConstructTrack necesita acceso a la cámara para escanear códigos QR de materiales en obra."
      }
    }
  }
}
```

---

### 6.2 Cliente HTTP con Interceptores JWT y Refresco Automático
Crea `src/api/client.ts`:

```typescript
import axios from "axios";
import * as SecureStore from "expo-secure-store";

// En emulador Android usar 10.0.2.2 en vez de localhost. En dispositivo físico usar la IP local de tu PC (ej: 192.168.1.50:3000)
export const API_BASE_URL = "http://10.0.2.2:3000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para inyectar Access Token
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refresco automático ante 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        if (!refreshToken) throw new Error("Sin refresh token");

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        await SecureStore.setItemAsync("accessToken", data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        // Token expiró definitivamente, limpiar almacenamiento
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
      }
    }
    return Promise.reject(error);
  }
);
```

---

### 6.3 Store de Autenticación con Zustand
Crea `src/store/useAuthStore.ts`:

```typescript
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { apiClient } from "../api/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "OPERATOR" | "AUDITOR";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { accessToken, refreshToken, user } = response.data;

      await SecureStore.setItemAsync("accessToken", accessToken);
      await SecureStore.setItemAsync("refreshToken", refreshToken);

      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.error || "Error al iniciar sesión";
      return { success: false, error: msg };
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }
      set({ isAuthenticated: true, isLoading: false });
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },
}));
```

---

### 6.4 Módulo de Cámara: Escáner QR / Código de Barras
Crea `src/components/BarcodeScannerModal.tsx`:

```tsx
import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { X, RefreshCw } from "lucide-react-native";

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (scannedValue: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  visible,
  onClose,
  onScan,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Se requiere permiso para usar la cámara y escanear materiales.
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Conceder Permiso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onClose}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Feedback háptico (vibración corta al escanear con éxito)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let resolvedId = data;
    try {
      // Si el código QR contenía un JSON con { id: "..." }
      const parsed = JSON.parse(data);
      if (parsed.id) resolvedId = parsed.id;
    } catch {
      // Valor en texto plano (SKU o ID)
    }

    onScan(resolvedId);
    setScanned(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "ean13", "code128"],
          }}
        />

        {/* Encabezado con botón de cierre */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Escaneando Material...</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color="#ffffff" size={24} />
          </TouchableOpacity>
        </View>

        {/* Guía visual del marco de escaneo */}
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.hint}>Apunta al código QR o código de barras del material</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerTitle: { color: "#ffffff", fontSize: 18, fontWeight: "600" },
  closeButton: { padding: 8, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 20 },
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    position: "relative",
  },
  corner: { position: "absolute", width: 24, height: 24, borderColor: "#ea580c" },
  topLeft: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4 },
  hint: { color: "#ffffff", marginTop: 24, fontSize: 14, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  permissionContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#0f172a" },
  permissionText: { color: "#ffffff", fontSize: 16, textAlign: "center", marginBottom: 20 },
  button: { backgroundColor: "#ea580c", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginVertical: 6 },
  cancelBtn: { backgroundColor: "#334155" },
  buttonText: { color: "#ffffff", fontWeight: "600" },
});
```

---

### 6.5 Módulo de Firma Digital Táctil para Despachos
Crea `src/components/SignatureModal.tsx`:

```tsx
import React, { useRef } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import SignatureCanvas from "react-native-signature-canvas";
import { X, Check, RotateCcw } from "lucide-react-native";

interface SignatureModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (signatureBase64: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const signatureRef = useRef<any>(null);

  const handleOK = (signature: string) => {
    // Retorna la firma en base64 (data:image/png;base64,...)
    onSave(signature);
    onClose();
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Firma del Receptor</Text>
          <TouchableOpacity onPress={onClose}>
            <X color="#ffffff" size={24} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          El receptor debe firmar en el recuadro blanco para confirmar la recepción del material.
        </Text>

        <View style={styles.canvasContainer}>
          <SignatureCanvas
            ref={signatureRef}
            onOK={handleOK}
            webStyle={`.m-signature-pad--footer { display: none; margin: 0px; } body,html { width: 100%; height: 100%; }`}
            descriptionText=""
            clearText=""
            confirmText=""
            backgroundColor="#ffffff"
            penColor="#0f172a"
          />
        </View>

        {/* Acciones */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleClear}>
            <RotateCcw size={18} color="#ffffff" />
            <Text style={styles.buttonText}>Borrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => signatureRef.current?.readSignature()}
          >
            <Check size={18} color="#ffffff" />
            <Text style={styles.buttonText}>Aceptar Firma</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", padding: 20, paddingTop: 50 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "bold", color: "#ffffff" },
  subtitle: { color: "#94a3b8", fontSize: 14, marginBottom: 16 },
  canvasContainer: { flex: 1, borderRadius: 12, overflow: "hidden", borderWidth: 2, borderColor: "#334155" },
  actions: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 16 },
  secondaryButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#334155", padding: 14, borderRadius: 8 },
  primaryButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#ea580c", padding: 14, borderRadius: 8 },
  buttonText: { color: "#ffffff", fontWeight: "600", fontSize: 16 },
});
```

---

### 6.6 Pantalla de Registro de Movimientos (Entrada / Salida de Material)
Crea `src/screens/movements/NewMovementScreen.tsx`:

```tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Image,
} from "react-native";
import { BarcodeScannerModal } from "../../components/BarcodeScannerModal";
import { SignatureModal } from "../../components/SignatureModal";
import { QrCode, PenTool, CheckCircle, ArrowDownLeft, ArrowUpRight } from "lucide-react-native";
import { apiClient } from "../../api/client";

export const NewMovementScreen: React.FC = () => {
  const [type, setType] = useState<"IN" | "OUT">("OUT");
  const [materialId, setMaterialId] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [currentStock, setCurrentStock] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [signature, setSignature] = useState("");
  const [notes, setNotes] = useState("");

  const [scannerOpen, setScannerOpen] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Al escanear un código de barras / QR
  const handleScanSuccess = async (scannedId: string) => {
    try {
      const response = await apiClient.get(`/materials/${scannedId}`);
      const material = response.data;
      setMaterialId(material.id);
      setMaterialName(material.name);
      setCurrentStock(material.currentStock);
    } catch {
      Alert.alert("No encontrado", `No se encontró material con código: ${scannedId}`);
    }
  };

  const handleSubmit = async () => {
    if (!materialId) {
      Alert.alert("Error", "Debes seleccionar o escanear un material.");
      return;
    }

    const qtyNum = parseFloat(quantity);
    if (!quantity || isNaN(qtyNum) || qtyNum <= 0) {
      Alert.alert("Error", "Ingresa una cantidad válida mayor a 0.");
      return;
    }

    if (type === "OUT" && currentStock !== null && qtyNum > currentStock) {
      Alert.alert("Stock insuficiente", `Stock disponible: ${currentStock}. No puedes despachar ${qtyNum}.`);
      return;
    }

    if (type === "OUT" && !receiverName.trim()) {
      Alert.alert("Error", "El nombre de la persona que recibe es obligatorio para salidas.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/movements", {
        materialId,
        type,
        quantity: qtyNum,
        receiverName: type === "OUT" ? receiverName : undefined,
        signature: type === "OUT" ? signature : undefined,
        notes: notes.trim() || undefined,
        date: new Date().toISOString(),
      });

      Alert.alert("Éxito", "Movimiento registrado correctamente en el inventario.");
      // Limpiar formulario
      setMaterialId("");
      setMaterialName("");
      setQuantity("");
      setReceiverName("");
      setSignature("");
      setNotes("");
      setCurrentStock(null);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Error al registrar el movimiento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Registrar Movimiento</Text>

      {/* Selector de Tipo (Entrada / Salida) */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, type === "IN" && styles.typeInActive]}
          onPress={() => setType("IN")}
        >
          <ArrowDownLeft color={type === "IN" ? "#ffffff" : "#94a3b8"} size={20} />
          <Text style={[styles.typeText, type === "IN" && styles.typeTextActive]}>Entrada (+)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, type === "OUT" && styles.typeOutActive]}
          onPress={() => setType("OUT")}
        >
          <ArrowUpRight color={type === "OUT" ? "#ffffff" : "#94a3b8"} size={20} />
          <Text style={[styles.typeText, type === "OUT" && styles.typeTextActive]}>Salida (-)</Text>
        </TouchableOpacity>
      </View>

      {/* Selección / Escaneo de Material */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Material</Text>
        <View style={styles.scannerRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="ID, SKU o nombre..."
            placeholderTextColor="#64748b"
            value={materialName || materialId}
            editable={false}
          />
          <TouchableOpacity style={styles.scanButton} onPress={() => setScannerOpen(true)}>
            <QrCode color="#ffffff" size={22} />
          </TouchableOpacity>
        </View>
        {currentStock !== null && (
          <Text style={styles.stockHelper}>Stock actual disponible: {currentStock}</Text>
        )}
      </View>

      {/* Cantidad */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Cantidad</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />
      </View>

      {/* Campos de Salida: Receptor y Firma Táctil */}
      {type === "OUT" && (
        <>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nombre de quien recibe (Obra / Cuadrilla)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Ing. Carlos Pérez"
              placeholderTextColor="#64748b"
              value={receiverName}
              onChangeText={setReceiverName}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Firma Digital</Text>
            {signature ? (
              <View style={styles.signaturePreview}>
                <Image source={{ uri: signature }} style={styles.signatureImage} resizeMode="contain" />
                <TouchableOpacity
                  style={styles.changeSignatureBtn}
                  onPress={() => setSignatureOpen(true)}
                >
                  <Text style={styles.changeSignatureText}>Cambiar Firma</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.signButton}
                onPress={() => setSignatureOpen(true)}
              >
                <PenTool color="#ea580c" size={20} />
                <Text style={styles.signButtonText}>Capturar Firma Táctil</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      {/* Notas opcionales */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Notas / Observaciones</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Comentarios adicionales..."
          placeholderTextColor="#64748b"
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      {/* Botón de Envío */}
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <CheckCircle color="#ffffff" size={20} />
        <Text style={styles.submitButtonText}>
          {isSubmitting ? "Registrando..." : "Guardar Movimiento"}
        </Text>
      </TouchableOpacity>

      {/* Modales */}
      <BarcodeScannerModal
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScanSuccess}
      />
      <SignatureModal
        visible={signatureOpen}
        onClose={() => setSignatureOpen(false)}
        onSave={setSignature}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 20, paddingBottom: 40 },
  screenTitle: { fontSize: 24, fontWeight: "bold", color: "#ffffff", marginBottom: 20 },
  typeSelector: { flexDirection: "row", gap: 12, marginBottom: 20 },
  typeButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 10, backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155" },
  typeInActive: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  typeOutActive: { backgroundColor: "#ea580c", borderColor: "#ea580c" },
  typeText: { color: "#94a3b8", fontWeight: "600" },
  typeTextActive: { color: "#ffffff" },
  fieldContainer: { marginBottom: 16 },
  label: { color: "#cbd5e1", fontSize: 14, fontWeight: "500", marginBottom: 6 },
  input: { backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155", borderRadius: 8, padding: 12, color: "#ffffff", fontSize: 16 },
  textArea: { height: 80, textAlignVertical: "top" },
  scannerRow: { flexDirection: "row", gap: 8 },
  scanButton: { backgroundColor: "#ea580c", padding: 12, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  stockHelper: { color: "#38bdf8", fontSize: 12, marginTop: 4 },
  signButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: "#ea580c", borderStyle: "dashed", borderRadius: 8, padding: 16, backgroundColor: "#1e293b" },
  signButtonText: { color: "#ea580c", fontWeight: "600" },
  signaturePreview: { backgroundColor: "#ffffff", borderRadius: 8, padding: 8, alignItems: "center" },
  signatureImage: { width: "100%", height: 100 },
  changeSignatureBtn: { marginTop: 6, paddingVertical: 4 },
  changeSignatureText: { color: "#ea580c", fontSize: 12, fontWeight: "600" },
  submitButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#ea580c", padding: 16, borderRadius: 10, marginTop: 12 },
  submitButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});
```

---

## 7. Fase 5: Manejo de Modo Offline en Obra (Sincronización Diferida)

En construcción, las obras suelen tener áreas sin cobertura (sótanos, zonas rurales). Es vital que la app no se bloquee:

1. **Lectura de Catálogo:** Se guarda en caché la lista de materiales y stock usando `TanStack React Query` con configuración de persistencia (`persistQueryClient`) o `AsyncStorage`.
2. **Cola de Movimientos Offline (`useOfflineQueue`):**
   - Cuando el operador presiona "Guardar Movimiento" y no hay conexión a internet (`NetInfo.fetch().isConnected === false`), el movimiento se guarda localmente en una cola con estado `PENDING`.
   - Cuando la conexión se restablece, un servicio en segundo plano envía secuencialmente los movimientos al backend (`POST /api/movements`) y actualiza el stock local.

```
                  ┌────────────────────────┐
                  │ Guardar Movimiento     │
                  └───────────┬────────────┘
                              │
                    ¿Hay Conexión a Internet?
                     /                      \
                  [SÍ]                      [NO]
                   /                          \
        ┌─────────▼────────┐         ┌────────▼─────────┐
        │ Enviar a API     │         │ Guardar en Cola  │
        │ POST /movements  │         │ Local (Storage)  │
        └──────────────────┘         └────────┬─────────┘
                                              │ Al detectar
                                              │ reconexión
                                     ┌────────▼─────────┐
                                     │ Sincronizar Cola │
                                     │ con el Servidor  │
                                     └──────────────────┘
```

---

## 8. Fase 6: Pruebas y Despliegue con EAS (Expo Application Services)

### 8.1 Probar en Dispositivo Físico
Para probar de inmediato la cámara y el escaneo:
1. Instala la app **Expo Go** desde Google Play Store o Apple App Store en tu teléfono.
2. Inicia el servidor de desarrollo:
   ```bash
   npx expo start
   ```
3. Escanea el código QR que aparece en tu terminal con la cámara de tu teléfono.

### 8.2 Configurar EAS Build para APK de Producción
1. Instalar la herramienta CLI de EAS:
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

2. Configurar `eas.json`:
   ```json
   {
     "cli": {
       "version": ">= 12.0.0"
     },
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal",
         "android": {
           "buildType": "apk"
         }
       },
       "production": {}
     }
   }
   ```

3. Generar archivo APK instalable para Android:
   ```bash
   eas build --platform android --profile preview
   ```

---

## 9. Hoja de Ruta (Checklist de Implementación)

- [ ] **Paso 1: Backend Next.js**
  - [ ] Adaptar `/api/auth/login` para responder con tokens JWT en el body JSON.
  - [ ] Implementar endpoint REST `GET /api/materials` y `GET /api/materials/:id`.
  - [ ] Implementar endpoint REST `POST /api/movements` (soportando `signature` en Base64).
  - [ ] Implementar endpoint REST `GET /api/dashboard/stats` y selectores de Obras/Proveedores.

- [ ] **Paso 2: Inicialización Mobile**
  - [ ] Crear proyecto con Expo y TypeScript (`constructtrack-mobile`).
  - [ ] Instalar dependencias nativas (`expo-camera`, `expo-secure-store`, `react-native-signature-canvas`).
  - [ ] Configurar variables de entorno (`API_BASE_URL`).

- [ ] **Paso 3: Autenticación y Almacenamiento**
  - [ ] Implementar `apiClient` con interceptor Bearer y refresh de token.
  - [ ] Pantalla `LoginScreen` con validación Zod.

- [ ] **Paso 4: Pantallas Principales**
  - [ ] `DashboardScreen`: KPIs de stock mínimo, alertas y movimientos recientes.
  - [ ] `InventoryListScreen`: Buscador, filtros de stock bajo y tarjetas de material.
  - [ ] `NewMovementScreen`: Lector QR con cámara + Panel de firma táctil para salidas.
  - [ ] `MovementsHistoryScreen`: Historial de entregas con fecha y receptor.

- [ ] **Paso 5: Calidad y Despliegue**
  - [ ] Validación de límites de stock para prevenir salidas en negativo.
  - [ ] Pruebas en obras reales mediante Expo Go.
  - [ ] Generación de APK con `eas build --profile preview`.
