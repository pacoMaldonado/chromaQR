# ChromaQR — Especificación Técnica y de Diseño (SPEC)

> **Versión:** 1.0.0  
> **Identificador de Aplicación:** `com.chromaqr.app`  
> **Licencia:** MIT  
> **Metodología:** Spec-Driven Development (SDD)

---

## 1. Visión del Producto y Principios Arquitectónicos

**ChromaQR** es una aplicación de escritorio multiplataforma (Linux, macOS y Windows) de alto rendimiento y huella mínima de memoria para la generación, personalización estética avanzada y validación de códigos QR.

### Principios Rectores
1. **Rendimiento Nativo y Huella Mínima:** Construida sobre **Tauri v2** (Rust) y un frontend estático compilado con **Astro** (`output: 'static'`) + **TypeScript puro**, evitando el sobrecoste de Virtual DOM pesados y logrando tiempos de arranque instantáneos (< 200 ms) y consumo de RAM mínimo.
2. **Estética Profesional (Linear / Raycast Design Language):** Interfaz *Dark Mode First*, bordes de precisión de `1px`, tipografía técnica monoespaciada para payloads y previsualización interactiva a **60fps** en diseño de pantalla dividida (*Split-Screen*) sin scroll global.
3. **Escaneabilidad Garantizada (UX Pro):** Motor de análisis óptico en tiempo real que calcula el ratio de contraste WCAG 2.1, detecta inversión polar (fondo oscuro con módulos claros), evalúa la cobertura del logo central frente al nivel de corrección de errores (`L`, `M`, `Q`, `H`) y alerta sobre excesos de densidad binaria.
4. **Privacidad y Operación 100% Offline:** Todos los payloads, imágenes y presets se procesan y almacenan localmente sin telemetría ni llamadas a servidores externos.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Justificación Técnica |
| :--- | :--- | :--- |
| **Runtime de Escritorio** | **Tauri v2** (Rust Edition 2021) | Acceso seguro al sistema operativo (`fs`, `dialog`, `clipboard-manager`) mediante sistema de *Capabilities* granulares. |
| **Frontend Base** | **Astro 5** (`output: 'static'`) | Compilación HTML/CSS de cero JS innecesario, estructuración modular de componentes UI. |
| **Estado y Reactividad** | **TypeScript Estricto** (`Nano-Store` / `EventTarget` reactivo) | Estado reactivo centralizado con suscripciones granulares sin *re-renders* costosos, manteniendo 60fps en el lienzo QR. |
| **Estilos** | **Tailwind CSS** + Variables CSS Nativas | Tokens de diseño consistentes, utilidades de precisión y soporte nativo de temas. |
| **Motor de Renderizado QR** | `qr-code-styling` + `jspdf` / generador PDF vectorial | Renderizado híbrido SVG/Canvas con soporte para formas personalizadas de puntos, esquinas independientes, gradientes lineales/radiales y logos embebidos. |
| **Iconografía** | `lucide-astro` / `lucide-static` | Iconos vectoriales limpios con trazo uniforme (`stroke-width: 1.75px`). |
| **Empaquetado & CI/CD** | `tauri-action` (GitHub Actions) | Compilación cruzada automatizada para Linux (`.AppImage`, `.deb`, `.rpm`), macOS (`.dmg`, `.app`) y Windows (`.msi`, `.exe`). |

---

## 3. Arquitectura de Directorios

