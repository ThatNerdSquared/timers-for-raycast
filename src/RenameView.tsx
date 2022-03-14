import { Action, ActionPanel, Form, popToRoot, Toast } from "@raycast/api";
import { readCustomTimers, renameCustomTimer, renameTimer } from "./timerUtils";
import { CustomTimer } from "./types";

export default function RenameView(props: { currentName: string; timerFile: string }) {
  const handleSubmit = async (newName: string) => {
    if (props.timerFile == "customTimer") {
      const customTimers = await readCustomTimers();
      let alreadyTaken = false;
      customTimers.forEach(async (customTimer: CustomTimer) => {
        if (customTimer.name == newName) {
          alreadyTaken = true;
        }
      });
      if (alreadyTaken) {
        const toast = new Toast({ style: Toast.Style.Failure, title: "This name is already taken!" });
        await toast.show();
      } else {
        await popToRoot();
        await renameCustomTimer(props.currentName, newName);
        const toast = new Toast({ style: Toast.Style.Success, title: `Timer was renamed to ${newName}!` });
        await toast.show();
      }
    } else {
      await popToRoot();
      await renameTimer(props.timerFile, newName);
      const toast = new Toast({ style: Toast.Style.Success, title: `Timer was renamed to ${newName}!` });
      await toast.show();
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Rename Timer"
            onSubmit={async (values: { newName: string }) => handleSubmit(values.newName)}
          />
        </ActionPanel>
      }
    >
      <Form.Description title="Current Name" text={`${props.currentName}`} />
      <Form.TextField id="newName" title="New name" placeholder="Pour Tea" />
    </Form>
  );
}
