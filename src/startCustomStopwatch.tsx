import { Action, ActionPanel, closeMainWindow, Form, Toast } from "@raycast/api";
import { addStopwatchesTitles, getConcatTitles, startStopwatch } from "./stopwatchStore";
import { StopwatchCustomValues, SWInlineArgs } from "./types";

export default function CustomStopwatchView(props: { arguments: SWInlineArgs }) {
  const swTitles = getConcatTitles();

  const hasArgs = Object.values(props.arguments).some((x) => x !== "");

  const handleSubmit = (values: StopwatchCustomValues) => {
    const timerName = values.name ? values.name : "";
    const timerDropdownName = values.selectedTitle ? values.selectedTitle : "";

    if (timerName === "" && timerDropdownName === "default") {
      const toast = new Toast({ style: Toast.Style.Failure, title: "Title cannot be empty" });
      toast.show();
      return;
    }

    const title = timerName || timerDropdownName;
    closeMainWindow();
    startStopwatch(title);
    if (values.willBeSaved && timerName !== "") {
      addStopwatchesTitles(timerName);
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Start Custom Timer" onSubmit={(values: StopwatchCustomValues) => handleSubmit(values)} />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="selectedTitle" defaultValue="default" title="Saved titles">
        <Form.Dropdown.Item value="default" title="" />
        {swTitles.map((item, index) => (
          <Form.Dropdown.Item
            key={index}
            title={item.title}
            value={item.title}
          />
        ))}
      </Form.Dropdown>
      <Form.TextField id="name" title="Title" placeholder="Daily meet with Team" autoFocus={hasArgs} />
      <Form.Checkbox id="willBeSaved" label="Save to store" />
    </Form>
  );
}