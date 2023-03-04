import { environment, popToRoot, showHUD } from "@raycast/api";
import { execSync } from "child_process";
import { randomUUID } from "crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { extname } from "path";
import { Stopwatch } from "./types";

const SWPATH = environment.supportPath + "/raycast-stopwatches.json";

const ensureSWFileExists = () => {
  if (!existsSync(SWPATH)) {
    writeFileSync(SWPATH, JSON.stringify([]));
  }
};

const initStopwatch = (swName = ""): Stopwatch => {
  return {
    name: swName,
    swID: randomUUID(),
    timeStarted: new Date(),
    timeElapsed: -99,
    lastPaused: null,
    pauseElapsed: 0,
  };
};

const getStopwatches = () => {
  ensureSWFileExists();
  const rawStopwatches: Stopwatch[] = JSON.parse(readFileSync(SWPATH).toString());
  const setOfStopwatches = cleanUpOldStopwatches(rawStopwatches);
  setOfStopwatches.map((x) => {
    x.timeElapsed = Math.max(0, Math.round(new Date().getTime() - new Date(x.timeStarted).getTime()) / 1000);
  });
  setOfStopwatches.sort((a, b) => {
    return a.timeElapsed - b.timeElapsed;
  });
  return setOfStopwatches;
};

const startStopwatch = async (swName = "Untitled") => {
  ensureSWFileExists();
  const swStore: Stopwatch[] = JSON.parse(readFileSync(SWPATH).toString());
  const newTimer = initStopwatch(swName);
  swStore.push(newTimer);
  writeFileSync(SWPATH, JSON.stringify(swStore));

  popToRoot();
  await showHUD(`Stopwatch "${swName}" started! 🎉`);
};

const stopStopwatch = (swToDelete: string) => {
  ensureSWFileExists();
  let swStore: Stopwatch[] = JSON.parse(readFileSync(SWPATH).toString());
  swStore = swStore.filter((s: Stopwatch) => s.swID !== swToDelete);
  writeFileSync(SWPATH, JSON.stringify(swStore));
};

const cleanUpOldStopwatches = (newStore: Stopwatch[]) => {
  const files = readdirSync(environment.supportPath);
  files.forEach((swFile: string) => {
    if (extname(swFile) == ".stopwatch") {
      const stopwatch = initStopwatch(readFileSync(environment.supportPath + "/" + swFile).toString());
      const timeStarted = swFile.replace(/__/g, ":").replace(".stopwatch", "");
      stopwatch.timeStarted = new Date(timeStarted);
      stopwatch.timeElapsed = Math.max(0, Math.round(new Date().getTime() - new Date(timeStarted).getTime()) / 1000);
      execSync(`rm "${environment.supportPath}/${swFile}"`);
      newStore.push(stopwatch);
    }
  });
  writeFileSync(SWPATH, JSON.stringify(newStore));
  return newStore;
};

export { getStopwatches, startStopwatch, stopStopwatch };
