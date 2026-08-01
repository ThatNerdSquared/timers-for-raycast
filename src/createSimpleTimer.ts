import { showToast, Toast } from "@raycast/api";
import { parseDurationInput } from "./backend/durationParser";
import { checkForOverlyLoudAlert, startTimer } from "./backend/timerBackend";
import { SimpleTimerArgs } from "./backend/types";

export default async (props: { arguments: SimpleTimerArgs }) => {
  const result = parseDurationInput(props.arguments.duration);
  if ("error" in result) {
    await showToast({ style: Toast.Style.Failure, title: "Invalid duration", message: result.error });
    return;
  }
  if (!checkForOverlyLoudAlert()) return;
  const timerName = props.arguments.name || props.arguments.duration.trim();
  await startTimer({ timeInSeconds: result.timeInSeconds, timerName });
};
