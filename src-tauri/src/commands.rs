use serde::Serialize;

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
        identifier: "com.chromaqr.desktop",
    }
}
