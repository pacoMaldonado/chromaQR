# ChromaQR — Plan Maestro de Trabajo y Hoja de Ruta (ROADMAP)

> **Enfoque:** Desarrollo Iterativo Guiado por Especificaciones (*Spec-Driven Development*)  
> **Total de Hitos:** 6 Hitos Ejecutables y Verificables

---

## Resumen de Hitos

| Hito | Nombre | Objetivo Principal | Estado |
| :---: | :--- | :--- | :---: |
| **Hito 1** | **Inicialización y Base Nativa** | Configurar Astro + Tailwind + Tauri v2, fuentes, iconos y verificar compilación en Linux. | ✅ Completado |
| **Hito 2** | **Layout Split-Screen y Sistema de Diseño** | Construir la interfaz Dark Mode tipo Linear/Raycast (`1150x760`) y componentes UI atómicos. | ⏳ Pendiente |
| **Hito 3** | **Motor de Payloads QR (9 Estándares)** | Implementar generadores tipados, validadores en vivo y estado reactivo para los 9 formatos. | ⏳ Pendiente |
| **Hito 4** | **Motor de Diseño QR y Escaneabilidad** | Integrar `qr-code-styling` a 60fps, puntos, esquinas, gradientes, logo y validador de contraste. | ⏳ Pendiente |
| **Hito 5** | **Integración Nativa Tauri v2 (Export & Presets)** | Exportación nativa a PNG/SVG/WEBP/PDF, copiado de imagen al portapapeles y presets en disco. | ⏳ Pendiente |
| **Hito 6** | **Optimización de Binarios y CI/CD Release** | Configurar `Cargo.toml` (LTO/strip), iconos multiplataforma y workflow de GitHub Actions. | ⏳ Pendiente |

---

## Desglose Detallado por Hitos

### Hito 1: Inicialización del Repositorio y Verificación Base en Linux
**Objetivo:** Establecer los cimientos del proyecto integrando Astro (`output: 'static'`), Tailwind CSS, TypeScript estricto y Tauri v2 con sus plugins oficiales, asegurando que el entorno compile limpiamente en Linux.

#### Tareas Ejecutables:
1. Verificar `LICENSE` (MIT) y configurar `.gitignore` completo para entornos Node.js, Astro y Rust/Tauri (`node_modules/`, `dist/`, `src-tauri/target/`, `.astro/`).
2. Inicializar `package.json`, `astro.config.mjs` (`output: 'static'`), `tsconfig.json` y `tailwind.config.mjs`.
3. Instalar dependencias core de frontend: `astro`, `tailwindcss`, `lucide-astro` / `lucide-static`, `qr-code-styling`, `jspdf`, `@tauri-apps/api`, `@tauri-apps/plugin-dialog`, `@tauri-apps/plugin-fs`, `@tauri-apps/plugin-clipboard-manager`.
4. Configurar tipografías (`Inter` / `Plus Jakarta Sans` y `JetBrains Mono`) y tokens CSS en `src/styles/global.css`.
5. Inicializar `src-tauri/` con `Cargo.toml`, `tauri.conf.json` (`com.chromaqr.app`, ventana `1150×760`, mínimo `900×620`) y `capabilities/default.json`.
6. Ejecutar verificación de compilación de frontend (`npm run build`) y backend (`cargo check` / `tauri build --debug`) en Linux.

#### Criterio de Aceptación (DoD):
* `npm run build` genera la salida estática en `dist/` con 0 errores de TypeScript.
* `cargo check --manifest-path src-tauri/Cargo.toml` compila el backend de Tauri v2 sin errores.

---

### Hito 2: Construcción del Layout Base y Sistema de Diseño (UX/UI)
**Objetivo:** Implementar la arquitectura visual *Split-Screen* sin scroll global con estética Linear/Raycast y todos los componentes atómicos reutilizables.

#### Tareas Ejecutables:
1. Configurar los tokens de color en Tailwind y variables CSS (`#09090B` fondo, `#121215` paneles, `#27272A` bordes de `1px`, `#6366F1` acento Indigo, `#10B981` éxito Emerald, `#EF4444` error Red).
2. Crear `MainLayout.astro` garantizando `100vw × 100vh` con `overflow: hidden` global y barra de desplazamiento personalizada de alta discreción en la columna izquierda.
3. Construir componentes UI atómicos en `src/components/ui/`:
   * `Accordion.astro` (con animación fluida e indicador de resumen activo).
   * `Input.astro`, `Select.astro`, `Toggle.astro`, `Slider.astro`, `ColorPicker.astro`, `Button.astro`, `Badge.astro` y `Toast.astro`.
