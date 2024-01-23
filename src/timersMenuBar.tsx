import { Icon, MenuBarExtra, launchCommand, LaunchType, getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";
import useTimers from "./hooks/useTimers";
import { formatTime } from "./formatUtils";
import { DefaultTimerPreset, Preferences, Timer } from "./types";
import { formatMenuBarIcon, formatMenuBarTitle, shortCircuitMenuBar } from "./menuBarUtils";
import { readDefaultPresetVisibles } from "./timerUtils";

export default function Command() {
  const { timers, customTimers, isLoading, refreshTimers, handleStartTimer, handleStopTimer, handleStartCT } =
    useTimers();
  const defaultPresets: DefaultTimerPreset[] = [
    {
      key: "2M",
      title: "2 Minute Timer",
      seconds: 60 * 2,
    },
    {
      key: "5M",
      title: "5 Minute Timer",
      seconds: 60 * 5,
    },
    {
      key: "10M",
      title: "10 Minute Timer",
      seconds: 60 * 10,
    },
    {
      key: "15M",
      title: "15 Minute Timer",
      seconds: 60 * 15,
    },
    {
      key: "30M",
      title: "30 Minute Timer",
      seconds: 60 * 30,
    },
    {
      key: "45M",
      title: "45 Minute Timer",
      seconds: 60 * 45,
    },
    {
      key: "60M",
      title: "60 Minute Timer",
      seconds: 60 * 60,
    },
    {
      key: "90M",
      title: "90 Minute Timer",
      seconds: 60 * 60 * 1.5,
    },
  ];
  const [defaultVisibles, setDefaultVisibles] = useState<Record<string, boolean> | undefined>();

  useEffect(() => {
    refreshTimers();
    setDefaultVisibles(readDefaultPresetVisibles());
    setInterval(() => {
      refreshTimers();
    }, 1000);
  }, []);

  if (isLoading) {
    refreshTimers();
  }
  const prefs = getPreferenceValues<Preferences>();
  if (shortCircuitMenuBar<Timer>(timers, prefs)) return null;

  return (
    <MenuBarExtra
      icon={formatMenuBarIcon(timers, prefs, Icon.Clock)}
      isLoading={isLoading && defaultVisibles == undefined}
      title={formatMenuBarTitle<Timer>(timers, prefs)}
    >
      <MenuBarExtra.Item title="Click running timer to stop" />
      {timers?.map((timer) => (
        <MenuBarExtra.Item
          title={timer.name + ": " + formatTime(timer.timeLeft) + " left"}
          key={timer.originalFile}
          onAction={() => handleStopTimer(timer)}
        />
      ))}

      <MenuBarExtra.Section>
        {Object.keys(customTimers)
          ?.sort((a, b) => {
            return customTimers[a].timeInSeconds - customTimers[b].timeInSeconds;
          })
          .filter((ctID) => customTimers[ctID].showInMenuBar)
          .map((ctID) => (
            <MenuBarExtra.Item
              title={'Start "' + customTimers[ctID].name + '"'}
              key={ctID}
              onAction={() => handleStartCT(customTimers[ctID], true)}
            />
          ))}
      </MenuBarExtra.Section>

      <MenuBarExtra.Section>
        {defaultPresets
          .filter((preset) => defaultVisibles?.[preset.key])
          .map((defaultPreset) => (
            <MenuBarExtra.Item
              key={defaultPreset.key}
              title={`Start ${defaultPreset.title}`}
              onAction={() => handleStartTimer(defaultPreset.seconds, defaultPreset.title, true)}
            />
          ))}
      </MenuBarExtra.Section>

      <MenuBarExtra.Section title="Custom Timer">
        <MenuBarExtra.Item
          title="Start Custom Timer"
          onAction={async () => await launchCommand({ name: "startCustomTimer", type: LaunchType.UserInitiated })}
          key="custom"
        />
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
