import { Action, ActionPanel, Icon, List, useNavigation } from "@raycast/api";
import { useEffect } from "react";
import useAlarms from "./hooks/useAlarms";
import SetAlarmView from "./setAlarm";
import RunningAlarmListItem from "./components/RunningAlarmListItem";

export default function Command() {
  const { alarms, isLoading, refreshAlarms } = useAlarms();
  const { push } = useNavigation();

  useEffect(() => {
    refreshAlarms();
    setInterval(() => {
      refreshAlarms();
    }, 1000);
  }, []);

  return (
    <List isLoading={isLoading}>
      <List.Section title={alarms?.length !== 0 && alarms != null ? "Active Alarms" : "No Alarms Set"}>
        {alarms?.map((alarm) => <RunningAlarmListItem key={alarm.originalFile} alarm={alarm} />)}
        <List.Item
          key={0}
          icon={Icon.Alarm}
          title={"Set a new alarm"}
          subtitle={"Press Enter to set an alarm"}
          actions={
            <ActionPanel>
              <Action title="Set Alarm" icon={Icon.Alarm} onAction={() => push(<SetAlarmView />)} />
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}
