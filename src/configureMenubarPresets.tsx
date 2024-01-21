import useTimers from "./hooks/useTimers";
import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { useEffect } from "react";

export default function Command() {
  const { customTimers, isLoading, refreshTimers, handleToggleCTVisibility } = useTimers();
  const hiddenTag = { tag: { value: "Hidden", color: Color.Red } };
  const visibleTag = { tag: { value: "Visible", color: Color.Green } };

  useEffect(() => {
    refreshTimers();
  }, []);

  return (
    <List isLoading={isLoading}>
      <List.Section title={"Custom Presets"}>
        {Object.keys(customTimers).map((ctID) => (
          <List.Item
            key={ctID}
            title={customTimers[ctID].name}
            icon={Icon.Clock}
            accessories={[customTimers[ctID].showInMenuBar ? visibleTag : hiddenTag]}
            actions={
              <ActionPanel>
                <Action
                  title={customTimers[ctID].showInMenuBar ? "Hide In Menu Bar" : "Show In Menu Bar"}
                  onAction={() => handleToggleCTVisibility(ctID)}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
