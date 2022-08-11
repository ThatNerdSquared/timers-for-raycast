import { closeMainWindow, showHUD } from "@raycast/api";
import { startTimer } from "./timerUtils";

export default async () => {
  await closeMainWindow();
  startTimer(60 * 90, "90 Minute Timer");
  await showHUD("Timer started for 90 minutes! 🎉");
};
