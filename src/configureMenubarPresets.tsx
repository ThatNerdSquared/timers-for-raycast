import useTimers from "./hooks/useTimers";
import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { readDefaultPresetVisibles, toggleDefaultPresetVisibility } from "./timerUtils";
import { DefaultTimerPreset } from "./types";

export default function Command() {
  const { customTimers, isLoading, refreshTimers, handleToggleCTVisibility } = useTimers();
  const hiddenTag = { tag: { value: "Hidden", color: Color.Red } };
  const visibleTag = { tag: { value: "Visible", color: Color.Green } };
  const [defaultVisibles, setDefaultVisibles] = useState<Record<string, boolean> | undefined>();
  const defaultPresets: DefaultTimerPreset[] = [
    {
      key: "2M",
      title: "2 Minute Timer",
      seconds: 60 * 2,
    },
    {
      key: "5M",
      title: "5 Minute Timer",
      seconds: 60 * 5,
    },
    {
      key: "10M",
      title: "10 Minute Timer",
      seconds: 60 * 10,
    },
    {
      key: "15M",
      title: "15 Minute Timer",
      seconds: 60 * 15,
    },
    {
      key: "30M",
      title: "30 Minute Timer",
      seconds: 60 * 30,
    },
    {
      key: "45M",
      title: "45 Minute Timer",
      seconds: 60 * 45,
    },
    {
      key: "60M",
      title: "60 Minute Timer",
      seconds: 60 * 60,
    },
    {
      key: "90M",
      title: "90 Minute Timer",
      seconds: 60 * 60 * 1.5,
    },
  ];

  useEffect(() => {
    refreshTimers();
    setDefaultVisibles(readDefaultPresetVisibles());
  }, []);

  const handleDefaultPresetToggle = (key: string) => {
    toggleDefaultPresetVisibility(key);
    setDefaultVisibles(readDefaultPresetVisibles());
  };

  return (
    <List isLoading={isLoading && defaultVisibles == undefined}>
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
      <List.Section title={"Default Presets"}>
        {defaultPresets.map((defaultPreset) => (
          <List.Item
            key={defaultPreset.key}
            title={defaultPreset.title}
            icon={Icon.Hourglass}
            accessories={[defaultVisibles?.[defaultPreset.key] ? visibleTag : hiddenTag]}
            actions={
              <ActionPanel>
                <Action
                  title={defaultVisibles?.[defaultPreset.key] ? "Hide In Menu Bar" : "Show In Menu Bar"}
                  onAction={() => handleDefaultPresetToggle(defaultPreset.key)}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
