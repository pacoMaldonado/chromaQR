# ChromaQR — Pro QR Studio

> **Aplicación de escritorio multiplataforma (Linux, macOS, Windows) de alto rendimiento y bajo consumo de recursos para la generación, personalización estética avanzada y validación óptica de códigos QR.**

[![License: MIT](https://img.shields.io/badge/License-MIT-6366F1.svg)](./LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-10B981.svg)](https://v2.tauri.app/)
[![Astro Static](https://img.shields.io/badge/Astro-Static%20SPA-FF5D01.svg)](https://astro.build/)

---

## Características Principales

- **Arquitectura Nativa Ultraligera:** Impulsada por **Tauri v2 (Rust)** y **Astro (`output: 'static'`) + TypeScript**, sin sobrecoste de frameworks pesados y con operación **100% offline**.
- **Estética Dark Mode First (Linear / Raycast Style):** Layout *Split-Screen* fijo (`1150×760px`, proporción 60% configuración / 40% previsualización) sin scroll global.
- **Renderizado en Vivo a 60fps:** Lienzo elevado con fondo ajedrezado para transparencias sincronizado mediante `requestAnimationFrame`.
- **Indicador de Escaneabilidad en Tiempo Real (UX Pro):** Evalúa automáticamente el ratio de contraste **WCAG 2.1**, detecta inversión polar (módulos claros sobre fondo oscuro), verifica el área ocupada por el logo central frente al nivel Reed-Solomon (`L`, `M`, `Q`, `H`) y alerta sobre densidad binaria.
- **9 Estándares de Payload QR:**
  1. **URL / Sitio Web:** Validación HTTPS y limpiador automático de parámetros de rastreo (`utm_*`, `fbclid`, `gclid`, `msclkid`).
  2. **Texto Plano / Notas:** Soporte UTF-8 completo, conteo exacto de bytes y alerta de densidad.
  3. **vCard 3.0 / 4.0:** Tarjeta de contacto completa (nombre, empresa, cargo, teléfonos móvil/trabajo, email, web y dirección física).
  4. **Wi-Fi:** SSID, contraseña con toggle de visibilidad, encriptación (`WPA/WPA2/WPA3`, `WEP`, `Abierta`) y red oculta.
  5. **Correo Electrónico (`mailto:`):** Destinatario, asunto y cuerpo predefinidos.
  6. **SMS / WhatsApp:** Selector de canal (`SMSTO:` o `https://wa.me/`), código internacional y mensaje prellenado.
  7. **Ubicación Geográfica (`geo:`):** Latitud, longitud y formato `geo:` o enlace a Google Maps.
  8. **Evento de Calendario (`iCal / VEVENT`):** Título, ubicación, inicio/fin, día completo y notas.
  9. **Imagen / Archivo Local:**
     - *Modo 1 (Offline Data / Base64):* Compresor en `<canvas>` con medidor en vivo frente al límite físico de **2,953 bytes** de un QR v40-L.
     - *Modo 2 (Enlace a Imagen):* URL de imagen alojada en web con previsualización.
- **Personalización Estética Completa (5 Módulos):**
  1. **Módulos (Puntos):** `square`, `rounded`, `dots`, `extra-rounded`, `classy`, `classy-rounded`.
  2. **Esquinas (Eyes):** Marco exterior e interior personalizables por separado en forma y color.
  3. **Colores y Gradientes:** Sólidos o gradientes (`linear` / `radial` con rotación) y fondo transparente.
  4. **Logo Central:** Carga *Drag & Drop* (`PNG`, `SVG`, `JPG`, `WEBP`), tamaño, margen interno y limpieza de módulos bajo el logo.
  5. **Opciones Técnicas:** Nivel ECC (`L`, `M`, `Q`, `H`), resolución de salida (`256px` a `4096px`) y *Quiet Zone*.
- **Exportación Nativa & Presets Locales:**
  - Copiado directo de imagen al portapapeles del sistema (`Ctrl/Cmd + C`).
  - Exportación con diálogo nativo en **PNG**, **SVG** (vectorial puro), **WEBP** y **PDF**.
  - Plantillas predefinidas y guardado local de presets personalizados en `AppData`.

---

## Instalación por Sistema Operativo

Descarga el instalador para tu sistema desde la sección **[Releases](https://github.com/pacoMaldonado/chromaQR/releases)**:

### 🐧 Linux (`.AppImage`, `.deb`, `.rpm`)
- **Fedora / RHEL:** `sudo dnf install ./ChromaQR_*.rpm`
- **Ubuntu / Debian:** `sudo apt install ./ChromaQR_*.deb`
- **AppImage:** `chmod +x ChromaQR_*.AppImage && ./ChromaQR_*.AppImage`

### 🍎 macOS (`.dmg` Universal — Apple Silicon & Intel)
1. Abre el archivo `.dmg` y arrastra **ChromaQR.app** a tu carpeta **Aplicaciones (`/Applications`)**.
2. Como ChromaQR es software libre (MIT) distribuido sin certificado comercial de pago de Apple ($99/año), macOS Gatekeeper mostrará un aviso la primera vez que lo abras. Puedes autorizarlo de cualquiera de estas **2 formas**:
   - **Opción 1 — Vía Terminal (1 segundo, recomendada):**
     Abre la Terminal y ejecuta:
     ```bash
     xattr -cr /Applications/ChromaQR.app
     ```
     *(Esto elimina la etiqueta de cuarentena del navegador `com.apple.quarantine` y permite abrir la app normalmente siempre).*
   - **Opción 2 — Desde Configuración del Sistema (Sin Terminal):**
     Intenta abrir `ChromaQR.app`, luego abre **Configuración del Sistema → Privacidad y Seguridad**, desplázate hacia abajo hasta la sección *Seguridad* donde dice *"Se bloqueó el uso de ChromaQR"* y haz clic en **"Abrir de todos modos"**.

### 🪟 Windows (`.msi` / `.exe`)
- Ejecuta el instalador `.exe` o `.msi`. Si aparece la ventana de *Windows SmartScreen*, haz clic en **"Más información"** y luego en **"Ejecutar de todas formas"**.

---

## Desarrollo y Compilación Local

```bash
# 1. Instalar dependencias de frontend
npm install

# 2. Verificar tipado estricto (astro check) y compilar frontend estático en dist/
npm run build

# 3. Iniciar entorno de desarrollo web (puerto 1420)
npm run dev

# 4. Iniciar ventana nativa de escritorio con Tauri v2
npm run tauri:dev

# 5. Generar instaladores nativos optimizados (LTO + Strip)
npm run tauri:build
```

---

## Gestión de Versiones, Changelog y Publicación (CI/CD)

ChromaQR cuenta con un flujo automatizado de versionado ([Semantic Versioning](https://semver.org/lang/es/)) y registro de cambios ([CHANGELOG.md](./CHANGELOG.md) bajo el estándar *Keep a Changelog*).

```bash
# Incrementar versión (patch | minor | major) y actualizar CHANGELOG.md
npm run release:patch

# Confirmar y publicar tag para disparar GitHub Actions
git add package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json CHANGELOG.md
git commit -m "chore(release): v0.0.5"
git tag v0.0.5
git push origin main --tags
```

---

## Licencia

Distribuido bajo la licencia **MIT**. Consulta el archivo [LICENSE](./LICENSE) para más detalles.
