import * as React from "react";
import { block } from "@/utils/cn";
import { Button } from "@gravity-ui/uikit";
import "./SessionTimer.scss";
import { AppModes } from "@/App";

const b = block("sess-tmr");
interface ISessionTimerProps {
  counter: string;
  appMode: AppModes;
  handleStart: Function;
  handleStop: Function;
  handlePause: Function;
  handleResume: Function;
}

const SessionTimer: React.FunctionComponent<ISessionTimerProps> = (props) => {
  const handleStartClick = async (_event: React.MouseEvent<HTMLElement>) => {
    props.handleStart();
  };

  const handlePauseClick = async (_event: React.MouseEvent<HTMLElement>) => {
    props.handlePause();
  };

  const handleResumeClick = async (_event: React.MouseEvent<HTMLElement>) => {
    props.handleResume();
  };

  const handleStopClick = async (_event: React.MouseEvent<HTMLElement>) => {
    props.handleStop();
  };

  return (
    <div className={b(null)}>
      <div className={b("counter")}>{props.counter}</div>
      <div className={b("toolbar")}>
        {props.appMode === AppModes.Stopped && (
          <Button
            className={b("btn")}
            view="action"
            size="xl"
            width="max"
            onClick={handleStartClick}
          >
            Старт
          </Button>
        )}
        {props.appMode === AppModes.Paused && (
          <Button
            className={b("btn")}
            view="action"
            size="xl"
            width="max"
            onClick={handleResumeClick}
          >
            Продолжить
          </Button>
        )}
        {props.appMode === AppModes.Running && (
          <Button
            className={b("btn")}
            view="action"
            size="xl"
            width="max"
            onClick={handlePauseClick}
          >
            Пауза
          </Button>
        )}

        <Button
          className={b("btn")}
          view="action"
          size="xl"
          width="max"
          onClick={handleStopClick}
          disabled={props.appMode === AppModes.Stopped}
        >
          Стоп
        </Button>
      </div>
    </div>
  );
};

export default SessionTimer;
