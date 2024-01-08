use serde::Serialize;
use tauri::Manager;
use tokio::sync::mpsc::Receiver;
use tokio::time::{self, interval, MissedTickBehavior};

#[derive(Serialize, Debug, Clone)]
pub struct DisplayCounterMsg {
    session: String,
    pda_display: String,
    pda: usize,
}

pub async fn run_counter(
    session_duration: usize, //in seconds
    pda: usize,              //in seconds
    mut cmd_ch: Receiver<String>,
    app: tauri::AppHandle,
) {
    let mut timer = interval(time::Duration::from_secs(1));
    timer.set_missed_tick_behavior(MissedTickBehavior::Skip);
    let mut i = 1;
    'main: while i <= session_duration {
        tokio::select! {
            _ = timer.tick() =>{
                let r = seconds_to_minutes_secs(i);
                let (pda_sec, pda_display) = seconds_to_pda_seconds(i, pda);
                let _ = app.emit_all("counter_tick", DisplayCounterMsg{session: r, pda_display: pda_display, pda: pda_sec});
            },
            Some(v) = cmd_ch.recv() =>{
                match v.as_str() {
                    "stop"=>{
                        break 'main;
                    },
                    "pause"=>{
                        'wait: loop {
                            match cmd_ch.recv().await {
                                Some(v)=>{
                                    match v.as_str() {
                                        "resume"=> {
                                            let (pda_sec, _) = seconds_to_pda_seconds(i, pda);
                                            i = i-pda_sec;
                                            timer.tick().await;
                                            break 'wait;
                                        },
                                        "stop"  =>{ break 'main;},
                                        _ => {}
                                    };
                                },
                                None=>{}
                            }
                        }
                    },
                    _=>{}
                };
            }
        }
        i = i + 1;
    }
    let _ = app.emit_all(
        "finished",
        DisplayCounterMsg {
            session: "00:00".into(),
            pda_display: "00".into(),
            pda: 0,
        },
    );
}

fn seconds_to_minutes_secs(seconds: usize) -> String {
    let (m, s) = divmod(seconds, 60);
    format!("{:0>2}:{:0>2}", m, s)
}

fn divmod(x: usize, y: usize) -> (usize, usize) {
    let quotient = x / y;
    let remainder = x % y;
    (quotient, remainder)
}

fn seconds_to_pda_seconds(seconds: usize, pda: usize) -> (usize, String) {
    let mut remainder = seconds % pda;
    if remainder == 0 {
        remainder = pda;
    }
    (remainder, format!("{:0>2}", remainder))
}
