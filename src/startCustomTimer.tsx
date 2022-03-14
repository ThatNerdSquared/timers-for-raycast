import { Action, ActionPanel, closeMainWindow, Form, popToRoot, showHUD } from "@raycast/api";
import { createCustomTimer, startTimer } from "./timerUtils";
import { Values } from "./types";

export default function CustomTimerView() {
  const handleSubmit = async (values: Values) => {
    await closeMainWindow();
    await popToRoot();
    const timerName = values.name ? values.name : "Untitled";
    const timeInSeconds = 3600 * Number(values.hours) + 60 * Number(values.minutes) + Number(values.seconds)
    await startTimer(timeInSeconds, timerName);
    if (values.willBeSaved) createCustomTimer({"name": values.name, "timeInSeconds": timeInSeconds})
    await showHUD(
      `Timer "${timerName}" started for ${values.hours ? values.hours : 0}h${values.minutes ? values.minutes : 0}m${
        values.seconds ? values.seconds : 0
      }s! 🎉`
    );
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Start Custom Timer" onSubmit={async (values: Values) => handleSubmit(values)} />
        </ActionPanel>
      }
    >
      <Form.TextField id="hours" title="Hours" placeholder="0" />
      <Form.TextField id="minutes" title="Minutes" placeholder="00" />
      <Form.TextField id="seconds" title="Seconds" placeholder="00" />
      <Form.TextField id="name" title="Name" placeholder="Pour Tea" />
      <Form.Checkbox id="willBeSaved" label="Save as preset" />
    </Form>
  );
}


