use eyre::Result;
use serde::{Deserialize, Serialize};
use serde_yaml;

pub static CONFIG_FILENAME: &'static str = "config.yml";

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Config {
    pub inhale: usize,
    pub exhale: usize,
    pub pda: usize,
    pub session_duration: usize,
    pub zoom: usize,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            inhale: 2,
            exhale: 8,
            pda: 10,
            session_duration: 5,
            zoom: 1,
        }
    }
}

impl Config {
    pub fn load(p: &str) -> Result<Config> {
        let raw_data = std::fs::read_to_string(p)?;
        let config: Config = serde_yaml::from_str(&raw_data)?;
        Ok(config)
    }

    pub fn save(&self, p: &str) -> Result<()> {
        let serialized = serde_yaml::to_string(&self)?;
        std::fs::write(p, serialized.as_bytes())?;
        Ok(())
    }

    pub fn update(&mut self, v: Config) {
        self.inhale = v.inhale;
        self.exhale = v.exhale;
        self.pda = v.pda;
        self.session_duration = v.session_duration;
        self.zoom = v.zoom;
    }
}
