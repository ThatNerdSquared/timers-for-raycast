import { environment, Icon, MenuBarExtra } from "@raycast/api";
import { useEffect, useState } from "react";
import { deleteCustomTimer, getTimers, readCustomTimers, startTimer, stopTimer, formatTime } from "./timerUtils";
import { CustomTimer, Timer } from "./types";

export default function Command() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [customTimers, setCustomTimers] = useState<Record<string, CustomTimer>>({});
  const [isLoading, setIsLoading] = useState(timers.length === 0);

  useEffect(() => {
    setTimers(getTimers());
    setCustomTimers(readCustomTimers());
    setIsLoading(false);
  }, []);

  function handleTimerStop(timer: Timer) {
    setTimers(timers.filter((t: Timer) => t.originalFile !== timer.originalFile));
    stopTimer(environment.supportPath + "/" + timer.originalFile);
  }

  function handleTimerStart(seconds: number, name: string) {
    startTimer(seconds, name);
  }

  return (
    <MenuBarExtra icon={Icon.Clock} isLoading={isLoading}>
      {timers.map((timer: Timer, index: number) => (
        <MenuBarExtra.Submenu title={timer.name + ": " + formatTime(timer.timeLeft) + " left"} key={timer.originalFile}>
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