```text
chromaQR/
├── .github/
│   └── workflows/
│       └── release.yml                # Pipeline CI/CD multiplataforma por tags (v*.*.*)
├── public/
│   ├── fonts/                         # Fuentes locales (Inter / Plus Jakarta Sans & JetBrains Mono)
│   └── favicon.svg
├── src/
│   ├── assets/                        # Recursos estáticos e iconos base
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.astro        # Barra superior compacta con título, versión y selector de presets
│   │   │   ├── ConfigPanel.astro      # Columna izquierda (60%): Tabs + Formularios + Acordeones
│   │   │   └── PreviewPanel.astro     # Columna derecha (40%): Lienzo 60fps + Badge contraste + Exportación
│   │   ├── payloads/                  # Formularios específicos por tipo de QR (9 tipos)
│   │   │   ├── PayloadTabs.astro
│   │   │   ├── UrlForm.astro
│   │   │   ├── TextForm.astro
│   │   │   ├── VCardForm.astro
│   │   │   ├── WifiForm.astro
│   │   │   ├── EmailForm.astro
│   │   │   ├── SmsWhatsappForm.astro
│   │   │   ├── GeoForm.astro
│   │   │   ├── CalendarForm.astro
│   │   │   └── ImageForm.astro
│   │   ├── design/                    # Acordeones de personalización visual del QR
│   │   │   ├── DotsAccordion.astro    # Estilo de módulos (puntos)
│   │   │   ├── CornersAccordion.astro # Marco exterior y punto interior de esquinas (Eyes)
│   │   │   ├── ColorsAccordion.astro  # Sólidos, gradientes lineales/radiales y transparencia
│   │   │   ├── LogoAccordion.astro    # Drag & drop de logo, tamaño, margen y ocultación de módulos
│   │   │   └── TechAccordion.astro    # Nivel ECC (L/M/Q/H), resolución (256-4096px) y Quiet Zone
│   │   └── ui/                        # Componentes atómicos del sistema de diseño
│   │       ├── Accordion.astro
│   │       ├── Badge.astro
│   │       ├── Button.astro
│   │       ├── ColorPicker.astro
│   │       ├── Input.astro
│   │       ├── Select.astro
│   │       ├── Slider.astro
│   │       ├── Toggle.astro
│   │       └── Toast.astro
│   ├── core/
│   │   ├── payloads/                  # Generadores puros, sanitizadores y validadores de estándar QR
│   │   │   ├── index.ts
│   │   │   ├── url.ts
│   │   │   ├── text.ts
│   │   │   ├── vcard.ts
│   │   │   ├── wifi.ts
│   │   │   ├── email.ts
│   │   │   ├── sms-whatsapp.ts
│   │   │   ├── geo.ts
│   │   │   ├── calendar.ts
│   │   │   └── image.ts
│   │   ├── qr/
│   │   │   ├── renderer.ts            # Wrapper de alto rendimiento sobre qr-code-styling (RAF 60fps)
│   │   │   ├── contrast.ts            # Algoritmo WCAG + heurística de escaneabilidad óptica
│   │   │   └── exporter.ts            # Conversión a PNG, SVG puro, WEBP, PDF y Portapapeles
│   │   ├── presets/
│   │   │   ├── default-presets.ts     # Plantillas curadas iniciales (Linear Dark, Indigo Glow, Classic Print...)
│   │   │   └── preset-manager.ts      # Persistencia local de presets vía Tauri FS
│   │   └── store/
│   │       └── app-store.ts           # Estado reactivo centralizado con tipado estricto
│   ├── layouts/
│   │   └── MainLayout.astro           # Shell de aplicación sin scroll global (100vw x 100vh)
│   ├── pages/
│   │   └── index.astro                # Vista principal Split-Screen
│   ├── styles/
│   │   └── global.css                 # Tokens CSS, directivas Tailwind y estilos de scrollbars sutiles
│   └── types/
│       └── qr.ts                      # Contratos de datos e interfaces TypeScript
├── src-tauri/
│   ├── capabilities/
│   │   └── default.json               # Permisos mínimos: dialog, fs, clipboard-manager
│   ├── icons/                         # Iconos nativos (.icns, .ico, .png)
│   ├── src/
│   │   ├── main.rs                    # Punto de entrada binario
│   │   ├── lib.rs                     # Registro de plugins y comandos Tauri
│   │   └── commands.rs                # Comandos nativos auxiliares (exportación binaria / presets)
│   ├── build.rs
│   ├── Cargo.toml                     # Dependencias Rust y perfil de optimización LTO/Strip
│   └── tauri.conf.json                # Configuración de ventana, bundle y seguridad CSP
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
├── LICENSE                            # MIT License
├── README.md
├── SPEC.md
└── ROADMAP.md
```

---

## 4. Especificaciones del Sistema de Diseño (UX/UI)

### 4.1 Paleta de Colores y Tokens CSS (Dark Mode First)

