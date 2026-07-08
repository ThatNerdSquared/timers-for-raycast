import { environment, getPreferenceValues } from "@raycast/api";
import { exec } from "child_process";
import { randomUUID } from "crypto";
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { extname } from "path";
import { Alarm, RawAlarm, Preferences } from "./types";
import { formatDateTime, secondsBetweenDates } from "./formatUtils";
import { showHudOrToast, showInitialRingContinuouslyWarning } from "./utils";
import { kill } from "process";

const silentFileDeletion = (fp: string) => {
  try {
    unlinkSync(fp);
  } catch (err) {
    if (err instanceof Error && !err.message.includes("ENOENT")) throw err;
  }
};

function buildAlarmCommand(
  masterName: string,
  alarmName: string,
  secondsUntilTarget: number,
  selectedSound: string,
): string {
  const prefs = getPreferenceValues<Preferences>();
  const resolvedSound = selectedSound === "default" ? prefs.selectedSound : selectedSound;
  const selectedSoundPath = `${environment.assetsPath}/${resolvedSound}`;
  const cmdParts = [`sleep ${Math.max(0, Math.round(secondsUntilTarget))}`];
  cmdParts.push(
    `if [ -f "${masterName}" ]; then osascript -e 'display notification "Alarm \\"${alarmName}\\" complete" with title "Ding!"'`,
  );
  const alertSoundString =
    resolvedSound === "speak_timer_name"
      ? `say "${alarmName}"`
      : `afplay "${selectedSoundPath}" --volume ${prefs.volumeSetting.replace(",", ".")}`;
  cmdParts.push(alertSoundString);
  if (prefs.ringContinuously) {
    const dismissFile = `${masterName}`.replace(".alarm", ".dismiss");
    cmdParts.push(`while [ -f "${dismissFile}" ]; do ${alertSoundString}; done`);
  }
  cmdParts.push(`rm "${masterName}"; else echo "Alarm deleted"; fi`);
  return cmdParts.join(" ; ");
}

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
    const dismissFile = fileName.replace(".alarm", ".dismiss");
    writeFileSync(dismissFile, "dismiss");
  }

  const secondsUntilTarget = secondsBetweenDates({ d1: targetTime });
  const cmd = buildAlarmCommand(fileName, alarmName, secondsUntilTarget, selectedSound);

  const process = exec(cmd, (error, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
  });

  const fileContents: RawAlarm = {
    name: alarmName,
    pid: process.pid,
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
  const dismissFile = alarmFilePath.replace(".alarm", ".dismiss");

  try {
    const rawFileContents = readFileSync(alarmFilePath).toString();
    const fileContents: RawAlarm = JSON.parse(rawFileContents);
    if (fileContents.pid) {
      kill(fileContents.pid);
    }
  } catch (err) {
    // If the file can't be read or doesn't exist, we still want to clean up files
  }

  silentFileDeletion(alarmFilePath);
  silentFileDeletion(dismissFile);
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
