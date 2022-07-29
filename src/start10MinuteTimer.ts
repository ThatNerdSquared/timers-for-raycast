import { closeMainWindow, showHUD } from "@raycast/api";
import { startTimer } from "./timerUtils";

export default async () => {
  await closeMainWindow();
  startTimer(60 * 10, "10 Minute Timer");
  await showHUD("Timer started for 10 minutes! 🎉");
};