```css
:root {
  /* Superficies */
  --bg-primary: #09090B;          /* Zinc 950 - Fondo principal de la ventana */
  --bg-surface: #121215;          /* Superficie de paneles, tarjetas y acordeones */
  --bg-elevated: #18181B;         /* Zinc 900 - Inputs, botones secundarios y hover suave */
  --bg-active: #27272A;           /* Zinc 800 - Estado activo / seleccionado */

  /* Bordes y Divisores */
  --border-subtle: #27272A;       /* Zinc 800 - Bordes de 1px solid */
  --border-focus: #6366F1;        /* Indigo 500 - Anillo de foco en controles activos */

  /* Acentos y Estados Semánticos */
  --accent-primary: #6366F1;      /* Indigo 500 - Acción principal y tabs activos */
  --accent-primary-hover: #4F46E5;/* Indigo 600 - Hover de acción principal */
  --status-success: #10B981;      /* Emerald 500 - Escaneabilidad óptima / copiado exitoso */
  --status-warning: #F59E0B;      /* Amber 500 - Advertencia de densidad o logo grande */
  --status-error: #EF4444;        /* Red 500 - Contraste insuficiente / error de validación */

  /* Tipografía */
  --text-primary: #FAFAFA;        /* Zinc 50 - Títulos, labels principales y valores */
  --text-secondary: #A1A1AA;      /* Zinc 400 - Subtítulos, ayudas y placeholders */
  --text-muted: #71717A;          /* Zinc 500 - Metadatos deshabilitados */
}
```

### 4.2 Tipografía
* **Inter / Plus Jakarta Sans (`--font-sans`):** Interfaz general, pestañas, etiquetas de formularios y botones. Pesos: `400` (Regular), `500` (Medium), `600` (SemiBold).
* **JetBrains Mono (`--font-mono`):** Códigos hexadecimales (`#6366F1`), previsualización del payload crudo generado, dimensiones en píxeles, contadores de bytes y coordenadas.

### 4.3 Arquitectura del Layout (Split-Screen Fijo)
* **Dimensiones de Ventana:**
  * Inicial: `1150px × 760px` (centrada en pantalla).
  * Mínima: `900px × 620px`.
  * `overflow: hidden` en `html, body` para comportamiento 100% nativo de escritorio (sin barras de desplazamiento globales).
* **Columna Izquierda (60% de ancho — Panel de Configuración):**
  * **Header fijo superior:** Selector horizontal de tipos de Payload QR (9 tipos con icono + etiqueta corta).
  * **Área desplazable interna (`overflow-y: auto` con scrollbar fina de `5px`):**
    1. **Tarjeta de Datos del Payload:** Formulario reactivo según el tab activo con mensajes de validación en línea y vista previa colapsable del string crudo codificado.
    2. **Sección de Acordeones de Diseño:** 5 paneles colapsables independientes (Módulos, Esquinas, Colores y Gradientes, Logo Central, Opciones Técnicas).
* **Columna Derecha (40% de ancho — Live Preview & Export):**
  * **Header de Previsualización:** Selector de **Presets Locales** y botón para guardar la configuración actual como nuevo preset.
  * **Lienzo Central Fijo:** Contenedor cuadrado elevado con patrón damero (*checkerboard* `#18181B` / `#121215`) para evidenciar transparencias, renderizando el QR a 60fps mediante `requestAnimationFrame`.
  * **Indicador de Escaneabilidad (UX Pro):** Badge dinámico bajo el lienzo con semáforo de estado (`Excelente`, `Advertencia`, `Crítico`), ratio de contraste en vivo (ej. `12.4:1`), nivel ECC efectivo y recomendaciones accionables.
  * **Barra de Acciones Primarias (Footer derecho):**
    * Botón destacado: **Copiar al Portapapeles** (`Ctrl/Cmd + C`).
    * Botones de exportación directa con diálogo nativo de guardado: **PNG**, **SVG**, **WEBP** y **PDF**.

---

## 5. Esquema de Datos y Tipado Estricto (TypeScript)

### 5.1 Tipos de Payload (`src/types/qr.ts`)

```typescript
export type PayloadType =
  | 'url'
  | 'text'
  | 'vcard'
  | 'wifi'
  | 'email'
  | 'sms'
  | 'geo'
  | 'calendar'
  | 'image';

export interface UrlPayloadData {
  url: string;
  cleanUtm: boolean; // Elimina utm_*, fbclid, gclid, msclkid, etc.
}

export interface TextPayloadData {
  text: string;
}

export interface VCardPayloadData {
  version: '3.0' | '4.0';
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  phoneMobile: string;
  phoneWork: string;
  email: string;
  website: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface WifiPayloadData {
  ssid: string;
  password?: string;
  encryption: WifiEncryption;
  hidden: boolean;
}

export interface EmailPayloadData {
  to: string;
  subject: string;
  body: string;
}

export interface SmsWhatsappPayloadData {
  mode: 'sms' | 'whatsapp';
  countryCode: string; // Ej: "+52", "+34", "+1"
  phone: string;
  message: string;
}

export interface GeoPayloadData {
  latitude: string;
  longitude: string;
  query?: string;
  format: 'geo_uri' | 'google_maps';
}

export interface CalendarPayloadData {
  title: string;
  location: string;
  startDate: string; // ISO local datetime (YYYY-MM-DDTHH:mm)
  endDate: string;
  description: string;
  allDay: boolean;
}

export interface ImagePayloadData {
  mode: 'offline_base64' | 'remote_url';
  remoteUrl: string;
  dataUri: string;          // Data URL comprimido (WEBP/PNG miniatura)
  originalName?: string;
  encodedBytes: number;     // Conteo exacto frente al límite de 2953 bytes
  autoCompress: boolean;    // Redimensionado automático en canvas para caber en QR v40-L
}

export interface PayloadDataMap {
  url: UrlPayloadData;
  text: TextPayloadData;
  vcard: VCardPayloadData;
  wifi: WifiPayloadData;
  email: EmailPayloadData;
  sms: SmsWhatsappPayloadData;
  geo: GeoPayloadData;
  calendar: CalendarPayloadData;
  image: ImagePayloadData;
}
```

