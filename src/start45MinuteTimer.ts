import { closeMainWindow, showHUD } from "@raycast/api";
import { startTimer } from "./timerUtils";

export default async () => {
  await closeMainWindow();
  startTimer(60 * 45, "45 Minute Timer");
  await showHUD("Timer started for 45 minutes! 🎉");
};
