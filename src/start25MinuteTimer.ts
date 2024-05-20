import { closeMainWindow } from "@raycast/api";
import { checkForOverlyLoudAlert, startTimer } from "./timerUtils";

export default async () => {
  if (!checkForOverlyLoudAlert()) return;
  await closeMainWindow();
  startTimer({
    timeInSeconds: 60 * 25,
    timerName: "25 Minute Timer",
  });
};
