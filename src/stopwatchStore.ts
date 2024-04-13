import { Cache, popToRoot, showHUD, getPreferenceValues } from "@raycast/api";
import { randomUUID } from "crypto";
import { secondsBetweenDates } from "./formatUtils";
import { Stopwatch, StopwatchTitle, Preferences } from "./types";

// settings
const SW_DATA = "/raycastStopwatches";
const SW_TITLE = "/raycastStopwatchTitles";

const cache = new Cache();

// Stopwatches

const startStopwatch = async (swTitle: string) => {
  const swStore = getSwStore();
  const newTimer = initStopwatch(swTitle);

  touchStoreTitle(swTitle);

  swStore.push(newTimer);
  setSwStore(swStore);

  await popToRoot();
  await showHUD(`Stopwatch "${swTitle}" started! 🎉`);
};

const processStopwatches = (swStore: Stopwatch[]) => {
  swStore.map((x) => {
    if (x.lastPaused != "----") {
      x.timeElapsed = Math.max(0, secondsBetweenDates({ d1: x.lastPaused, d2: x.timeStarted }) - x.pauseElapsed);
    } else {
      const rawElapsedTime = Math.max(0, secondsBetweenDates({ d2: x.timeStarted }));
      x.timeElapsed = rawElapsedTime - x.pauseElapsed;
    }
  });
  return swStore;
};

const stopStopwatch = (swID: string) => {
  const swStore: Stopwatch[] = getSwStore();
  const swUpdatedStore: Stopwatch[] = swStore.filter((s: Stopwatch) => s.swID !== swID);
  setSwStore(swUpdatedStore);
};

const pauseStopwatch = (swID: string) => {
  const swStore: Stopwatch[] = getSwStore();
  const swUpdatedStore: Stopwatch[] = swStore.map((s) => (s.swID == swID ? { ...s, lastPaused: new Date() } : s));
  setSwStore(swUpdatedStore);
};

const unpauseStopwatch = (swID: string) => {
  const swStore: Stopwatch[] = getSwStore();
  const swUpdatedStore: Stopwatch[] = swStore.map((s) =>
    s.swID == swID
      ? {
        ...s,
        pauseElapsed: s.pauseElapsed + secondsBetweenDates({ d2: s.lastPaused }),
        lastPaused: "----"
      }
      : s
  );
  setSwStore(swUpdatedStore);
};


const getStopwatches = () => {
  const swStore = getSwStore();
  const setOfStopwatches = processStopwatches(swStore);
  setOfStopwatches.sort((a, b) => {
    return a.timeElapsed - b.timeElapsed;
  });

  return setOfStopwatches;
};

const renameStopwatch = (swID: string, swTitle: string) => {
  const swStore = getSwStore();
  const renamedSW = swStore.map((x) => (x.swID == swID ? { ...x, name: swTitle } : x));
  setSwStore(renamedSW);
};

// titles
const getStopwatchesTitles = (limit: number = 10) => {
  return getSwTitleStore().slice(0, limit);
};

const getConcatTitles = (limit: number = 10) => {
  const swPrefTitles = getStopwatchesPreferenceTitles();
  const swStore = getSwTitleStore();

  return swPrefTitles.concat(swStore).slice(0, limit);
};

const addStopwatchesTitles = (nwTitle: string) => {
  const swPrefTitles = getStopwatchesPreferenceTitles();

  // don't add duplicate title of preference
  if (swPrefTitles.find((x) => x.title === nwTitle)) {
    return;
  }

  const swStore = getSwTitleStore();
  swStore.push(initStopwatchTitle(nwTitle));
  setSwTitleStore(swStore);
};


const getStopwatchesPreferenceTitles = () => {
  const settingString = getPreferenceValues<Preferences>().stopwatchesSetting || "";
  return settingString.split(",").map((swt) => initStopwatchTitle(swt));
};

// private

const initStopwatch = (swTitle: string): Stopwatch => {
  return {
    name: swTitle,
    swID: randomUUID(),
    timeStarted: new Date(),
    timeElapsed: -99,
    lastPaused: "----",
    pauseElapsed: 0
  };
};

const initStopwatchTitle = (swTitle: string): StopwatchTitle => {
  swTitle = swTitle.trim();
  return {
    title: swTitle.charAt(0).toUpperCase() + swTitle.slice(1),
    updated: new Date()
  };
};

const getSwTitleStore = () => {
  const cached: string | undefined = cache.get(SW_TITLE);
  const swTitles: StopwatchTitle[] = cached ? JSON.parse(cached) : [];
  return swTitles;
};

const setSwTitleStore = (swTitles: StopwatchTitle[]) => {
  swTitles = swTitles.sort((a: StopwatchTitle, b: StopwatchTitle) => {
    return new Date(b.updated).getTime() - new Date(a.updated).getTime();
  });
  const swStore: string = JSON.stringify(swTitles);
  cache.set(SW_TITLE, swStore);
};

const getSwStore = () => {
  const cached: string | undefined = cache.get(SW_DATA);
  const stopwatches: Stopwatch[] = cached ? JSON.parse(cached) : [];
  return stopwatches;
};

const setSwStore = (stopwatches: Stopwatch[]) => {
  const swStore: string = JSON.stringify(stopwatches);
  cache.set(SW_DATA, swStore);
};


const touchStoreTitle = (swTitle: string) => {
  const swTitleStore = getSwTitleStore();

  const renamedSwTitleStore = swTitleStore.map((x: StopwatchTitle) => (x.title == swTitle ? { ...x, updated: new Date() } : x));

  setSwTitleStore(renamedSwTitleStore);
};

export { getStopwatches, pauseStopwatch, unpauseStopwatch, startStopwatch, stopStopwatch, renameStopwatch, getStopwatchesTitles, addStopwatchesTitles, getStopwatchesPreferenceTitles, getConcatTitles };