### 5.2 Configuración Visual del QR (`QRStyleConfig`)

```typescript
export type DotType = 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
export type CornerSquareType = 'square' | 'dot' | 'extra-rounded';
export type CornerDotType = 'square' | 'dot';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type GradientType = 'linear' | 'radial';

export interface GradientConfig {
  enabled: boolean;
  type: GradientType;
  rotation: number; // 0 a 360 grados
  colorStop1: string; // Hex #RRGGBB
  colorStop2: string; // Hex #RRGGBB
}

export interface ColorOrGradient {
  color: string; // Hex #RRGGBB
  gradient: GradientConfig;
}

export interface QRStyleConfig {
  dots: {
    type: DotType;
    coloring: ColorOrGradient;
  };
  cornersSquare: {
    type: CornerSquareType;
    customColor: boolean; // Si es false, hereda el color de los puntos
    coloring: ColorOrGradient;
  };
  cornersDot: {
    type: CornerDotType;
    customColor: boolean;
    coloring: ColorOrGradient;
  };
  background: {
    transparent: boolean;
    coloring: ColorOrGradient;
  };
  logo: {
    dataUrl: string | null;
    size: number;               // 0.10 a 0.40 (ratio respecto al QR)
    margin: number;             // 0 a 24 px
    hideBackgroundDots: boolean;
  };
  technical: {
    errorCorrectionLevel: ErrorCorrectionLevel;
    size: number;               // 256 a 4096 px (para exportación)
    margin: number;             // Quiet Zone: 0 a 64 px
  };
}
```

### 5.3 Diagnóstico de Escaneabilidad (`ScannabilityReport`)

```typescript
export type ScannabilityLevel = 'excellent' | 'good' | 'warning' | 'critical';

export interface ScannabilityReport {
  level: ScannabilityLevel;
  contrastRatio: number;        // Ratio WCAG 2.1 (1.0 a 21.0)
  isInverted: boolean;          // True si los módulos son más claros que el fondo
  byteLength: number;           // Tamaño en bytes UTF-8 del payload final
  maxCapacityBytes: number;     // Capacidad máxima según nivel ECC seleccionado
  issues: string[];             // Mensajes claros para el usuario
  summary: string;              // Texto corto para el badge principal
}
```

---

## 6. Especificación de Generadores de Payload (Estándares QR)

1. **URL (`url.ts`):**
   * Asegura prefijo `https://` o `http://` (auto-completa `https://` si el usuario escribe `ejemplo.com`).
   * Si `cleanUtm === true`, parsea con `new URL()` y elimina parámetros de rastreo (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `utm_id`, `fbclid`, `gclid`, `msclkid`, `mc_cid`, `mc_eid`).
2. **Texto Plano (`text.ts`):**
   * Codificación UTF-8 directa.
   * Calcula longitud en caracteres y en bytes reales (`new TextEncoder().encode(text).length`).
   * Emite advertencia de densidad cuando supera los 300 bytes (módulos muy pequeños en impresiones estándar).
3. **vCard (`vcard.ts`):**
   * Genera estructura estándar RFC 2426 (v3.0) o RFC 6350 (v4.0) con saltos de línea `\r\n`, escapado de comas/puntos y coma y campos `N`, `FN`, `ORG`, `TITLE`, `TEL;TYPE=CELL`, `TEL;TYPE=WORK`, `EMAIL`, `URL`, `ADR`.
