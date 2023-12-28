import * as React from "react";
import "./Settings.scss";
import { block } from "@/utils/cn";
import { TextInput } from "@gravity-ui/uikit";
import { FormRow } from "@gravity-ui/components";
import { Config, ActionT, CfgFields, AppModes } from "@/App";
import { invoke } from "@tauri-apps/api/tauri";

const b = block("settings");

interface ISettingsProps {
  config: Config;
  dispatch: React.Dispatch<ActionT>;
  appMode: AppModes;
}

const Settings: React.FunctionComponent<ISettingsProps> = (props) => {
  const { config: c, dispatch } = props;

  React.useEffect(() => {
    invoke("update_config", { update: c });
  }, [c]);

  const handleInhaleUpdate = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch({ type: CfgFields.Inhale, payload: event.target.valueAsNumber });
    // console.log(event.target.valueAsNumber);
  };

  const handleExhaleUpdate = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch({ type: CfgFields.Exhale, payload: event.target.valueAsNumber });
  };

  const handlePDAUpdate = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch({ type: CfgFields.PDA, payload: event.target.valueAsNumber });
  };

  const handleSessionDurationUpdate = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch({
      type: CfgFields.SessDuration,
      payload: event.target.valueAsNumber,
    });
  };

  return (
    <div className={b(null)}>
      <FormRow label={"Вдох, сек."} fieldId={"inhale"} direction="column">
        <TextInput
          id={"inhale"}
          name={"inhale"}
          size="xl"
          type="number"
          value={c.inhale.toString()}
          onChange={handleInhaleUpdate}
          disabled={props.appMode !== AppModes.Stopped}
        />
      </FormRow>
      <FormRow label={"Выдох, сек."} fieldId={"exhale"} direction="column">
        <TextInput
          size="xl"
          id={"exhale"}
          name={"exhale"}
          type="number"
          value={c.exhale.toString()}
          onChange={handleExhaleUpdate}
          disabled={props.appMode !== AppModes.Stopped}
        />
      </FormRow>
      <FormRow label={"ПДА, сек."} fieldId={"pda"} direction="column">
        <TextInput
          size="xl"
          id={"pda"}
          name={"pda"}
          type="number"
          value={c.pda.toString()}
          onChange={handlePDAUpdate}
          disabled={props.appMode !== AppModes.Stopped}
        />
      </FormRow>
      <FormRow
        label={"Продолжительность тренировки, мин."}
        fieldId={"duration"}
        direction="column"
      >
        <TextInput
          size="xl"
          id={"duration"}
          name={"duration"}
          type="number"
          value={c.session_duration.toString()}
          onChange={handleSessionDurationUpdate}
          disabled={props.appMode !== AppModes.Stopped}
        />
      </FormRow>
    </div>
  );
};

export default Settings;
