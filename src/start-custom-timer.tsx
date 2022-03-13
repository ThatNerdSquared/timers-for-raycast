import { ActionPanel, closeMainWindow, Form, showHUD, SubmitFormAction } from "@raycast/api";
import { startTimer } from "./timerUtils";
import { Values } from "./types";

export default function Command() {
  const handleSubmit = async (values: Values) => {
    await closeMainWindow();
    const timerName = values.name ? values.name : "Untitled";
    await startTimer(3600 * Number(values.hours) + 60 * Number(values.minutes) + Number(values.seconds), timerName);
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
          <SubmitFormAction title="Start Custom Timer" onSubmit={async (values: Values) => handleSubmit(values)} />
        </ActionPanel>
      }
    >
      <Form.TextField id="hours" title="Hours" placeholder="0" />
      <Form.TextField id="minutes" title="Minutes" placeholder="00" />
      <Form.TextField id="seconds" title="Seconds" placeholder="00" />
      <Form.TextField id="name" title="Name" placeholder="Pour Tea" />
    </Form>
  );
}
