import { Icon } from "@raycast/api";

export interface Timer {
  name: string;
  secondsSet: number;
  timeLeft: number;
  originalFile: string;
  timeEnds: Date;
}

export interface Stopwatch {
  name: string;
  swID: string;
  timeStarted: Date;
  timeElapsed: number;
  lastPaused: Date | "----";
  pauseElapsed: number;
}

export interface Values {
  hours: string;
  minutes: string;
  seconds: string;
  name: string;
  willBeSaved: boolean;
  selectedSound: string;
}

export interface CustomTimer {
  name: string;
  timeInSeconds: number;
  selectedSound: string;
  showInMenuBar: boolean;
}

export interface Preferences {
  showMenuBarIconWhen: "never" | "onlyWhenRunning" | "onlyWhenNotRunning" | "always";
  selectedSound: string;
  ringContinuously: boolean;
  copyOnSwStop: boolean;
  closeWindowOnTimerStart: boolean;
  volumeSetting: string;
  showTitleInMenuBar: boolean;
  newTimerInputOrder: string;
}

export interface CTInlineArgs {
  hours: string;
  minutes: string;
  seconds: string;
}

export interface SWInlineArgs {
  name: string;
}

export interface InputField {
  id: keyof CTInlineArgs;
  title: string;
  placeholder: string;
  err: string | undefined;
  drop: () => void;
  validator: (event: RayFormEvent) => void;
}

export interface RayFormEvent {
  target: {
    value?: string | undefined;
  };
}

export interface SoundData {
  title: string;
  icon: Icon;
  value: string;
}

export interface CommandLinkParams {
  timerID: string;
}

export interface DefaultTimerPreset {
  key: string;
  title: string;
  seconds: number;
}

export class TimerLaunchConfig {
  timeInSeconds: number;
  launchedFromMenuBar: boolean;
  timerName: string;
  selectedSound: string;

  constructor(args: { timeInSeconds: number; launchedFromMenuBar: boolean; timerName: string; selectedSound: string }) {
    this.timeInSeconds = args.timeInSeconds;
    this.launchedFromMenuBar = args.launchedFromMenuBar;
    this.timerName = args.timerName;
    this.selectedSound = args.selectedSound;
  }

  static fromDefaults(args: {
    timeInSeconds: number;
    launchedFromMenuBar: boolean;
    timerName?: string;
    selectedSound?: string;
  }) {
    return new TimerLaunchConfig({
      timeInSeconds: args.timeInSeconds,
      launchedFromMenuBar: args.launchedFromMenuBar,
      timerName: args.timerName !== undefined ? args.timerName : "Untitled",
      selectedSound: args.selectedSound !== undefined ? args.selectedSound : "default",
    });
  }
}

export class StopwatchLaunchConfig {
  swName: string;
  launchedFromMenuBar: boolean;

  constructor(args: { swName: string; launchedFromMenuBar: boolean }) {
    this.swName = args.swName;
    this.launchedFromMenuBar = args.launchedFromMenuBar;
  }

  static fromDefaults(args: { launchedFromMenuBar: boolean }) {
    return new StopwatchLaunchConfig({
      swName: "Untitled",
      launchedFromMenuBar: args.launchedFromMenuBar,
    });
  }
}
