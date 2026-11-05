import { Action, ActionPanel, Form, getPreferenceValues, useNavigation } from "@raycast/api";
import { useState } from "react";
import { soundData } from "./backend/soundData";
import useAlarms from "./hooks/useAlarms";
import { Preferences } from "./backend/types";

interface AlarmValues {
  targetTime: Date | null;
  name: string;
  selectedSound: string;
}

export default function SetAlarmView() {
  const { handleStartAlarm } = useAlarms();
  const { pop } = useNavigation();
  const [timeErr, setTimeErr] = useState<string | undefined>();
  const [minTime] = useState(() => new Date());

  const prefs: Preferences = getPreferenceValues();

  const dropTimeErrorIfNeeded = () => {
    if (timeErr && timeErr.length > 0) {
      setTimeErr(undefined);
    }
  };

  const handleSubmit = (values: AlarmValues) => {
    if (!values.targetTime) {
      setTimeErr("Please pick a date and time for the alarm!");
      return;
    }
    if (values.targetTime.getTime() < minTime.getTime()) {
      setTimeErr("Alarm time must be in the future!");
      return;
    }

    const alarmName = values.name ? values.name : "Untitled";
    handleStartAlarm(values.targetTime, alarmName, values.selectedSound).then(() => pop());
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Set Alarm" onSubmit={(values: AlarmValues) => handleSubmit(values)} />
        </ActionPanel>
      }
    >
      <Form.DatePicker
        id="targetTime"
        title="Alarm Time"
        type={Form.DatePicker.Type.DateTime}
        min={minTime}
        error={timeErr}
        onChange={dropTimeErrorIfNeeded}
      />
      <Form.Dropdown id="selectedSound" defaultValue="default" title="Sound">
        <Form.Dropdown.Item value="default" title="Default" />
        {soundData.map((item, index) => (
          <Form.Dropdown.Item
            key={index}
            title={item.value === prefs.selectedSound ? `${item.title} (currently selected)` : item.title}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </Form.Dropdown>
      <Form.TextField id="name" title="Name" placeholder="Wake up" />
    </Form>
  );
}
