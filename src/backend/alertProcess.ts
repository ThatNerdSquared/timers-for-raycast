import { environment, getPreferenceValues } from "@raycast/api";
import { exec, execFileSync, spawn } from "child_process";
import { Preferences } from "./types";

const isWindows = process.platform === "win32";

interface AlertConfig {
  // the alert only fires if this file still exists, and it is deleted once the alert is done
  masterFile: string;
  // when given, the alert sound repeats for as long as this file exists
  dismissFile?: string;
  // wait for a number of seconds (timers) or until a wall-clock time (alarms)
  wait: { seconds: number } | { until: Date };
  notificationTitle: string;
  notificationBody: string;
  // asset file name, or "speak_timer_name"
  sound: string;
  spokenText: string;
}

const resolveSound = (sound: string) => {
  const prefs = getPreferenceValues<Preferences>();
  return sound === "default" ? prefs.selectedSound : sound;
};

const volume = () => getPreferenceValues<Preferences>().volumeSetting.replace(",", ".");

// ---------- macOS ----------

const shQuote = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;
const appleScriptQuote = (s: string) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

const macSoundCommand = (sound: string, spokenText: string) =>
  sound === "speak_timer_name"
    ? `say ${shQuote(spokenText)}`
    : `afplay ${shQuote(environment.assetsPath + "/" + sound)} --volume ${volume()}`;

const buildMacCommand = (cfg: AlertConfig) => {
  const sound = resolveSound(cfg.sound);
  const cmdParts = [
    "seconds" in cfg.wait
      ? `sleep ${Math.max(0, Math.round(cfg.wait.seconds))}`
      : `while [ $(date +%s) -lt ${Math.floor(cfg.wait.until.getTime() / 1000)} ]; do sleep 1; done`,
  ];
  const notification = `display notification ${appleScriptQuote(cfg.notificationBody)} with title ${appleScriptQuote(
    cfg.notificationTitle,
  )}`;
  cmdParts.push(`if [ -f ${shQuote(cfg.masterFile)} ]; then osascript -e ${shQuote(notification)}`);
  const alertSoundString = macSoundCommand(sound, cfg.spokenText);
  cmdParts.push(alertSoundString);
  if (cfg.dismissFile) {
    cmdParts.push(`while [ -f ${shQuote(cfg.dismissFile)} ]; do ${alertSoundString}; done`);
  }
  cmdParts.push(`rm ${shQuote(cfg.masterFile)}; else echo "Alert cancelled"; fi`);
  return cmdParts.join(" ; ");
};

// ---------- Windows ----------

const psQuote = (s: string) => `'${s.replace(/'/g, "''")}'`;
const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

// Uses Windows PowerShell's registered AppUserModelID so toasts work without any extra setup.
const WINDOWS_TOAST_APP_ID = "{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe";

const psSoundSetup = (sound: string, spokenText: string) => {
  if (sound === "speak_timer_name") {
    return [
      "Add-Type -AssemblyName System.Speech",
      "$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer",
      `function Play-Alert { $synth.Speak(${psQuote(spokenText)}) }`,
    ];
  }
  // MediaPlayer (unlike SoundPlayer) supports volume, which is capped at 1.0 on Windows
  const vol = Math.min(1, Math.max(0, parseFloat(volume()) || 1));
  return [
    "Add-Type -AssemblyName PresentationCore",
    "$player = New-Object System.Windows.Media.MediaPlayer",
    `$player.Volume = ${vol}`,
    "function Play-Alert {",
    `  $player.Open([Uri]${psQuote(environment.assetsPath + "\\" + sound)})`,
    "  $i = 0; while (-not $player.NaturalDuration.HasTimeSpan -and $i -lt 50) { Start-Sleep -Milliseconds 100; $i++ }",
    "  $player.Play()",
    "  $ms = 3000; if ($player.NaturalDuration.HasTimeSpan) { $ms = $player.NaturalDuration.TimeSpan.TotalMilliseconds }",
    "  Start-Sleep -Milliseconds ([int]$ms + 150)",
    "  $player.Close()",
    "}",
  ];
};

