import { Toast, getPreferenceValues, popToRoot, showHUD, showToast } from "@raycast/api";
import { Preferences } from "./types";

const showHudOrToast = (msg: string, launchedFromMenuBar: boolean, isErr: boolean) => {
  const prefs: Preferences = getPreferenceValues();
  if (launchedFromMenuBar || prefs.closeWindowOnTimerStart) {
    const msgEmoji = isErr ? "⚠️" : "🎉";
    showHUD(`${msgEmoji} ${msg}`);
    return popToRoot();
  } else {
    showToast({ style: isErr ? Toast.Style.Failure : Toast.Style.Success, title: msg });
  }
};

export { showHudOrToast };
