import { useState } from "react";
import { Alarm } from "../backend/types";
import { getAlarms, startAlarm, stopAlarm } from "../backend/alarmBackend";
import { checkForOverlyLoudAlert } from "../backend/timerBackend";

export default function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(alarms === undefined);

  const refreshAlarms = () => {
    const setOfAlarms: Alarm[] = getAlarms();
    setAlarms(setOfAlarms);
    setIsLoading(false);
  };

  const handleStartAlarm = async (targetTime: Date, alarmName = "Untitled", selectedSound = "default") => {
    if (!checkForOverlyLoudAlert()) return;
    await startAlarm(targetTime, alarmName, selectedSound);
    refreshAlarms();
  };

  const handleStopAlarm = (alarm: Alarm) => {
    setAlarms(alarms?.filter((a: Alarm) => a.originalFile !== alarm.originalFile));
    stopAlarm(alarm.originalFile);
    refreshAlarms();
  };

  return {
    alarms,
    isLoading,
    refreshAlarms,
    handleStartAlarm,
    handleStopAlarm,
  };
}
