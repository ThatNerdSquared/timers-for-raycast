import { Icon, MenuBarExtra, getPreferenceValues, launchCommand, LaunchType } from "@raycast/api";
import { useEffect } from "react";
import useAlarms from "./hooks/useAlarms";
import { formatTime } from "./backend/formatUtils";
import { Alarm, Preferences } from "./backend/types";
import { formatMenuBarIcon, formatMenuBarTitle } from "./backend/menuBarUtils";
import { shortCircuitMenuBar } from "./backend/utils";

export default function Command() {
  const { alarms, isLoading, refreshAlarms, handleStopAlarm } = useAlarms();

  useEffect(() => {
    refreshAlarms();
    setInterval(() => {
      refreshAlarms();
    }, 1000);
  }, []);

  if (isLoading) {
    refreshAlarms();
  }
  const prefs = getPreferenceValues<Preferences>();
  if (shortCircuitMenuBar<Alarm>(alarms, prefs)) return null;

  return (
    <MenuBarExtra
      icon={formatMenuBarIcon<Alarm>(alarms, prefs, Icon.Alarm)}
      isLoading={isLoading}
      title={formatMenuBarTitle<Alarm>(alarms, prefs)}
    >
      <MenuBarExtra.Item title="Click alarm to stop" />
      {alarms?.map((alarm) => (
        <MenuBarExtra.Item
          title={alarm.name + ": " + (alarm.timeLeft === 0 ? "Ringing!" : formatTime(alarm.timeLeft) + " left")}
          key={alarm.originalFile}
          onAction={() => handleStopAlarm(alarm)}
        />
      ))}

      <MenuBarExtra.Section>
        <MenuBarExtra.Item
          title="Set New Alarm"
          onAction={async () => await launchCommand({ name: "setAlarm", type: LaunchType.UserInitiated })}
          key="setAlarm"
        />
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
