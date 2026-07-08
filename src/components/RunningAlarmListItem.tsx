import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { Alarm } from "../backend/types";
import { formatDateTime, formatTime } from "../backend/formatUtils";
import useAlarms from "../hooks/useAlarms";
import RenameAction from "./RenameAction";

interface RunningAlarmListItemProps {
  alarm: Alarm;
}

const pendingIcon = { source: Icon.Alarm, tintColor: Color.Yellow };
const pendingLabel = { tag: { value: "Pending", color: Color.Yellow } };
const ringingIcon = { source: Icon.Alarm, tintColor: Color.Green };
const ringingLabel = { tag: { value: "Ringing!", color: Color.Green } };

export default function RunningAlarmListItem({ alarm }: RunningAlarmListItemProps) {
  const { handleStopAlarm } = useAlarms();
  return (
    <List.Item
      icon={alarm.timeLeft === 0 ? ringingIcon : pendingIcon}
      title={alarm.name}
      subtitle={alarm.timeLeft === 0 ? "Ringing" : formatTime(alarm.timeLeft) + " left"}
      accessories={[
        { text: `${alarm.timeLeft === 0 ? "Rang" : "Rings"} at ${formatDateTime(alarm.targetTime)}` },
        alarm.timeLeft === 0 ? ringingLabel : pendingLabel,
      ]}
      actions={
        <ActionPanel>
          <Action
            title="Stop Alarm"
            icon={Icon.Stop}
            shortcut={{
              modifiers: ["ctrl"],
              key: "x",
            }}
            onAction={() => handleStopAlarm(alarm)}
          />
          <RenameAction renameLabel="Alarm" currentName={alarm.name} originalFile={alarm.originalFile} ctID={null} />
        </ActionPanel>
      }
    />
  );
}
