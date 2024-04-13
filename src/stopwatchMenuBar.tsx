import { Icon, MenuBarExtra, getPreferenceValues, launchCommand, LaunchType } from "@raycast/api";
import { useEffect } from "react";
import useStopwatches from "./hooks/useStopwatches";
import { formatTime } from "./formatUtils";
import { getStopwatchesPreferenceTitles, getStopwatchesTitles } from "./stopwatchStore";
import { Preferences, Stopwatch } from "./types";
import { formatMenuBarIcon, formatMenuBarTitle, shortCircuitMenuBar } from "./menuBarUtils";

export default function Command() {
  const { stopwatches, isLoading, refreshSWes, handlePauseSW, handleStartSW, handleStopSW, handleUnpauseSW } =
    useStopwatches();
  useEffect(() => {
    refreshSWes();
    setInterval(() => {
      refreshSWes();
    }, 1000);
  }, []);

  if (isLoading) {
    refreshSWes();
  }
  const prefs = getPreferenceValues<Preferences>();
  const listStopwatchesTitle = getStopwatchesTitles();
  const listPreferenceTitle = getStopwatchesPreferenceTitles();

  if (shortCircuitMenuBar<Stopwatch>(stopwatches, prefs)) return null;

  const swTitleSuffix = (sw: Stopwatch) => {
    return sw.lastPaused === "----" ? " elapsed" : " (paused)";
  };

  return (
    <MenuBarExtra
      icon={formatMenuBarIcon<Stopwatch>(stopwatches, prefs, Icon.Stopwatch)}
      isLoading={isLoading}
      title={formatMenuBarTitle<Stopwatch>(stopwatches, prefs)}
    >
      <MenuBarExtra.Item title="Click running stopwatch to pause" />
      {stopwatches?.map((sw) => (
        <MenuBarExtra.Item
          title={sw.name + ": " + formatTime(sw.timeElapsed) + swTitleSuffix(sw)}
          key={sw.swID}
          onAction={() => (sw.lastPaused === "----" ? handlePauseSW(sw.swID) : handleUnpauseSW(sw.swID))}
        />
      ))}
      <MenuBarExtra.Section>
        {stopwatches?.map((sw) => (
          <MenuBarExtra.Item title={`Delete "${sw.name}"`} key={sw.swID} onAction={() => handleStopSW(sw)} />
        ))}
      </MenuBarExtra.Section>

      <MenuBarExtra.Section title="Custom Stopwatch">
        <MenuBarExtra.Item
          title="Start Custom Stopwatch"
          onAction={async () => await launchCommand({ name: "startCustomStopwatch", type: LaunchType.UserInitiated })}
          key="custom"
        />
      </MenuBarExtra.Section>

      <MenuBarExtra.Section title="Preference Stopwatch">
        {listPreferenceTitle.map((swTitle) => (
          <MenuBarExtra.Item title={"Start New [" + swTitle.title + "] Stopwatch"} onAction={() => handleStartSW(swTitle.title)} key={"startSW" + swTitle.title} />
        ))}
      </MenuBarExtra.Section>

      <MenuBarExtra.Section title="Last Created Stopwatch">
        {listStopwatchesTitle.map((swTitle) => (
          <MenuBarExtra.Item title={"Start New [" + swTitle.title + "] Stopwatch"} onAction={() => handleStartSW(swTitle.title)} key={"startSW" + swTitle.title} />
        ))}
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
