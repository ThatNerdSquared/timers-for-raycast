import { Icon } from "@raycast/api";
import { formatTime } from "./formatUtils";
import { Preferences, Stopwatch, Timer } from "./types";

const formatMenuBarTitle = <T extends Timer | Stopwatch>(
  state: T[] | undefined,
  prefs: Preferences,
): string | undefined => {
  if (state === undefined || state?.length === 0 || state.length == undefined) return undefined;

  const firstUnpausedItem = state.find((x) => x.lastPaused === "---" || x.lastPaused == "----") ?? state[0];

  const runTime = "timeLeft" in firstUnpausedItem ? firstUnpausedItem.timeLeft : firstUnpausedItem.timeElapsed;
  if (prefs.showTitleInMenuBar) {
    return `${firstUnpausedItem.name}: ~${formatTime(runTime)}`;
  } else {
    return `~${formatTime(runTime)}`;
  }
};

const formatMenuBarIcon = <T>(state: T[] | undefined, prefs: Preferences, icon: Icon): Icon | undefined => {
  switch (prefs.showMenuBarIconWhen) {
    case "always":
      return icon;
    case "never":
      return undefined;
    case "onlyWhenRunning":
      return state !== undefined && state?.length > 0 ? icon : undefined;
    case "onlyWhenNotRunning":
      return state === undefined || state?.length === 0 ? icon : undefined;
  }
};

export { formatMenuBarTitle, formatMenuBarIcon };
