import { environment, getPreferenceValues } from "@raycast/api";
import { randomUUID } from "crypto";
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { extname } from "path";
import { CustomTimer, Preferences, RawTimer, Timer, TimerLaunchConfig } from "./types";
import { formatTime, secondsBetweenDates } from "./formatUtils";
import { showHudOrToast, showInitialRingContinuouslyWarning } from "./utils";
import { kill } from "process";
import { launchAlert } from "./alertProcess";

const DATAPATH = environment.supportPath + "/customTimers.json";
const DEFAULT_PRESET_VISIBLES_FILE = environment.supportPath + "/defaultPresetVisibles.json";

const silentFileDeletion = (fp: string) => {
  try {
    unlinkSync(fp);
  } catch (err) {
    // only throw if it's not a "file doesn't exist" error
    if (err instanceof Error && !err.message.includes("ENOENT")) throw err;
  }
};

const checkForOverlyLoudAlert = (launchedFromMenuBar = false) => {
  const prefs = getPreferenceValues<Preferences>();
  if (parseFloat(prefs.volumeSetting) > 5.0) {
    const errorMsg = "Timer alert volume should not be louder than 5 (it can get quite loud!)";
    showHudOrToast({ msg: errorMsg, launchedFromMenuBar: launchedFromMenuBar, isErr: true });
    return false;
  }
  return true;
};

async function startTimer({
  timeInSeconds,
  timerName = "Untitled",
  launchedFromMenuBar = false,
  selectedSound = "default",
  skipRingContinuouslyWarning = false,
}: TimerLaunchConfig) {
  if (!skipRingContinuouslyWarning) {
    if (!(await showInitialRingContinuouslyWarning())) return;
  }
  // only the file name is sanitised, so that drive letters in Windows paths (e.g. "C:") are left alone
  const masterName =
    environment.supportPath + "/" + new Date().toISOString().replace(/:/g, "__") + "---" + timeInSeconds + ".timer";

  const prefs = getPreferenceValues<Preferences>();
  if (prefs.ringContinuously) {
    writeFileSync(dismissFileFor(masterName), ".dismiss file for Timers");
  }

  const pid = launchTimerAlert(masterName, timerName, timeInSeconds, selectedSound);

  const fileContents: RawTimer = {
    name: timerName,
    pid: pid,
    lastPaused: "---",
    pauseElapsed: 0,
    selectedSound: selectedSound === "default" ? prefs.selectedSound : selectedSound,
  };
  writeFileSync(masterName, JSON.stringify(fileContents));
  showHudOrToast({
    msg: `Timer "${timerName}" started for ${formatTime(timeInSeconds)}!`,
    launchedFromMenuBar: launchedFromMenuBar,
    isErr: false,
  });
}

const dismissFileFor = (timerFilePath: string) => timerFilePath.replace(/\.timer$/, ".dismiss");

function launchTimerAlert(masterName: string, timerName: string, timeInSeconds: number, selectedSound: string) {
  const prefs = getPreferenceValues<Preferences>();
  return launchAlert({
    masterFile: masterName,
    dismissFile: prefs.ringContinuously ? dismissFileFor(masterName) : undefined,
    wait: { seconds: timeInSeconds },
    notificationTitle: "Ding!",
    notificationBody: `Timer "${timerName}" complete`,
    sound: selectedSound,
    spokenText: timerName,
  });
}

function stopTimer(timerFile: string) {
  const timerFilePath = environment.supportPath + "/" + timerFile;
  silentFileDeletion(timerFilePath);
  silentFileDeletion(dismissFileFor(timerFilePath));
}

function pauseTimer(timerFile: string, timerPid: number) {
  const timerFilePath = environment.supportPath + "/" + timerFile;
  kill(timerPid);

  const rawFileContents = readFileSync(timerFilePath).toString();
  const fileContents: RawTimer = JSON.parse(rawFileContents);
  fileContents.pid = undefined;
  fileContents.lastPaused = new Date();
  writeFileSync(timerFilePath, JSON.stringify(fileContents));
}

function unpauseTimer(timer: Timer) {
  const timerFilePath = environment.supportPath + "/" + timer.originalFile;

  const pid = launchTimerAlert(timerFilePath, timer.name, timer.timeLeft, timer.selectedSound);

  const rawFileContents = readFileSync(timerFilePath).toString();
  const fileContents: RawTimer = JSON.parse(rawFileContents);
  fileContents.pauseElapsed = fileContents.pauseElapsed + secondsBetweenDates({ d2: timer.lastPaused });
  fileContents.lastPaused = "---";
  fileContents.pid = pid;
  writeFileSync(timerFilePath, JSON.stringify(fileContents));
}

