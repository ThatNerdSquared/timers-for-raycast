import { closeMainWindow, getPreferenceValues, showToast, Toast } from "@raycast/api";
import { getAlarms, stopAlarm } from "./backend/alarmBackend";
import { Alarm } from "./backend/types";

export default async () => {
  if (!getPreferenceValues().ringContinuously) {
    return await showToast({
      style: Toast.Style.Failure,
      title: "Ring Continuously setting not enabled!",
    });
  }
  const ringingAlarms = getAlarms().filter((a: Alarm) => a.timeLeft === 0);
  if (ringingAlarms.length === 0) {
    return await showToast({
      style: Toast.Style.Failure,
      title: "No ringing alarms found!",
    });
  }
  await closeMainWindow();
  stopAlarm(ringingAlarms[0].originalFile);
};
