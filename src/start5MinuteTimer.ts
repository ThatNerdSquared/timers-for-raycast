import { closeMainWindow, showHUD } from "@raycast/api";
import { startTimer } from "./timerUtils";

export default async () => {
  await closeMainWindow();
  startTimer(60 * 5, "5 Minute Timer");
  await showHUD("Timer started for 5 minutes! 🎉");
};
