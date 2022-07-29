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
  const [timers, setTimers] = useState<Timer[]>(getTimers());
  const [customTimers, setCustomTimers] = useState<Record<string, CustomTimer>>(readCustomTimers());

  const handleTimerStop = (timer: Timer) => {
    stopTimer(environment.supportPath + "/" + timer.originalFile);
    setTimers(timers.filter((t) => t.originalFile !== timer.originalFile));
  };

  return (
    <MenuBarExtra icon={Icon.Clock}>
      {timers.map((timer, index) => (
        <MenuBarExtra.Submenu title={timer.name + ": " + formatTime(timer.timeLeft) + " left"} key={index}>
          <MenuBarExtra.Item title="Stop Timer" onAction={() => handleTimerStop(timer)}></MenuBarExtra.Item>
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
      <MenuBarExtra.Item title="Start 5 Minute Timer" onAction={() => startTimer(60 * 5, "5 Minute Timer")} key="5M" />
      <MenuBarExtra.Item
        title="Start 10 Minute Timer"
        onAction={() => startTimer(60 * 10, "10 Minute Timer")}
        key="10M"
      />
      <MenuBarExtra.Item
        title="Start 15 Minute Timer"
        onAction={() => startTimer(60 * 15, "15 Minute Timer")}
        key="15M"
      />
      <MenuBarExtra.Item
        title="Start 30 Minute Timer"
        onAction={() => startTimer(60 * 30, "30 Minute Timer")}
        key="30M"
      />
      <MenuBarExtra.Item
        title="Start 60 Minute Timer"
        onAction={() => startTimer(60 * 60, "60 Minute Timer")}
        key="60M"
      />
      <MenuBarExtra.Item
        title="Start 90 Minute Timer"
        onAction={() => startTimer(60 * 60 * 1.5, "90 Minute Timer")}
        key="90M"
      />
    </MenuBarExtra>
  );
}
