#!/usr/bin/env node
/**
 * ChromaQR — Automated Version Bump & Changelog Generator
 *
 * Usage:
 *   npm run release:patch              # 0.0.4 -> 0.0.5
 *   npm run release:minor              # 0.0.4 -> 0.1.0
 *   npm run release:major              # 0.1.0 -> 1.0.0
 *   npm run release -- 1.2.0           # Explicit version
 *   node scripts/release.mjs --extract-notes v0.0.5
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PKG_PATH = path.join(ROOT, 'package.json');
const CARGO_PATH = path.join(ROOT, 'src-tauri', 'Cargo.toml');
const TAURI_CONF_PATH = path.join(ROOT, 'src-tauri', 'tauri.conf.json');
const CHANGELOG_PATH = path.join(ROOT, 'CHANGELOG.md');

const INSTALL_FOOTER = `---
### Instaladores Disponibles
- **Linux:** \`.AppImage\`, \`.deb\`, \`.rpm\`
- **macOS:** \`.dmg\`, \`.app\` (Universal Binary: Apple Silicon M1/M2/M3/M4 + Intel, con firma Ad-Hoc)
- **Windows:** \`.msi\`, \`.exe\` (NSIS)
- **Android:** \`.apk\` (instalación directa) y \`.aab\` (Android App Bundle para Google Play)

### Nota de Primera Ejecución en macOS, Windows y Android (Open Source sin Certificado Comercial)
- **En Android:** Descarga el archivo \`.apk\`, ábrelo desde tu gestor de archivos y autoriza **"Instalar apps desconocidas"** si Android lo solicita.
- **En macOS (Sequoia / Sonoma / Ventura):** Al ser software libre distribuido fuera de la Mac App Store sin membresía de pago de Apple Developer, tras arrastrar **ChromaQR.app** a \`/Applications\`, autorízalo en 1 paso:
  - **Vía Terminal (Instantáneo):** Ejecuta \`xattr -cr /Applications/ChromaQR.app\` y ábrela normalmente.
  - **Vía Interfaz Gráfica:** Intenta abrirla, luego ve a **Configuración del Sistema → Privacidad y Seguridad**, baja hasta el aviso de *ChromaQR* y haz clic en **"Abrir de todos modos"**.
- **En Windows:** Si aparece el aviso de SmartScreen, haz clic en **"Más información" → "Ejecutar de todas formas"**.`;

function extractReleaseNotes(tagOrVersion) {
  const cleanVer = tagOrVersion.replace(/^v/, '').trim();
  if (!fs.existsSync(CHANGELOG_PATH)) {
    return `## ChromaQR v${cleanVer}\n\n${INSTALL_FOOTER}`;
  }
  const content = fs.readFileSync(CHANGELOG_PATH, 'utf8');
  const escaped = cleanVer.replace(/\./g, '\\.');
  const regex = new RegExp(
    `## \\[${escaped}\\][^\\n]*\\n([\\s\\S]*?)(?=\\n---\\n|\\n## \\[|$)`
  );
  const match = content.match(regex);
  if (match && match[1].trim()) {
    return `${match[1].trim()}\n\n${INSTALL_FOOTER}`;
  }
  return `## ChromaQR v${cleanVer}\n\nConsulta el historial completo en [CHANGELOG.md](https://github.com/pacoMaldonado/chromaQR/blob/main/CHANGELOG.md).\n\n${INSTALL_FOOTER}`;
}

function bumpSemver(current, typeOrExplicit) {
  if (/^\d+\.\d+\.\d+$/.test(typeOrExplicit)) {
    return typeOrExplicit;
  }
  const [maj, min, pat] = current.split('.').map(Number);
  switch (typeOrExplicit) {
    case 'major':
      return `${maj + 1}.0.0`;
    case 'minor':
      return `${maj}.${min + 1}.0`;
    case 'patch':
      return `${maj}.${min}.${pat + 1}`;
    default:
      throw new Error(
        `Argumento inválido "${typeOrExplicit}". Usa: patch | minor | major | X.Y.Z`
      );
  }
}

function getCommitsSinceLastTag() {
  try {
    const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null', {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();
    const log = execSync(`git log ${lastTag}..HEAD --pretty=format:"%s (%h)"`, {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();
    return log ? log.split('\n') : [];
  } catch {
    try {
      const log = execSync('git log -n 20 --pretty=format:"%s (%h)"', {
        cwd: ROOT,
        encoding: 'utf8',
      }).trim();
      return log ? log.split('\n') : [];
    } catch {
      return [];
    }
  }
}

function buildChangelogSection(newVersion, commits) {
  const today = new Date().toISOString().slice(0, 10);
  const added = [];
  const fixed = [];
  const changed = [];
  const other = [];

  for (const line of commits) {
    if (/^Merge pull request/i.test(line)) continue;
    if (/^feat(\(.+\))?:/i.test(line)) {
      added.push(`- ${line.replace(/^feat(\(.+\))?:\s*/i, '')}`);
    } else if (/^fix(\(.+\))?:/i.test(line)) {
      fixed.push(`- ${line.replace(/^fix(\(.+\))?:\s*/i, '')}`);
    } else if (/^(perf|refactor)(\(.+\))?:/i.test(line)) {
      changed.push(`- ${line.replace(/^(perf|refactor)(\(.+\))?:\s*/i, '')}`);
    } else {
      other.push(`- ${line}`);
    }
  }

  const blocks = [`## [${newVersion}] - ${today}`];
  if (added.length > 0) {
    blocks.push(`### Added (Nuevas Funcionalidades)\n${added.join('\n')}`);
  }
  if (fixed.length > 0) {
    blocks.push(`### Fixed (Correcciones)\n${fixed.join('\n')}`);
  }
  if (changed.length > 0) {
    blocks.push(`### Changed (Mejoras)\n${changed.join('\n')}`);
  }
  if (other.length > 0 && added.length === 0 && fixed.length === 0) {
    blocks.push(`### Maintenance & CI/CD\n${other.join('\n')}`);
  }
  if (blocks.length === 1) {
    blocks.push('### Changed\n- Mantenimiento general y actualización de versión.');
  }

  return blocks.join('\n\n');
}

