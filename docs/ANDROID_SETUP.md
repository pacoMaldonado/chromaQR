# Guía de Desarrollo, Firma y Compilación para Android

Esta guía documenta todo lo necesario para compilar, firmar y probar **ChromaQR** en Android desde Linux (ej. Fedora / Ubuntu) y en GitHub Actions.

---

## 1. Requisitos del Entorno Local

### Linux (Fedora)
```bash
sudo dnf install android-tools dbus-devel
```

### Java 17 (requerido por Android Gradle Plugin)
> Android Gradle Plugin requiere **JDK 17** (o 21). Java 25 aún no es compatible con Gradle.

Con [SDKMAN](https://sdkman.io/):
```bash
sdk install java 17.0.21.1.2-amzn
```

### Android Studio + SDK / NDK
Desde **Android Studio → SDK Manager → SDK Tools**, instala:
- **Android SDK Platform** (API 36)
- **Android SDK Build-Tools** (36.x)
- **Android SDK Command-line Tools**
- **NDK (Side by side)**

### Targets de Rust para Android
```bash
rustup target add \
  aarch64-linux-android \
  armv7-linux-androideabi \
  i686-linux-android \
  x86_64-linux-android
```

### Variables de Entorno (`~/.bashrc` o `~/.zshrc`)
```bash
export JAVA_HOME="$HOME/.sdkman/candidates/java/current"
export ANDROID_HOME="$HOME/Android/Sdk"
export NDK_HOME="$ANDROID_HOME/ndk/$(ls -1 "$ANDROID_HOME/ndk" | tail -n 1)"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
```

---

## 2. Compilación y Prueba Local

```bash
# Compilar APK de prueba rápido (solo arm64, teléfonos modernos)
npx tauri android build --debug --apk --target aarch64

# Compilar APK universal + AAB (Google Play) de producción
npx tauri android build --apk --aab

# Instalar APK en teléfono conectado por USB o Wi-Fi (ADB)
adb install -r src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

Rutas de salida:
- **APK Release:** `src-tauri/gen/android/app/build/outputs/apk/universal/release/`
- **AAB Release (Google Play):** `src-tauri/gen/android/app/build/outputs/bundle/universalRelease/`

---

## 3. Firma Criptográfica (Keystore) y Respaldo

Android exige que todo `.apk` o `.aab` de producción esté firmado con un archivo **Keystore (`.jks`)**.

> **⚠️ IMPORTANTE:**
> - **Nunca** subas archivos `.jks`, `.keystore` ni `keystore.properties` a Git (están bloqueados en `.gitignore`).
> - **Respalda tu `.jks` y su contraseña** en un lugar seguro (gestor de contraseñas, nube privada cifrada o USB). Si lo pierdes, no podrás publicar actualizaciones sobre instalaciones existentes ni en Google Play.

### Generar un Keystore nuevo (solo una vez en la vida del proyecto)
```bash
"$JAVA_HOME/bin/keytool" -genkey -v \
  -keystore ~/chromaqr-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias chromaqr
```

### Firma local (opcional, para compilar `--release` en tu PC)
1. Copia `~/chromaqr-release.jks` a `src-tauri/gen/android/chromaqr-release.jks`.
2. Crea `src-tauri/gen/android/keystore.properties` (ignorado por Git):
   ```properties
   password=TU_CONTRASEÑA
   keyAlias=chromaqr
   storeFile=chromaqr-release.jks
   ```

### Firma automática en GitHub Actions (CI/CD)
1. Codifica tu `.jks` en Base64:
   ```bash
   base64 -w 0 ~/chromaqr-release.jks
   ```
2. En GitHub ve a **Settings → Secrets and variables → Actions** y configura estos 3 secretos:
   | Secret | Contenido |
   |---|---|
   | `ANDROID_KEY_BASE64` | Salida Base64 del archivo `.jks` |
   | `ANDROID_KEY_PASSWORD` | Contraseña del keystore y de la llave |
   | `ANDROID_KEY_ALIAS` | `chromaqr` |

Al publicar un tag `vX.Y.Z`, el workflow `.github/workflows/release.yml` reconstruye el keystore temporalmente en memoria del runner, firma tanto el `.apk` universal como el `.aab` y los adjunta al Release de GitHub.
