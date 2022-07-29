import { closeMainWindow, showHUD } from "@raycast/api";
import { startTimer } from "./timerUtils";

export default async () => {
  await closeMainWindow();
  startTimer(60 * 60, "1 Hour Timer");
  await showHUD("Timer started for 60 minutes! 🎉");
};
