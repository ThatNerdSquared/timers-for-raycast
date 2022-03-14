import { Action, ActionPanel, Form, popToRoot, Toast } from "@raycast/api";
import { renameTimer } from "./timerUtils";

export default function RenameView(props: { currentName: string; timerFile: string }) {
  const handleSubmit = async (newName: string) => {
    await popToRoot();
    await renameTimer(props.timerFile, newName);
    const toast = new Toast({ style: Toast.Style.Success, title: `Timer was renamed to ${newName}!` });
    await toast.show();
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