function getTimers() {
  const setOfTimers: Timer[] = [];
  const files = readdirSync(environment.supportPath);
  files.forEach((timerFile: string) => {
    if (extname(timerFile) == ".timer") {
      const timer: Timer = {
        name: "",
        secondsSet: -99,
        timeLeft: -99,
        originalFile: timerFile,
        timeEnds: new Date(),
        pid: undefined,
        lastPaused: "---",
        pauseElapsed: 0,
        selectedSound: "default",
      };
      const rawFileContents = readFileSync(environment.supportPath + "/" + timerFile).toString();
      try {
        const fileContents: RawTimer = JSON.parse(rawFileContents);
        timer.name = fileContents.name;
        timer.pid = fileContents.pid;
        timer.lastPaused = fileContents.lastPaused;
        timer.pauseElapsed = fileContents.pauseElapsed;
        timer.selectedSound = fileContents.selectedSound;
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        timer.name = rawFileContents;
      }

      const timerFileParts = timerFile.split("---");
      timer.secondsSet = Number(timerFileParts[1].split(".")[0]);
      const timeStarted = timerFileParts[0].replace(/__/g, ":");
      timer.timeEnds = new Date(timeStarted);
      timer.timeEnds.setSeconds(timer.timeEnds.getSeconds() + timer.secondsSet + timer.pauseElapsed);
      timer.timeLeft = Math.max(
        0,
        Math.round(
          timer.pid === undefined
            ? timer.secondsSet -
                secondsBetweenDates({
                  d1: timer.lastPaused === "---" ? undefined : timer.lastPaused,
                  d2: new Date(timeStarted),
                }) +
                timer.pauseElapsed
            : secondsBetweenDates({ d1: timer.timeEnds }),
        ),
      );
      setOfTimers.push(timer);
    }
  });
  setOfTimers.sort((a, b) => {
    return a.timeLeft - b.timeLeft;
  });
  return setOfTimers;
}

function renameTimer(timerFile: string, newName: string) {
  const timerFilePath = environment.supportPath + "/" + timerFile;
  const rawFileContents = readFileSync(timerFilePath).toString();
  const fileContents: RawTimer = JSON.parse(rawFileContents);
  fileContents.name = newName;
  writeFileSync(timerFilePath, JSON.stringify(fileContents));
}

function ensureCTFileExists() {
  if (!existsSync(DATAPATH)) {
    writeFileSync(DATAPATH, JSON.stringify({}));
  }
}

function createCustomTimer(newTimer: CustomTimer) {
  ensureCTFileExists();
  const customTimers = JSON.parse(readFileSync(DATAPATH, "utf8"));
  customTimers[randomUUID()] = newTimer;
  writeFileSync(DATAPATH, JSON.stringify(customTimers));
}

function readCustomTimers() {
  ensureCTFileExists();
  const res: Record<string, CustomTimer> = JSON.parse(readFileSync(DATAPATH, "utf8"));
  return Object.fromEntries(
    Object.entries(res).map(([ctID, timer]) =>
      timer.showInMenuBar === undefined ? [ctID, { ...timer, showInMenuBar: true }] : [ctID, timer],
    ),
  );
}

function renameCustomTimer(ctID: string, newName: string) {
  ensureCTFileExists();
  const customTimers = JSON.parse(readFileSync(DATAPATH, "utf8"));
  customTimers[ctID].name = newName;
  writeFileSync(DATAPATH, JSON.stringify(customTimers));
}

function deleteCustomTimer(ctID: string) {
  ensureCTFileExists();
  const customTimers = JSON.parse(readFileSync(DATAPATH, "utf8"));
  delete customTimers[ctID];
  writeFileSync(DATAPATH, JSON.stringify(customTimers));
}

function toggleCustomTimerMenubarVisibility(ctID: string) {
  ensureCTFileExists();
  const customTimers = JSON.parse(readFileSync(DATAPATH, "utf8"));
  const currentVisibility = customTimers[ctID].showInMenuBar;
  customTimers[ctID].showInMenuBar = currentVisibility === undefined ? false : !currentVisibility;
  writeFileSync(DATAPATH, JSON.stringify(customTimers));
}

const readDefaultPresetVisibles = (): Record<string, boolean> => {
  if (!existsSync(DEFAULT_PRESET_VISIBLES_FILE)) {
    const defaultPresetVisibles = {
      "2M": true,
      "5M": true,
      "10M": true,
      "15M": true,
      "30M": true,
      "45M": true,
      "60M": true,
      "90M": true,
    };
    writeFileSync(DEFAULT_PRESET_VISIBLES_FILE, JSON.stringify(defaultPresetVisibles));
    return defaultPresetVisibles;
  }
  const res: Record<string, boolean> = JSON.parse(readFileSync(DEFAULT_PRESET_VISIBLES_FILE, "utf8"));
  return res;
};

const toggleDefaultPresetVisibility = (key: string) => {
  const data: Record<string, boolean> = JSON.parse(readFileSync(DEFAULT_PRESET_VISIBLES_FILE, "utf8"));
  data[key] = !data[key];
  writeFileSync(DEFAULT_PRESET_VISIBLES_FILE, JSON.stringify(data));
};

export {
  checkForOverlyLoudAlert,
  silentFileDeletion,
  createCustomTimer,
  deleteCustomTimer,
  ensureCTFileExists,
  getTimers,
  readCustomTimers,
  renameTimer,
  renameCustomTimer,
  toggleCustomTimerMenubarVisibility,
  startTimer,
  stopTimer,
  pauseTimer,
  unpauseTimer,
  readDefaultPresetVisibles,
  toggleDefaultPresetVisibility,
};
