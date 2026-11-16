use serde::Serialize;
use std::fs;
use std::path::PathBuf;

#[derive(Serialize)]
pub struct AppInfo {
    pub name: &'static str,
    pub version: &'static str,
    pub identifier: &'static str,
}

#[tauri::command]
pub fn get_app_info() -> AppInfo {
    AppInfo {
        name: "ChromaQR",
        version: env!("CARGO_PKG_VERSION"),
        identifier: "com.chromaqr.app",
    }
}

#[tauri::command]
pub fn save_binary_file(path: String, bytes: Vec<u8>) -> Result<(), String> {
    let target = PathBuf::from(path);
    if let Some(parent) = target.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
        }
    }
    fs::write(&target, bytes).map_err(|e| format!("Failed to write file: {}", e))
}
