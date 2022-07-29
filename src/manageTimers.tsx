import { Action, ActionPanel, Color, environment, Icon, List, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import RenameView from "./RenameView";
import CustomTimerView from "./startCustomTimer";
import {
  createCustomTimer,
  deleteCustomTimer,
  ensureCTFileExists,
  getTimers,
  readCustomTimers,
  startTimer,
  stopTimer,
  formatTime,
} from "./timerUtils";
import { CustomTimer, Timer } from "./types";

export default function Command() {
  const [timers, setTimers] = useState<Timer[] | undefined>(undefined);
  const [customTimers, setCustomTimers] = useState<Record<string, CustomTimer>>({});
  const { push } = useNavigation();

  useEffect(() => {
    setInterval(() => {
      setTimers(getTimers());
    }, 1000);
  }, []);

  const refreshTimers = () => {
    ensureCTFileExists();
    const setOfTimers: Timer[] = getTimers();
    setTimers(setOfTimers);
    const setOfCustomTimers: Record<string, CustomTimer> = readCustomTimers();
    setCustomTimers(setOfCustomTimers);
  };

  const handleTimerStop = (timer: Timer) => {
    stopTimer(environment.supportPath + "/" + timer.originalFile);
    refreshTimers();
  };

  const handleTimerStart = (customTimer: CustomTimer) => {
    startTimer(customTimer.timeInSeconds, customTimer.name);
    refreshTimers();
  };

  const handleCreateCustom = (timer: Timer) => {
    const customTimer: CustomTimer = {
      name: timer.name,
      timeInSeconds: timer.secondsSet,
    };
    createCustomTimer(customTimer);
    refreshTimers();
  };

  const handleDeleteCustom = (ctID: string) => {
    deleteCustomTimer(ctID);
    refreshTimers();
  };

  return (
    <List isLoading={timers === undefined || customTimers === undefined}>
      <List.Section title={timers?.length !== 0 && timers != null ? "Currently Running" : "No Timers Running"}>
        {timers?.map((timer, index) => (
          <List.Item
            key={index}
            icon={{ source: Icon.Clock, tintColor: Color.Yellow }}
            title={timer.name}
            subtitle={formatTime(timer.timeLeft) + " left"}
            accessoryTitle={formatTime(timer.secondsSet) + " originally"}
            actions={
              <ActionPanel>
                <Action title="Stop Timer" onAction={() => handleTimerStop(timer)} />
                <Action
                  title="Rename Timer"
                  onAction={() =>
                    push(<RenameView currentName={timer.name} timerFile={timer.originalFile} ctID={null} />)
                  }
                />
                <Action
                  title="Save Timer as Preset"
                  shortcut={{
                    modifiers: ["cmd", "shift"],
                    key: "enter",
                  }}
                  onAction={() => handleCreateCustom(timer)}
                />
              </ActionPanel>
            }
          />
        ))}
        <List.Item
          key={0}
          icon={Icon.Clock}
          title={"Create a new timer"}
          subtitle={"Press Enter to start a timer"}
          actions={
            <ActionPanel>
              <Action title="Start Timer" onAction={() => push(<CustomTimerView />)} />
            </ActionPanel>
          }
        />
      </List.Section>
      <List.Section title="Custom Timers">
        {Object.keys(customTimers)
          ?.sort((a, b) => {
            return customTimers[a].timeInSeconds - customTimers[b].timeInSeconds;
          })
          .map((ctID) => (
            <List.Item
              key={ctID}
              icon={Icon.Clock}
              title={customTimers[ctID].name}
              subtitle={formatTime(customTimers[ctID].timeInSeconds)}
              actions={
                <ActionPanel>
                  <Action title="Start Timer" onAction={() => handleTimerStart(customTimers[ctID])} />
                  <Action
                    title="Rename Timer"
                    onAction={() =>
                      push(<RenameView currentName={customTimers[ctID].name} timerFile={"customTimer"} ctID={ctID} />)
                    }
                  />
                  <Action
                    title="Delete Custom Timer"
                    shortcut={{
                      modifiers: ["ctrl"],
                      key: "x",
                    }}
                    onAction={() => handleDeleteCustom(ctID)}
                  />
                </ActionPanel>
              }
            />
          ))}
      </List.Section>
    </List>
  );
}
