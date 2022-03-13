import { ActionPanel, environment, Icon, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { getTimers, stopTimer } from "./timerUtils";
import { Timer } from "./types";

export default function Command() {
  const [timers, setTimers] = useState<Timer[]>([]);

  useEffect(() => {
    async function getTimersFromDisk() {
      const setOfTimers: Timer[] = await getTimers();
      setTimers(setOfTimers);
    }
    getTimersFromDisk();
  }, []);

  const handleTimerStop = async (timer: Timer) => {
    await stopTimer(environment.supportPath + "/" + timer.originalFile);
    const newTimers = await getTimers();
    setTimers(newTimers);
  };

  return (
    <List isLoading={timers == []}>
      {timers?.map((timer, index) => (
        <List.Item
          key={index}
          icon={Icon.Clock}
          title={timer.name}
          accessoryTitle={timer.timeLeft.toString()}
          actions={
            <ActionPanel>
              <ActionPanel.Item title="Stop Timer" onAction={() => handleTimerStop(timer)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