const buildWindowsScript = (cfg: AlertConfig) => {
  const sound = resolveSound(cfg.sound);
  const toastXml =
    "<toast><visual><binding template='ToastGeneric'>" +
    `<text>${xmlEscape(cfg.notificationTitle)}</text><text>${xmlEscape(cfg.notificationBody)}</text>` +
    "</binding></visual><audio silent='true'/></toast>";
  return [
    "$ErrorActionPreference = 'SilentlyContinue'",
    `$master = ${psQuote(cfg.masterFile)}`,
    `$dismiss = ${psQuote(cfg.dismissFile ?? "")}`,
    "seconds" in cfg.wait
      ? `Start-Sleep -Seconds ${Math.max(0, Math.round(cfg.wait.seconds))}`
      : `$end = [DateTimeOffset]::FromUnixTimeMilliseconds(${cfg.wait.until.getTime()}); ` +
        "while ([DateTimeOffset]::UtcNow -lt $end) { Start-Sleep -Milliseconds 500 }",
    "if (-not (Test-Path -LiteralPath $master)) { exit }",
    "try {",
    "  [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null",
    "  [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] > $null",
    "  $xml = New-Object Windows.Data.Xml.Dom.XmlDocument",
    `  $xml.LoadXml(${psQuote(toastXml)})`,
    `  [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier(${psQuote(
      WINDOWS_TOAST_APP_ID,
    )}).Show([Windows.UI.Notifications.ToastNotification]::new($xml))`,
    "} catch {}",
    ...psSoundSetup(sound, cfg.spokenText),
    "Play-Alert",
    "while ($dismiss -and (Test-Path -LiteralPath $dismiss)) { Play-Alert }",
    "Remove-Item -LiteralPath $master -Force",
  ].join("\n");
};

const powerShellArgs = (script: string) => [
  "-NoProfile",
  "-NonInteractive",
  "-WindowStyle",
  "Hidden",
  "-EncodedCommand",
  Buffer.from(script, "utf16le").toString("base64"),
];

const spawnPowerShell = (script: string) => {
  const child = spawn("powershell.exe", powerShellArgs(script), { stdio: "ignore", windowsHide: true });
  child.on("error", (error) => console.log(`error: ${error.message}`));
  child.unref();
  return child.pid;
};

// Child processes are killed together with the command that started them on Windows (it runs in a job
// object), so a timer would die as soon as e.g. "Start 5 Minute Timer" finished. Creating the process
// through WMI starts it outside of that job, so that it keeps running like it does on macOS.
const launchIndependentPowerShell = (script: string) => {
  const launcher =
    "$r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $env:TIMERS_ALERT_CMD }; " +
    "if ($r.ReturnValue -ne 0) { exit 1 }; [Console]::Out.Write($r.ProcessId)";
  try {
    const pid = execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", launcher], {
      env: { ...process.env, TIMERS_ALERT_CMD: ["powershell.exe", ...powerShellArgs(script)].join(" ") },
      windowsHide: true,
    });
    return Number(pid.toString().trim());
  } catch (error) {
    console.log(`error: ${error instanceof Error ? error.message : error}`);
    return spawnPowerShell(script);
  }
};

// ---------- shared ----------

const logExecResult = (error: Error | null, stderr: string) => {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
  }
};

/**
 * Launches a background process that waits, shows a notification and plays the alert sound.
 * Returns the PID of the process so that it can be killed (e.g. when pausing a timer).
 */
const launchAlert = (cfg: AlertConfig): number | undefined => {
  if (isWindows) return launchIndependentPowerShell(buildWindowsScript(cfg));
  return exec(buildMacCommand(cfg), (error, _stdout, stderr) => logExecResult(error, stderr)).pid;
};

const playSoundOnce = (sound: string, spokenText: string) => {
  if (isWindows) {
    spawnPowerShell([...psSoundSetup(sound, spokenText), "Play-Alert"].join("\n"));
    return;
  }
  exec(macSoundCommand(sound, spokenText), (error, _stdout, stderr) => logExecResult(error, stderr));
};

export { type AlertConfig, isWindows, launchAlert, playSoundOnce };
