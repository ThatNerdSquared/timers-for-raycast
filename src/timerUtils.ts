import { exec } from "child_process";

export default async function startTimer(timeInSeconds: number) {
  exec(`sleep ${timeInSeconds} && afplay /System/Library/Sounds/Submarine.aiff`, (error, stderr) => {
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
