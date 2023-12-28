// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import { invoke } from "@tauri-apps/api/tauri";
import React from "react";
import Settings from "@/components/Settings/Settings";
import "./App.scss";
import { block } from "@/utils/cn";
import SessionTimer from "@/components/SessionTimer/SessionTimer";
import PDATimer from "@/components/PDATimer/PDATimer";
// import { createContext } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";

const b = block("mwnd");

// const AppState = createContext(null);

export type Config = {
  inhale: number;
  exhale: number;
  pda: number;
  session_duration: number;
  zoom: number;
};

export enum CfgFields {
  Inhale,
  Exhale,
  PDA,
  SessDuration,
  Zoom,
  All,
}

export type ActionT = {
  type: CfgFields;
  payload: number | Config;
};

export enum AppModes {
  Running,
  Paused,
  Stopped,
}

export type AppStateT = {
  session: string;
  pda_display: string;
  pda: number;
};

export type DisplayCounterMsg = {
  session: string;
  pda_display: string;
  pda: number;
};

function calculatePDA(inhale: number, exhale: number): number {
  return inhale + exhale;
}

function calculateExhale(inhale: number, pda: number): number {
  const r = pda - inhale;
  if (r <= inhale) return -1;
  return r;
}

function reducer(state: Config, action: ActionT): Config {
  let { type, payload } = action;
  let pda, exhale;
  switch (type) {
    case CfgFields.Inhale:
      if ((payload as number) < 1) payload = 1;
      if ((payload as number) > 3) payload = 3;
      pda = calculatePDA(payload as number, state.exhale);
      if (pda == -1) return state;
      return {
        ...state,
        inhale: payload as number,
        pda: pda,
      };
    case CfgFields.Exhale:
      if ((payload as number) < state.inhale) return state;
      pda = calculatePDA(state.inhale, payload as number);
      if (pda == -1) return state;
      return {
        ...state,
        exhale: payload as number,
        pda: pda,
      };
    case CfgFields.PDA:
      if ((payload as number) < 2 * state.inhale) return state;
      exhale = calculateExhale(state.inhale, payload as number);
      if (exhale == -1) return state;
      return {
        ...state,
        exhale: exhale,
        pda: payload as number,
      };
    case CfgFields.SessDuration:
      if ((payload as number) < 2) return state;
      return {
        ...state,
        session_duration: payload as number,
      };
    case CfgFields.Zoom:
      return {
        ...state,
        zoom: payload as number,
      };
    case CfgFields.All:
      return payload as Config;
    default:
      return state;
  }
}

function App() {
  const [config, dispatch] = React.useReducer(reducer, null as any, undefined);
  const [state, setState] = React.useState({
    // mode: AppModes.Stopped,
    session: "00:00",
    pda_display: "00",
    pda: 0,
  } as AppStateT);
  const [appMode, setAppMode] = React.useState(AppModes.Stopped);
  React.useEffect(() => {
    const getConfig = async () => {
      const config: Config = await invoke("get_config");
      dispatch({ payload: config, type: CfgFields.All });
    };
    getConfig();
  }, []);

  React.useEffect(() => {
    const runListener = async () => {
      await listen("counter_tick", (event) => {
        const c: DisplayCounterMsg = event.payload as DisplayCounterMsg;
        setState({
          session: c.session,
          pda_display: c.pda_display,
          pda: c.pda,
        });
      });
    };
    runListener();
  }, []);

  const handleStartClick = async (_event: React.MouseEvent<HTMLElement>) => {
    setAppMode(AppModes.Running);
    await invoke("start");
  };

  const handlePauseClick = async (_event: React.MouseEvent<HTMLElement>) => {
    setAppMode(AppModes.Paused);
    await invoke("pause");
  };

  const handleResumeClick = async (_event: React.MouseEvent<HTMLElement>) => {
    setAppMode(AppModes.Running);
    await invoke("resume");
  };

  const handleStopClick = async (_event: React.MouseEvent<HTMLElement>) => {
    setAppMode(AppModes.Stopped);
    await invoke("stop");
  };

  if (!config) {
    return null;
  }

  return (
    <div className={b(null)}>
      <Settings config={config} dispatch={dispatch} appMode={appMode} />
      <SessionTimer
        counter={state.session}
        appMode={appMode}
        handleStart={handleStartClick}
        handleStop={handleStopClick}
        handlePause={handlePauseClick}
        handleResume={handleResumeClick}
      />
      <PDATimer
        displayCounter={state.pda_display}
        counter={state.pda}
        config={config}
      />
    </div>
  );
}

export default App;

// return (
//   <div className="container">
//     <h1>Welcome to Tauri!</h1>

//     <div className="row">
//       <a href="https://vitejs.dev" target="_blank">
//         <img src="/vite.svg" className="logo vite" alt="Vite logo" />
//       </a>
//       <a href="https://tauri.app" target="_blank">
//         <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
//       </a>
//       <a href="https://reactjs.org" target="_blank">
//         <img src={reactLogo} className="logo react" alt="React logo" />
//       </a>
//     </div>

//     <p>Click on the Tauri, Vite, and React logos to learn more.</p>

//     <form
//       className="row"
//       onSubmit={(e) => {
//         e.preventDefault();
//         greet();
//       }}
//     >
//       <input
//         id="greet-input"
//         onChange={(e) => setName(e.currentTarget.value)}
//         placeholder="Enter a name..."
//       />
//       <button type="submit">Greet</button>
//     </form>

//     <p>{greetMsg}</p>
//   </div>
// );
