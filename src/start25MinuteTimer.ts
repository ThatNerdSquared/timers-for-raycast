import { closeMainWindow, showHUD } from "@raycast/api";
import { startTimer } from "./timerUtils";

export default async () => {
  await closeMainWindow();
  startTimer(60 * 25, "25 Minute Timer");
  await showHUD("Timer started for 25 minutes! 🎉");
};
