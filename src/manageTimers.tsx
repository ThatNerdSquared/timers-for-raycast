import { Action, ActionPanel, Color, environment, Icon, List, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import CustomTimerView from "./startCustomTimer";
import { createCustomTimer, getTimers, readCustomTimers, startTimer, stopTimer } from "./timerUtils";
import { CustomTimer, Timer } from "./types";

export default function Command() {
  const [timers, setTimers] = useState<Timer[] | null>([]);
  const [customTimers, setCustomTimers] = useState<CustomTimer[]>([]);
  const { push } = useNavigation();

  useEffect(() => {
    (async () => {
      await refreshTimers();
    })();
  }, []);

  const refreshTimers = async () => {
    const setOfTimers: Timer[] = await getTimers();
    if (setOfTimers.length == 0) {
      setTimers(null);
    } else {
      setTimers(setOfTimers);
    }
    const setOfCustomTimers: CustomTimer[] = await readCustomTimers();
    setCustomTimers(setOfCustomTimers);
  };

  const handleTimerStop = async (timer: Timer) => {
    await stopTimer(environment.supportPath + "/" + timer.originalFile);
    await refreshTimers();
  };

  const handleTimerStart = async (customTimer: CustomTimer) => {
    await startTimer(customTimer.timeInSeconds, customTimer.name);
    await refreshTimers();
  };

  const handleCreateCustom = async (timer: Timer) => {
    const customTimer: CustomTimer = {
        "name": timer.name,
        "timeInSeconds": timer.secondsSet
    }
    await createCustomTimer(customTimer)
    await refreshTimers();
  };

  const formatTime = (timeInSeconds: number | string) => {
    const time = new Date(timeInSeconds);
    time.setSeconds(Number(timeInSeconds));
    return time.toISOString().substring(11, 19);
  };

  return (
    <List isLoading={timers == [] || customTimers == []}>
      <List.Section title="Currently Running">
        {timers != null ? (
          timers.map((timer, index) => (
            <List.Item
              key={index}
              icon={{ source: Icon.Clock, tintColor: Color.Yellow }}
              title={timer.name}
              subtitle={formatTime(timer.timeLeft) + " left"}
              accessoryTitle={formatTime(timer.secondsSet) + " originally"}
              actions={
                <ActionPanel>
                  <Action title="Stop Timer" onAction={() => handleTimerStop(timer)} />
                  <Action title="Save Timer as Preset" onAction={() => handleCreateCustom(timer)} />
                </ActionPanel>
              }
            />
          ))
        ) : (
          <List.Item
            key={0}
            icon={Icon.Clock}
            title={"No running timers!"}
            subtitle={"Press Enter to start a timer"}
            actions={
              <ActionPanel>
                <Action title="Start Timer" onAction={() => push(<CustomTimerView />)} />
              </ActionPanel>
            }
          />
        )}
      </List.Section>
      <List.Section title="Custom Timers">
        {customTimers?.map((customTimer, index) => (
          <List.Item
            key={index}
            icon={Icon.Clock}
            title={customTimer.name}
            subtitle={formatTime(customTimer.timeInSeconds)}
            actions={
              <ActionPanel>
                <Action title="Start Timer" onAction={() => handleTimerStart(customTimer)} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