4. Maquetar la estructura de 2 columnas en `src/pages/index.astro`:
   * **Columna Izquierda (60%):** Barra de navegación de tipos de QR (Tabs), contenedor de formulario dinámico y pila de los 5 acordeones de diseño.
   * **Columna Derecha (40%):** Selector de presets superior, tarjeta elevada con lienzo ajedrezado (*checkerboard*) para transparencias, badge de escaneabilidad y barra inferior de exportación.

#### Criterio de Aceptación (DoD):
* La ventana mantiene la proporción 60% / 40% sin scroll global tanto en `1150×760` como en el mínimo de `900×620`.
* Todos los controles interactivos responden visualmente con estados `hover`, `active` y `focus-visible` acordes a la paleta especificada.

---

### Hito 3: Motor de Generación de Payloads y Estado Reactivo
**Objetivo:** Implementar los 9 generadores de payloads bajo estándares oficiales, con validación en tiempo real y conexión al store reactivo centralizado.

#### Tareas Ejecutables:
1. Crear `src/types/qr.ts` y el store reactivo `src/core/store/app-store.ts`.
2. Desarrollar los 9 módulos generadores y validadores puros en `src/core/payloads/`:
   * **URL:** Validación de protocolo `https://` y limpiador de parámetros de rastreo UTM (`cleanUtm`).
   * **Texto Plano:** Soporte UTF-8, contador de caracteres/bytes y alerta de densidad.
   * **vCard (3.0 / 4.0):** Generador RFC completo (nombre, apellidos, empresa, cargo, teléfonos, email, web, dirección).
   * **Wi-Fi:** Generador `WIFI:T:...;S:...;P:...;H:...;;` con escapado de caracteres especiales y toggle de visibilidad de contraseña.
   * **Email (`mailto:`):** Destinatario, asunto y cuerpo codificados.
   * **SMS / WhatsApp:** Selector de modo (`SMSTO:` vs `https://wa.me/`), código de país, teléfono sanitizado y mensaje.
   * **Ubicación Geográfica (`geo:`):** Latitud, longitud y selector entre URI `geo:` o enlace directo a mapas.
   * **Calendario (`iCal / VEVENT`):** Título, ubicación, inicio, fin, evento de día completo y descripción.
   * **Imagen / Archivo Local:**
     * *Modo 1 (Offline Data/Base64):* Compresor inteligente en `<canvas>` con medidor en vivo frente al límite técnico de 2,953 bytes del estándar QR.
     * *Modo 2 (Enlace Web):* URL de imagen con previsualización rápida.
3. Construir los 9 formularios interactivos en `src/components/payloads/` e incluir un visor técnico en `JetBrains Mono` que muestre el payload crudo generado en tiempo real.

#### Criterio de Aceptación (DoD):
* Cambiar entre cualquiera de los 9 tabs actualiza instantáneamente el formulario activo y genera un string de payload 100% válido según su especificación técnica.
* Las validaciones en vivo bloquean o advierten sobre datos malformados (ej. coordenadas fuera de rango, URL inválida o exceso de bytes en Base64).

---

### Hito 4: Motor de Diseño QR (`qr-code-styling`) y Validador de Contraste en Vivo
**Objetivo:** Conectar la personalización estética completa del código QR a 60fps e implementar el motor óptico de evaluación de escaneabilidad.

#### Tareas Ejecutables:
1. Implementar `src/core/qr/renderer.ts` envolviendo `qr-code-styling` con planificación por `requestAnimationFrame` para garantizar actualizaciones fluidas a 60fps al arrastrar sliders o selectores de color.
2. Conectar los 5 Acordeones de Diseño en `src/components/design/`:
   * **Módulos (Puntos):** `square`, `dots`, `rounded`, `extra-rounded`, `classy`, `classy-rounded`.
   * **Esquinas (Eyes):** Marco exterior (`square`, `dot`, `extra-rounded`) e interior (`square`, `dot`) con color heredado o independiente.
   * **Colores y Gradientes:** Color sólido o gradiente (`linear` / `radial` con ángulo de rotación y 2 stops) tanto para módulos como para el fondo, más toggle de **Fondo Transparente**.
   * **Logo Central:** Zona *Drag & Drop* para `PNG`, `SVG`, `JPG`, `WEBP`, slider de tamaño (`0.1` a `0.4`), margen interno y toggle para ocultar puntos bajo el logo.
   * **Opciones Técnicas:** Nivel de corrección de errores (`L`, `M`, `Q`, `H`), resolución de exportación (`256px` a `4096px`) y margen silencioso (*Quiet Zone*).