function checkVersionSync(expectedTag) {
  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
  const tauriConf = JSON.parse(fs.readFileSync(TAURI_CONF_PATH, 'utf8'));
  const cargoToml = fs.readFileSync(CARGO_PATH, 'utf8');
  const cargoMatch = cargoToml.match(/^version\s*=\s*"([^"]+)"/m);
  const cargoVersion = cargoMatch ? cargoMatch[1] : null;

  const versions = {
    'package.json': pkg.version,
    'src-tauri/tauri.conf.json': tauriConf.version,
    'src-tauri/Cargo.toml': cargoVersion,
  };

  const unique = new Set(Object.values(versions));
  if (unique.size !== 1 || !pkg.version) {
    console.error('❌ Desfase de versiones entre archivos del proyecto:');
    for (const [file, ver] of Object.entries(versions)) {
      console.error(`   • ${file}: ${ver ?? '(no encontrada)'}`);
    }
    process.exit(1);
  }

  if (expectedTag && /^v\d+\.\d+\.\d+/.test(expectedTag)) {
    const cleanTag = expectedTag.replace(/^v/, '').trim();
    if (cleanTag !== pkg.version) {
      console.error(
        `❌ El tag de Git (${expectedTag}) no coincide con la versión del proyecto (v${pkg.version}).`
      );
      console.error('   Ejecuta "npm run release:minor" (o patch/major) antes de crear el tag.');
      process.exit(1);
    }
  }

  console.log(`✅ Versiones sincronizadas: v${pkg.version}${expectedTag ? ` (tag ${expectedTag})` : ''}`);
}

function main() {
  const args = process.argv.slice(2);

  if (args[0] === '--check') {
    checkVersionSync(args[1]);
    return;
  }

  if (args[0] === '--extract-notes') {
    const targetVer = args[1] || '0.0.5';
    process.stdout.write(extractReleaseNotes(targetVer));
    return;
  }

  const mode = args[0] || 'patch';
  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
  const currentVersion = pkg.version;
  const nextVersion = bumpSemver(currentVersion, mode);

  // 1. Update package.json
  pkg.version = nextVersion;
  fs.writeFileSync(PKG_PATH, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');

  // 2. Update src-tauri/tauri.conf.json
  const tauriConf = JSON.parse(fs.readFileSync(TAURI_CONF_PATH, 'utf8'));
  tauriConf.version = nextVersion;
  fs.writeFileSync(TAURI_CONF_PATH, `${JSON.stringify(tauriConf, null, 2)}\n`, 'utf8');

  // 3. Update src-tauri/Cargo.toml
  const cargoToml = fs.readFileSync(CARGO_PATH, 'utf8');
  const updatedCargo = cargoToml.replace(
    /^version\s*=\s*"[^"]+"/m,
    `version = "${nextVersion}"`
  );
  fs.writeFileSync(CARGO_PATH, updatedCargo, 'utf8');

  // 4. Update CHANGELOG.md if section doesn't exist yet
  if (fs.existsSync(CHANGELOG_PATH)) {
    const changelog = fs.readFileSync(CHANGELOG_PATH, 'utf8');
    if (!changelog.includes(`## [${nextVersion}]`)) {
      const commits = getCommitsSinceLastTag();
      const newSection = buildChangelogSection(nextVersion, commits);
      const updatedChangelog = changelog.replace(
        /## \[Unreleased\]\s*\n\s*---/,
        `## [Unreleased]\n\n---\n\n${newSection}\n\n---`
      );
      fs.writeFileSync(CHANGELOG_PATH, updatedChangelog, 'utf8');
    }
  }

  console.log(`\n✅ Versión actualizada: ${currentVersion} -> ${nextVersion}`);
  console.log('   • package.json');
  console.log('   • src-tauri/Cargo.toml');
  console.log('   • src-tauri/tauri.conf.json');
  console.log('   • CHANGELOG.md\n');
  console.log('Para liberar esta versión en GitHub Actions ejecuta:');
  console.log(`   git add package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json CHANGELOG.md`);
  console.log(`   git commit -m "chore(release): v${nextVersion}"`);
  console.log(`   git tag v${nextVersion}`);
  console.log(`   git push origin main --tags\n`);
}

main();
