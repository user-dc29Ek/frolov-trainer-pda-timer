use super::config::Config;
use super::counter::run_counter;
use super::App;
use tauri::State;
use tokio::sync::mpsc;

#[tauri::command]
pub fn update_config(update: Config, state: State<App>) -> Result<(), String> {
    let mut config = state.config.try_lock().unwrap();
    config.update(update);
    match config.save(&state.config_path) {
        Ok(_) => Ok(()),
        Err(e) => {
            eprintln!("{}:{} - {}", file!(), line!(), e);
            return Err(e.to_string());
        }
    }
}

#[tauri::command]
pub fn get_config(state: State<App>) -> Config {
    let config = state.config.try_lock().unwrap();
    return config.clone();
}

#[tauri::command]
pub fn start(app: tauri::AppHandle, state: State<App>) {
    let (tx, rx) = mpsc::channel::<String>(1);
    let mut counter_ch = state.counter_ch.try_lock().unwrap();
    *counter_ch = Some(tx);
    let config = state.config.try_lock().unwrap();
    let session_duration = config.session_duration * 60;
    let pda = config.pda;
    tauri::async_runtime::spawn(async move {
        run_counter(session_duration, pda, rx, app).await;
    });
}

#[tauri::command]
pub async fn stop(state: State<'_, App>) -> Result<(), ()> {
    let ch = state.counter_ch.lock().await;
    if ch.is_none() {
        println!("ch is none");
        return Ok(());
    }
    let tx = ch.as_ref().unwrap().clone();
    let _ = tx.send("stop".into()).await;

    println!("send stop");
    Ok(())
}

#[tauri::command]
pub async fn pause(state: State<'_, App>) -> Result<(), ()> {
    let ch = state.counter_ch.lock().await;
    if ch.is_none() {
        return Ok(());
    }
    let tx = ch.as_ref().unwrap().clone();
    let _ = tx.send("pause".into()).await;
    Ok(())
}

#[tauri::command]
pub async fn resume(state: State<'_, App>) -> Result<(), ()> {
    let ch = state.counter_ch.lock().await;
    if ch.is_none() {
        return Ok(());
    }
    let tx = ch.as_ref().unwrap().clone();
    let _ = tx.send("resume".into()).await;
    Ok(())
}
