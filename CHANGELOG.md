# Changelog

Todos los cambios notables en **ChromaQR** serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto se adhiere a [Semantic Versioning (SemVer)](https://semver.org/lang/es/).

---

## [Unreleased]

---

## [0.0.5] - 2026-11-16

### Added (Firma Ad-Hoc en macOS & Metadatos de Editor)
- **Firma Criptográfica Ad-Hoc en macOS (`src-tauri/tauri.conf.json`):** Configurado `bundle.macOS.signingIdentity = "-"` y `minimumSystemVersion = "10.15"` para firmar el bundle Universal (`ChromaQR.app` y `.dmg`) mediante `codesign` en macOS, garantizando integridad de encabezados Mach-O en procesadores Apple Silicon (M1/M2/M3/M4).
- **Metadatos de Autor y Editor (`publisher` y `copyright`):** Añadidos en `src-tauri/tauri.conf.json` para los instaladores `.msi`/`.exe` de Windows y `.dmg`/`.app` de macOS.
- **Guía de Primera Ejecución para macOS Gatekeeper y Windows SmartScreen (`README.md` y `scripts/release.mjs`):** Añadidas instrucciones paso a paso en la documentación y en el pie automático de cada GitHub Release (`xattr -cr /Applications/ChromaQR.app` y *Privacidad y Seguridad → Abrir de todos modos*).

---

## [0.0.4] - 2026-11-16

### Security (Endurecimiento Zero-Trust y Aislamiento)
- **Eliminación de Escritura Arbitraria en Backend Rust (`src-tauri/src/commands.rs`, `src/core/qr/exporter.ts`):** Eliminado el comando IPC `save_binary_file`. Ahora la exportación de archivos utiliza única y exclusivamente el alcance dinámico autorizado en memoria por la ventana nativa de guardado (`dialog:allow-save` + `fs:allow-write-file`), impidiendo escribir en cualquier ruta que el usuario no haya elegido explícitamente.
- **Recorte Quirúrgico de Capabilities ACL (`src-tauri/capabilities/default.json`):**
  - Eliminados los conjuntos globales `dialog:default`, `fs:default`, `clipboard-manager:default`, `dialog:allow-open` y `fs:allow-read-file`.
  - Restringido el portapapeles exclusivamente a escritura de imágenes (`clipboard-manager:allow-write-image`), bloqueando la lectura del portapapeles del sistema.
  - Restringido el acceso a archivos locales únicamente al archivo de plantillas en `$APPDATA` (`fs:scope-appdata-recursive`).
- **Endurecimiento de Content Security Policy (`src-tauri/tauri.conf.json`):** Añadidas directivas explícitas `script-src 'self'; object-src 'none'; base-uri 'self'` y bloqueo de conexiones externas (`connect-src 'self' ipc: http://ipc.localhost`).

### Added (Empaquetado y Aislamiento en Linux)
- **Metadatos Freedesktop AppStream (`packaging/linux/com.chromaqr.desktop.metainfo.xml`):** Embebidos en `/usr/share/metainfo/` dentro de los paquetes `.rpm` y `.deb` para certificar licencia libre MIT y clasificación OARS-1.1 ante KDE Discover y GNOME Software.
- **Manifiesto Flatpak y Lanzador Bubblewrap (`packaging/linux/`):** Incluidos `com.chromaqr.desktop.flatpak.yml` y `chromaqr-sandboxed.sh` con aislamiento a nivel de kernel (`--unshare-net` y sin acceso al directorio personal salvo `$APPDATA` y Descargas).

---

## [0.0.3] - 2026-11-16

### Fixed (Correcciones)
- **Esquema de Permisos ACL en Tauri v2 (`src-tauri/capabilities/default.json`):** Reemplazado el identificador inexistente `"fs:allow-app-data-recursive"` (que provocaba un fallo en `tauri_build::build()` al final de la compilación de Rust en los 3 sistemas operativos) por los permisos oficiales autogenerados de `tauri-plugin-fs` v2: `"fs:allow-appdata-read-recursive"`, `"fs:allow-appdata-write-recursive"` y `"fs:scope-appdata-recursive"`.
- **Regeneración Oficial de Iconos Nativos (`src-tauri/icons/`):** Regenerados todos los iconos multiplataforma (`.icns`, `.ico`, `.png`, `Square*Logo.png`, `StoreLogo.png`) a partir de un master `1024×1024` utilizando directamente el generador oficial `tauri icon` de `tauri-cli 2.12.4`.

---

## [0.0.2] - 2026-11-16

### Added (Nuevas Funcionalidades)
- **Sistema de Gestión de Versiones y Changelog (`CHANGELOG.md` + `scripts/release.mjs`):**
  - Automatización de incremento de versiones SemVer (`npm run release:patch`, `npm run release:minor`, `npm run release:major`) sincronizando `package.json`, `src-tauri/Cargo.toml` y `src-tauri/tauri.conf.json`.
  - Generación automática de entradas en `CHANGELOG.md` a partir del historial de *Conventional Commits* (`feat:`, `fix:`, `perf:`, `docs:`, `ci:`).
  - Extracción automática de las notas de la versión desde `CHANGELOG.md` hacia el cuerpo del **GitHub Release** en `.github/workflows/release.yml`.

### Fixed (Correcciones)
- **Compatibilidad de `npm run build` en Windows (`windows-latest`):** Eliminada la asignación de variables de entorno inline estilo POSIX (`ASTRO_TELEMETRY_DISABLED=1`) en `package.json` que fallaba en `cmd.exe` de Windows, trasladándola al bloque `env:` global de GitHub Actions.
- **Validación de Versiones de Paquetes en Tauri v2 (`ubuntu-22.04` y `macos-latest`):** Ajustadas las especificaciones de versión en `src-tauri/Cargo.toml` de `"2.0.0"` a `"2"` para alinearse con las versiones `2.x` de `@tauri-apps/api` y `@tauri-apps/plugin-*` verificadas por `tauri-cli`.
- **Empaquetado Multiplataforma (`tauri.conf.json` y Linux AppImage):**
  - Ajustado `bundle.targets` a `"all"` y `identifier` a `"com.chromaqr.desktop"` para evitar colisiones con la extensión `.app` en macOS.
  - Añadido `libfuse2`, `wget`, `xdg-utils` y `APPIMAGE_EXTRACT_AND_RUN=1` en el contenedor `ubuntu-22.04` para garantizar la creación de paquetes `.AppImage` en entornos CI sin FUSE montado.

---

## [0.0.1] - 2026-11-16

### Added (Lanzamiento Inicial — Hitos 1 al 6)
- **Hito 1 — Base Nativa (Tauri v2 + Astro Static + Tailwind CSS):**
  - Arquitectura híbrida con backend en Rust (`src-tauri/`) y frontend estático compilado con Astro 5 y TypeScript estricto.
  - Tipografías locales offline (`Inter` y `JetBrains Mono`) e iconografía vectorial (`lucide-astro`).
  - Permisos de seguridad (`capabilities/default.json`) limitados estrictamente a `dialog`, `fs` y `clipboard-manager`.
- **Hito 2 — Sistema de Diseño Dark Mode & Layout Split-Screen:**
  - Interfaz *Dark Mode First* estilo Linear / Raycast (`#09090B`, `#121215`, `#27272A`, `#6366F1`, `#10B981`, `#EF4444`) sin scroll global (`1150×760px`).
  - Componentes UI atómicos (`Accordion`, `Button`, `Input`, `Select`, `Slider`, `Toggle`, `ColorPicker`, `Badge`, `Toast`).
- **Hito 3 — Motor de Payloads QR (9 Estándares):**
  - Generadores puros, sanitizadores y validadores en tiempo real para **URL** (con limpieza de UTM), **Texto Plano** (UTF-8), **vCard (3.0/4.0)**, **Wi-Fi**, **Email (`mailto:`)**, **SMS / WhatsApp**, **Ubicación (`geo:`)**, **Calendario (`iCal / VEVENT`)** e **Imagen / Archivo Local** (Modo Offline Base64 con compresor en `<canvas>` hasta 2,953 bytes y Modo Enlace Web).
- **Hito 4 — Renderizado QR a 60fps & Validador de Contraste WCAG:**
  - Integración de `qr-code-styling` sincronizada con `requestAnimationFrame` sobre lienzo ajedrezado.
  - Personalización de módulos, esquinas exteriores/interiores independientes, colores sólidos, gradientes lineales/radiales, fondo transparente, logo central *Drag & Drop* y opciones técnicas (`L/M/Q/H`, `256px–4096px`, *Quiet Zone*).
  - Motor de diagnóstico óptico en vivo (`contrast.ts`) con cálculo de luminancia relativa WCAG 2.1, detección de contraste invertido y balance de área de logo vs. ECC.
- **Hito 5 — Exportación Nativa, Portapapeles y Presets Locales:**
  - Copiado directo de imagen QR al portapapeles del sistema (`Ctrl/Cmd + C`).
  - Exportación nativa a disco en formatos **PNG**, **SVG**, **WEBP** y **PDF** (`Ctrl/Cmd + S`).
  - 5 plantillas predefinidas y gestor de presets personalizados en `AppData`.
- **Hito 6 — Optimización de Binarios e Infraestructura CI/CD:**
  - Perfil `[profile.release]` en `Cargo.toml` con `lto = true`, `strip = true`, `codegen-units = 1` y `panic = "abort"`.
  - Suite completa de 18 iconos multiplataforma (`.icns`, `.ico`, `.png`, `.svg`).
  - Workflow `.github/workflows/release.yml` para publicación automatizada en GitHub Releases.