4. **Wi-Fi (`wifi.ts`):**
   * Formato estándar `WIFI:T:<encryption>;S:<escaped_ssid>;P:<escaped_password>;H:<hidden>;;`.
   * Escapa caracteres especiales (`\`, `;`, `,`, `:`, `"`) precediéndolos con `\` según la especificación ZXing.
5. **Correo Electrónico (`email.ts`):**
   * Formato URI RFC 6068: `mailto:<to>?subject=<encoded_subject>&body=<encoded_body>`.
6. **SMS / WhatsApp (`sms-whatsapp.ts`):**
   * Sanitiza el teléfono dejando solo dígitos y prefijo internacional.
   * Modo SMS: `SMSTO:+<country><phone>:<message>`.
   * Modo WhatsApp: `https://wa.me/<country><phone>?text=<encoded_message>`.
7. **Ubicación Geográfica (`geo.ts`):**
   * Valida latitud (`-90` a `90`) y longitud (`-180` a `180`).
   * Modo Geo URI (RFC 5870): `geo:<lat>,<lng>` (con `?q=<encoded_query>` opcional).
   * Modo Google Maps: `https://www.google.com/maps/search/?api=1&query=<lat>,<lng>`.
8. **Calendario (`calendar.ts`):**
   * Formato iCalendar `BEGIN:VEVENT\r\nSUMMARY:...\r\nDTSTART:...\r\nDTEND:...\r\nLOCATION:...\r\nDESCRIPTION:...\r\nEND:VEVENT`.
   * Convierte fechas locales a formato compacto `YYYYMMDDTHHMMSS` (o `YYYYMMDD` para eventos de día completo).
9. **Imagen / Archivo Local (`image.ts`):**
   * **Modo 1 (Offline Data / Base64):** Permite arrastrar una imagen local. Muestra una barra de capacidad en vivo (`bytes usados / 2,953 bytes máx en QR v40-L`). Incluye compresor automático en `<canvas>` que escala la miniatura (ej. `32×32` a `96×96` en formato `image/webp` o `image/png`) hasta encajar dentro del límite físico de un código QR estándar sin requerir conexión a internet.
   * **Modo 2 (Enlace a Imagen):** Valida URL de imagen externa y muestra miniatura de previsualización.

---

## 7. Integración Nativa con Tauri v2 y Seguridad

### 7.1 Permisos y Capabilities (`src-tauri/capabilities/default.json`)
Se aplicará el principio de mínimo privilegio habilitando exclusivamente:
* `core:default`
* `dialog:allow-save` y `dialog:allow-open`
* `fs:allow-write-file`, `fs:allow-read-text-file`, `fs:allow-write-text-file`, `fs:allow-app-data-recursive`
* `clipboard-manager:allow-write-image` y `clipboard-manager:allow-write-text`

### 7.2 Flujo de Exportación y Portapapeles
* **Portapapeles:** Renderiza el QR en alta resolución a un buffer RGBA/PNG y utiliza el plugin `clipboard-manager` de Tauri v2 para copiar la imagen directamente al portapapeles del sistema operativo.
* **Exportación a Disco (`PNG`, `SVG`, `WEBP`, `PDF`):**
  * Abre el diálogo nativo del sistema (`@tauri-apps/plugin-dialog`) con filtro de extensión y nombre sugerido (`chromaqr-<tipo>-<timestamp>.<ext>`).
  * Escribe los bytes directamente en disco mediante `@tauri-apps/plugin-fs` (`writeFile`).
* **Presets Locales:**
  * Almacenados en `AppData/com.chromaqr.app/presets.json` con soporte para crear, aplicar, restaurar predefinidos y eliminar presets personalizados.

---

## 8. Optimización de Binarios y CI/CD Multiplataforma

### 8.1 Perfil de Compilación Rust (`src-tauri/Cargo.toml`)
```toml
[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"
strip = true
```

### 8.2 Pipeline de Publicación (`.github/workflows/release.yml`)
* **Trigger:** Push de tags semánticos `v*.*.*` y `workflow_dispatch`.
* **Matriz de Construcción:**
  * `ubuntu-22.04`: Genera `.AppImage`, `.deb` y `.rpm` (instalando `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf`).
  * `macos-latest`: Genera `.dmg` y `.app` para arquitecturas `aarch64-apple-darwin` y `x86_64-apple-darwin` (o binario universal `universal-apple-darwin`).
  * `windows-latest`: Genera instaladores `.msi` (WiX) y `.exe` (NSIS).
* **Publicación:** Crea automáticamente un GitHub Release con notas de versión y adjunta todos los instaladores firmados/compilados.
