import { Action, ActionPanel, getPreferenceValues, List } from "@raycast/api";
import { playSoundOnce } from "./backend/alertProcess";
import { Preferences } from "./backend/types";
import { soundData } from "./backend/soundData";

export default function Command() {
  const prefs = getPreferenceValues<Preferences>();

  return (
    <List>
      {soundData.map((item, index) => (
        <List.Item
          key={index}
          icon={item.icon}
          title={item.value === prefs.selectedSound ? `${item.title} (currently selected)` : item.title}
          actions={
            <ActionPanel>
              <Action title="Play Sound" onAction={() => playSoundOnce(item.value, "Untitled Timer")} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
