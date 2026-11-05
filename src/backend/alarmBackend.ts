import { environment, getPreferenceValues } from "@raycast/api";
import { randomUUID } from "crypto";
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { extname } from "path";
import { Alarm, RawAlarm, Preferences } from "./types";
import { formatDateTime, secondsBetweenDates } from "./formatUtils";
import { showHudOrToast, showInitialRingContinuouslyWarning } from "./utils";
import { kill } from "process";
import { launchAlert } from "./alertProcess";

const silentFileDeletion = (fp: string) => {
  try {
    unlinkSync(fp);
  } catch (err) {
    if (err instanceof Error && !err.message.includes("ENOENT")) throw err;
  }
};

const dismissFileFor = (alarmFilePath: string) => alarmFilePath.replace(/\.alarm$/, ".dismiss");

export async function startAlarm(
  targetTime: Date,
  alarmName = "Untitled",
  selectedSound = "default",
  skipRingContinuouslyWarning = false,
) {
  if (!skipRingContinuouslyWarning) {
    if (!(await showInitialRingContinuouslyWarning())) return;
  }

  const formattedTargetStr = targetTime.toISOString().replace(/:/g, "__");
  const fileName = `${environment.supportPath}/${formattedTargetStr}---${randomUUID()}.alarm`;

  const prefs = getPreferenceValues<Preferences>();
  if (prefs.ringContinuously) {
    writeFileSync(dismissFileFor(fileName), "dismiss");
  }

  // waits for the wall-clock time rather than sleeping for a duration, so that the alarm
  // still rings on time if the computer was asleep in between
  const pid = launchAlert({
    masterFile: fileName,
    dismissFile: prefs.ringContinuously ? dismissFileFor(fileName) : undefined,
    wait: { until: targetTime },
    notificationTitle: "Ding!",
    notificationBody: `Alarm "${alarmName}" complete`,
    sound: selectedSound,
    spokenText: alarmName,
  });

  const fileContents: RawAlarm = {
    name: alarmName,
    pid: pid,
    targetTime: targetTime.toISOString(),
    selectedSound: selectedSound === "default" ? prefs.selectedSound : selectedSound,
    timeStarted: new Date().toISOString(),
  };
  writeFileSync(fileName, JSON.stringify(fileContents));

  showHudOrToast({
    msg: `Alarm "${alarmName}" set for ${formatDateTime(targetTime)}!`,
    launchedFromMenuBar: false,
    isErr: false,
  });
}

export function stopAlarm(alarmFile: string) {
  const alarmFilePath = environment.supportPath + "/" + alarmFile;

  try {
    const rawFileContents = readFileSync(alarmFilePath).toString();
    const fileContents: RawAlarm = JSON.parse(rawFileContents);
    if (fileContents.pid) {
      kill(fileContents.pid);
    }
  } catch {
    // If the file can't be read or doesn't exist, we still want to clean up files
  }

  silentFileDeletion(alarmFilePath);
  silentFileDeletion(dismissFileFor(alarmFilePath));
}

export function getAlarms() {
  const setOfAlarms: Alarm[] = [];
  if (!existsSync(environment.supportPath)) {
    return setOfAlarms;
  }
  const files = readdirSync(environment.supportPath);
  files.forEach((alarmFile: string) => {
    if (extname(alarmFile) == ".alarm") {
      const alarmFilePath = environment.supportPath + "/" + alarmFile;
      try {
        const rawFileContents = readFileSync(alarmFilePath).toString();
        const fileContents: RawAlarm = JSON.parse(rawFileContents);
        const targetTime = new Date(fileContents.targetTime);
        const timeStarted = new Date(fileContents.timeStarted);
        const timeLeft = Math.max(0, secondsBetweenDates({ d1: targetTime }));

        const alarm: Alarm = {
          name: fileContents.name,
          timeLeft: timeLeft,
          targetTime: targetTime,
          originalFile: alarmFile,
          pid: fileContents.pid,
          selectedSound: fileContents.selectedSound,
          timeStarted: timeStarted,
        };
        setOfAlarms.push(alarm);
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        // fallback if unparseable
      }
    }
  });
  setOfAlarms.sort((a, b) => {
    return a.targetTime.getTime() - b.targetTime.getTime();
  });
  return setOfAlarms;
}

export function renameAlarm(alarmFile: string, newName: string) {
  const alarmFilePath = environment.supportPath + "/" + alarmFile;
  const rawFileContents = readFileSync(alarmFilePath).toString();
  const fileContents: RawAlarm = JSON.parse(rawFileContents);
  fileContents.name = newName;
  writeFileSync(alarmFilePath, JSON.stringify(fileContents));
}
