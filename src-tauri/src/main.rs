// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use eyre::{eyre, Result};
use serde::{Deserialize, Serialize};
use std::env;
use tokio::sync::Mutex;
mod commands;
mod config;
mod counter;
use commands::{get_config, pause, resume, start, stop, update_config};
use directories::ProjectDirs;
use tauri::Manager;
use tokio::sync::mpsc;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CounterPayload {
    pub session_counter: usize,
    pub pda_counter: usize,
}

pub struct Counter {
    pub inhale: usize,
    pub pda_duration: usize,
    pub pda_counter: usize,
    pub session_duration: usize,
    pub session_counter: usize,
}

impl Default for Counter {
    fn default() -> Self {
        Counter {
            inhale: 0,
            pda_duration: 0,
            pda_counter: 0,
            session_duration: 0,
            session_counter: 0,
        }
    }
}

impl Counter {
    pub fn start(&mut self, inhale: usize, pda_duration: usize, session_duration: usize) {
        self.inhale = inhale;
        self.pda_duration = pda_duration;
        self.session_duration = session_duration;
    }
    pub fn pause(&mut self) {}
    pub fn stop(&mut self, app: tauri::AppHandle) {
        *self = Counter::default();
        let _ = app.emit_all("stop", ());
    }
}

pub struct App {
    pub config_path: String,
    pub config: Mutex<config::Config>,
    pub counter_ch: Mutex<Option<mpsc::Sender<String>>>,
}

fn main() {
    let app = match init() {
        Ok(v) => v,
        Err(_) => {
            return;
        }
    };

    tauri::Builder::default()
        .manage(app)
        .invoke_handler(tauri::generate_handler![
            update_config,
            get_config,
            start,
            stop,
            pause,
            resume
        ])
        .run(tauri::generate_context!())
        .expect("error while running application");
}

fn init() -> Result<App> {
    // let p = match env::current_exe() {
    //     Ok(exe_path) => {
    //         let p = exe_path.to_owned();
    //         let parent = p.parent().unwrap().to_owned();
    //         parent
    //     }
    //     Err(err) => {
    //         println!(
    //             "Невозможно определить путь до исполняемого файла приложения. {}",
    //             err
    //         );
    //         return Err(err.into());
    //     }
    // };
    let p = match ProjectDirs::from("", "", "pda_timer") {
        Some(v) => v.config_dir().to_owned(),
        None => {
            let e = format!("Невозможно определить путь для хранения конфигурации");
            eprintln!("{}:{} - {}", file!(), line!(), e);
            return Err(eyre!("{}", e));
        }
    };
    let config_path = p.join(config::CONFIG_FILENAME).to_owned();
    let config_path = config_path.to_str().unwrap();
    let exists = match is_path_exists(&config_path) {
        Ok(v) => v,
        Err(e) => {
            eprintln!("{}:{} - {}", file!(), line!(), e);
            return Err(e);
        }
    };
    if !exists {
        match std::fs::create_dir_all(p) {
            Ok(_) => {}
            Err(e) => {
                eprintln!("{}:{} - {}", file!(), line!(), e);
                return Err(e.into());
            }
        }
        let c = config::Config::default();
        match c.save(config_path) {
            Ok(_) => {}
            Err(e) => {
                eprintln!("{}:{} - {}", file!(), line!(), e);
                return Err(e);
            }
        }
    }
    let c = match config::Config::load(config_path) {
        Ok(v) => v,
        Err(e) => {
            eprintln!("{}:{} - {}", file!(), line!(), e);
            return Err(e);
        }
    };
    Ok(App {
        config_path: config_path.to_string(),
        config: Mutex::new(c),
        counter_ch: Mutex::new(None),
    })
}

fn is_path_exists(path: &str) -> Result<bool> {
    let p = std::path::Path::new(path);
    match p.try_exists() {
        Ok(v) => Ok(v),
        Err(_) => Err(eyre!(
            "Невозможно проверить существует ли файл или путь. Проверьте права доступа к {}",
            path
        )),
    }
}
