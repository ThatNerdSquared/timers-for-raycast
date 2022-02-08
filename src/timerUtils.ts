import { exec } from "child_process";

export default async function startTimer(timeInSeconds: number) {
  const command = `sleep ${timeInSeconds} && afplay /System/Library/Sounds/Submarine.aiff && osascript -e 'display notification "'"Timer complete"'" with title "Ding!"'`;
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
