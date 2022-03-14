import { environment } from "@raycast/api";
import { exec, execSync } from "child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { extname } from "path";
import { CustomTimer, Timer } from "./types";

async function startTimer(timeInSeconds: number, timerName = "Untitled") {
  const fileName = environment.supportPath + "/" + new Date().toISOString() + "---" + timeInSeconds + ".timer";
  const masterName = fileName.replace(/:/g, "__");
  writeFileSync(masterName, timerName);
  const command = `sleep ${timeInSeconds} && if [ -f "${masterName}" ]; then afplay /System/Library/Sounds/Submarine.aiff && osascript -e 'display notification "'"Timer complete"'" with title "Ding!"' && rm "${masterName}"; else echo "Timer deleted"; fi`;
  exec(command, (error, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
  });
}

async function stopTimer(timerFile: string) {
  const command = `if [ -f "${timerFile}" ]; then rm "${timerFile}"; else echo "Timer deleted"; fi`;
  execSync(command);
}

async function getTimers() {
  const setOfTimers: Timer[] = [];
  const files = readdirSync(environment.supportPath);
  files.forEach((timerFile: string) => {
    if (extname(timerFile) == ".timer") {
      const timer: Timer = {
        name: "",
        secondsSet: -99,
        timeLeft: -99,
        originalFile: timerFile,
      };
      timer.name = readFileSync(environment.supportPath + "/" + timerFile).toString();
      const timerFileParts = timerFile.split("---");
      timer.secondsSet = Number(timerFileParts[1].split(".")[0]);
      const timeStarted = timerFileParts[0].replace(/__/g, ":");
      timer.timeLeft = Math.round(timer.secondsSet - (new Date().getTime() - new Date(timeStarted).getTime()) / 1000);
      setOfTimers.push(timer);
    }
  });
  return setOfTimers;
}

async function createCustomTimer(newTimer: CustomTimer) {
  const dataPath = environment.supportPath + "/customTimers.json";
  console.log(dataPath);
  if (!existsSync(dataPath)) {
    writeFileSync(dataPath, JSON.stringify([]));
  }
  const customTimers = JSON.parse(readFileSync(dataPath).toString());
  customTimers.push(newTimer);
  writeFileSync(dataPath, JSON.stringify(customTimers));
}

async function readCustomTimers() {
  const dataPath = environment.supportPath + "/customTimers.json";
  if (!existsSync(dataPath)) {
    writeFileSync(dataPath, JSON.stringify([]));
    return [];
  } else {
    const customTimers = JSON.parse(readFileSync(dataPath).toString());
    return customTimers;
  }
}

export { createCustomTimer, getTimers, readCustomTimers, startTimer, stopTimer };
