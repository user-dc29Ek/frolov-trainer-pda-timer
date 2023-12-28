import * as React from "react";
import "./PDATimer.scss";
import { block } from "@/utils/cn";
import { Progress } from "@gravity-ui/uikit";
import { Config } from "@/App";

const b = block("pda-tmr");
interface IPDATimerProps {
  counter: number;
  displayCounter: string;
  config: Config;
}

function calculateSegments(
  counter: number,
  pda: number,
  inhale: number
): [number, number, number, number] {
  const totalInhaleSegment =
    counter <= inhale ? ((inhale - counter) / pda) * 100 : 0;
  const currentInhaleSegment =
    counter <= inhale ? (counter / pda) * 100 : (inhale / pda) * 100;
  const currentExhaleSegment =
    counter <= inhale
      ? 0
      : ((counter - inhale) / (pda - inhale)) * (((pda - inhale) / pda) * 100);
  const totalExhaleSegment =
    ((pda - inhale) / pda) * 100 - currentExhaleSegment;

  return [
    currentInhaleSegment,
    totalInhaleSegment,
    currentExhaleSegment,
    totalExhaleSegment,
  ];
}

const PDATimer: React.FunctionComponent<IPDATimerProps> = (props) => {
  const [
    currentInhaleSegment,
    totalInhaleSegment,
    currentExhaleSegment,
    totalExhaleSegment,
  ] = calculateSegments(props.counter, props.config.pda, props.config.inhale);
  console.log(
    props.counter,
    currentInhaleSegment,
    totalInhaleSegment,
    currentExhaleSegment,
    totalExhaleSegment
  );
  return (
    <div className={b(null)}>
      <div className={b("progress")}>
        <Progress
          text=""
          size="m"
          value={100}
          stack={[
            {
              color: "rgb(255, 216, 157)",
              value: currentInhaleSegment,
            },
            { color: "rgb(211, 158, 80)", value: totalInhaleSegment },
            { color: "rgb(48, 170, 110)", value: currentExhaleSegment },
            {
              color: "rgb(42,108,76)",
              value: totalExhaleSegment,
            },
          ]}
        />
      </div>
      <div className={b("counter")}>{props.displayCounter}</div>
    </div>
  );
};

export default PDATimer;
