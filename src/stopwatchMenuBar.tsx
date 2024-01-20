import { Icon, MenuBarExtra, getPreferenceValues } from "@raycast/api";
import { useEffect } from "react";
import useStopwatches from "./hooks/useStopwatches";
import { formatTime } from "./formatUtils";
import { Preferences, Stopwatch } from "./types";

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
  if (
    (stopwatches == undefined || stopwatches.length == 0 || stopwatches.length == undefined) &&
    !["always", "onlyWhenNotRunning"].includes(prefs.showMenuBarItemWhen)
  ) {
    return null;
  }

  const getSWMenuBarTitle = () => {
    if (stopwatches === undefined || stopwatches?.length === 0 || stopwatches.length == undefined) {
      return undefined;
    } else if (prefs.showTitleInMenuBar) {
      return `${stopwatches[0].name}: ~${formatTime(stopwatches[0].timeElapsed)}`;
    } else {
      return `~${formatTime(stopwatches[0].timeElapsed)}`;
    }
  };

  const getSWMenuBarIcon = () => {
    switch (prefs.showMenuBarItemWhen) {
      case "always":
        return Icon.Stopwatch;
      case "never":
        return undefined;
      case "onlyWhenRunning":
        return stopwatches !== undefined && stopwatches?.length > 0 ? Icon.Stopwatch : undefined;
      case "onlyWhenNotRunning":
        return stopwatches === undefined || stopwatches?.length === 0 ? Icon.Stopwatch : undefined;
    }
  };

  const swTitleSuffix = (sw: Stopwatch) => {
    return sw.lastPaused === "----" ? " elapsed" : " (paused)";
  };

  return (
    <MenuBarExtra icon={getSWMenuBarIcon()} isLoading={isLoading} title={getSWMenuBarTitle()}>
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

      <MenuBarExtra.Section>
        <MenuBarExtra.Item title="Start New Stopwatch" onAction={() => handleStartSW()} key="startSW" />
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
