import { Action, ActionPanel, Color, environment, Icon, List, MenuBarExtra, useNavigation } from "@raycast/api";
import { time } from "console";
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
  const [timers, setTimers] = useState<Timer[]>([]);
  const [customTimers, setCustomTimers] = useState<Record<string, CustomTimer>>({});

  useEffect(() => {
    setTimers(getTimers());
    setCustomTimers(readCustomTimers());
  }, []);

  function handleTimerStop(timer: Timer) {
    console.log("Clicked stop timer", timer.name);
    stopTimer(environment.supportPath + "/" + timer.originalFile);
    setTimers(timers.filter((t) => t.originalFile !== timer.originalFile));
  }

  function handleTimerStart(seconds: number, name: string) {
    console.log("Clicked on " + name);
    startTimer(seconds, name);
  }

  console.log("Executed");

  return (
    <MenuBarExtra icon={Icon.Clock} isLoading={timers.length == 0}>
      {timers.map((timer, index) => (
        <MenuBarExtra.Submenu title={timer.name + ": " + " left"} key={timer.originalFile}>
          <MenuBarExtra.Item title="Stop Timer" onAction={() => handleTimerStop(timer)} key={"Stop"} />
        </MenuBarExtra.Submenu>
      ))}
      <MenuBarExtra.Separator />
      {Object.keys(customTimers)
        ?.sort((a, b) => {
          return customTimers[a].timeInSeconds - customTimers[b].timeInSeconds;
        })
        .map((ctID) => (
          <MenuBarExtra.Submenu title={customTimers[ctID].name} key={ctID}>
            <MenuBarExtra.Item title="Stop Timer" onAction={() => deleteCustomTimer(ctID)}></MenuBarExtra.Item>
          </MenuBarExtra.Submenu>
        ))}

      <MenuBarExtra.Separator />
      <MenuBarExtra.Item
        title="Start 5 Minute Timer"
        onAction={() => handleTimerStart(60 * 5, "5 Minute Timer")}
        key="5M"
      />
      <MenuBarExtra.Item
        title="Start 10 Minute Timer"
        onAction={() => handleTimerStart(60 * 10, "10 Minute Timer")}
        key="10M"
      />
      <MenuBarExtra.Item
        title="Start 15 Minute Timer"
        onAction={() => handleTimerStart(60 * 15, "15 Minute Timer")}
        key="15M"
      />
      <MenuBarExtra.Item
        title="Start 30 Minute Timer"
        onAction={() => handleTimerStart(60 * 30, "30 Minute Timer")}
        key="30M"
      />
      <MenuBarExtra.Item
        title="Start 60 Minute Timer"
        onAction={() => handleTimerStart(60 * 60, "60 Minute Timer")}
        key="60M"
      />
      <MenuBarExtra.Item
        title="Start 90 Minute Timer"
        onAction={() => handleTimerStart(60 * 60 * 1.5, "90 Minute Timer")}
        key="90M"
      />
    </MenuBarExtra>
  );
}
