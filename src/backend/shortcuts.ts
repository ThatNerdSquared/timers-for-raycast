import { Keyboard } from "@raycast/api";

// Shortcuts using cmd/ctrl are ignored on the other platform unless given per platform.
const shortcuts: Record<"stop" | "savePreset" | "copy" | "restart", Keyboard.Shortcut> = {
  stop: {
    macOS: { modifiers: ["ctrl"], key: "x" },
    Windows: { modifiers: ["ctrl", "shift"], key: "x" },
  },
  savePreset: {
    macOS: { modifiers: ["cmd", "shift"], key: "enter" },
    Windows: { modifiers: ["ctrl", "shift"], key: "enter" },
  },
  copy: {
    macOS: { modifiers: ["cmd"], key: "c" },
    Windows: { modifiers: ["ctrl", "shift"], key: "c" },
  },
  restart: {
    macOS: { modifiers: ["cmd"], key: "r" },
    Windows: { modifiers: ["ctrl"], key: "r" },
  },
};

export { shortcuts };
