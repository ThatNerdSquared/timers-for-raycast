import { environment } from "@raycast/api";
import { exec } from "child_process";
import { writeFileSync } from "fs";

export default async function startTimer(timeInSeconds: number) {
  const notification = "Untitled";
  const fileName = environment.supportPath + "/" + new Date().toISOString() + "---" + timeInSeconds + ".txt";
  console.log(fileName);
  const masterName = fileName.replaceAll(":", "__");
  console.log(masterName);
  writeFileSync(masterName, notification);
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