3. Desarrollar `src/core/qr/contrast.ts`:
   * Cálculo de luminancia relativa WCAG 2.1 entre módulos (incluyendo el peor stop de un gradiente) y fondo.
   * Detección de QR invertido (módulos más claros que el fondo).
   * Heurística de riesgo por tamaño de logo vs. nivel de corrección de errores (ej. si el logo > 25% y ECC es `L` o `M`, emitir alerta y sugerir / auto-elevar a `H`).
4. Conectar el **Badge de Escaneabilidad (UX Pro)** en el panel derecho con código de colores semántico (`#10B981` Excelente, `#F59E0B` Advertencia, `#EF4444` Crítico).

#### Criterio de Aceptación (DoD):
* Cualquier cambio de forma, gradiente, transparencia, logo o nivel ECC se refleja en el lienzo a 60fps.
* El indicador de escaneabilidad detecta inmediatamente bajo contraste (ej. gris sobre negro), contraste invertido o logos excesivamente grandes.

---

### Hito 5: Integración Nativa con Rust / Tauri v2 (Exportación, Portapapeles y Presets)
**Objetivo:** Conectar las capacidades nativas del sistema operativo para copiar imágenes al portapapeles, exportar archivos en múltiples formatos (incluyendo alta resolución hasta `4096px` y vectorial) y gestionar presets locales.

#### Tareas Ejecutables:
1. Implementar `src/core/qr/exporter.ts`:
   * **Copiar al Portapapeles:** Renderizar el QR y copiar los bytes de imagen directamente al portapapeles del sistema vía `@tauri-apps/plugin-clipboard-manager` (con fallback seguro cuando se previsualiza en navegador de desarrollo), mostrando notificación Toast de éxito.
   * **Exportación Nativa a Disco (`PNG`, `SVG`, `WEBP`, `PDF`):** Generar el recurso en la resolución de salida seleccionada (`256px` a `4096px` para formatos rasterizados; XML limpio para `SVG`; documento vectorial/alta densidad para `PDF`), abrir el diálogo nativo de guardado (`@tauri-apps/plugin-dialog`) y escribir el archivo con `@tauri-apps/plugin-fs`.
2. Implementar `src/core/presets/preset-manager.ts` y `default-presets.ts`:
   * Incluir presets predefinidos curados (*Chroma Indigo*, *Raycast Dark*, *Emerald Cyber*, *Classic High-Contrast*, *Minimal Rounded*).
   * Permitir guardar el diseño actual con nombre personalizado en el almacenamiento local de la app (`AppData`) y eliminar presets de usuario.
3. Añadir atajos de teclado nativos (`Ctrl/Cmd + C` para copiar QR, `Ctrl/Cmd + S` para exportar).

#### Criterio de Aceptación (DoD):
* Los 4 formatos (`PNG`, `SVG`, `WEBP`, `PDF`) se exportan correctamente al sistema de archivos respetando las dimensiones configuradas (`256px–4096px`) y la transparencia.
* El copiado al portapapeles y el guardado/carga de presets funcionan sin errores.

---

### Hito 6: Optimización de Binarios, Iconografía Oficial y CI/CD Multiplataforma
**Objetivo:** Preparar ChromaQR para producción con binarios optimizados, iconos nativos en todos los formatos y pipeline automatizado de lanzamiento en GitHub Actions.

#### Tareas Ejecutables:
1. Diseñar el icono oficial de **ChromaQR** en SVG de alta precisión (`1024×1024`) y generar el set completo de iconos nativos en `src-tauri/icons/` (`.icns` para macOS, `.ico` para Windows, `.png` en múltiples resoluciones para Linux).
2. Optimizar `src-tauri/Cargo.toml` con `[profile.release]` (`lto = true`, `codegen-units = 1`, `panic = "abort"`, `strip = true`, `opt-level = "s"`).
3. Configurar los targets de empaquetado en `src-tauri/tauri.conf.json`:
   * Linux: `appimage`, `deb`, `rpm`.
   * macOS: `dmg`, `app`.
   * Windows: `msi`, `nsis` (`.exe`).
4. Crear `.github/workflows/release.yml` disparado por tags `v*.*.*` usando `tauri-apps/tauri-action` con matriz para `ubuntu-22.04`, `macos-latest` (Apple Silicon + Intel) y `windows-latest`, publicando automáticamente el GitHub Release con todos los instaladores adjuntos.
5. Documentar `README.md` con guía de arquitectura, capturas/diagramas, comandos de desarrollo y proceso de release.

#### Criterio de Aceptación (DoD):
* `tauri.conf.json`, `Cargo.toml` y `.github/workflows/release.yml` validados sin errores.
* Compilación de verificación completa en Linux exitosa.
