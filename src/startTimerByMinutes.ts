import { checkForOverlyLoudAlert, startTimer } from "./backend/timerBackend";

export default async (props: { arguments: { value: number } }) => {
  if (!checkForOverlyLoudAlert()) return;
  const value = props.arguments.value;
  await startTimer({ timeInSeconds: value * 60, timerName: `${value} Minute${value >= 2 ? 's' : ''} Timer` });
};
