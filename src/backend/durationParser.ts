const SECONDS_PER_UNIT: Record<string, number> = {
  h: 3600,
  m: 60,
  s: 1,
};

const PARSE_ERROR = 'Try "3h 2m 4s", a plain number of minutes like "15", or "until 13:20"';

export type ParsedDuration = { timeInSeconds: number } | { error: string };

export function parseDurationInput(input: string, now: Date = new Date()): ParsedDuration {
  const trimmed = input.trim().toLowerCase();
  if (trimmed === "") {
    return { error: PARSE_ERROR };
  }

  // "until 13", "until 13:20", or colon-less "until 1320" / "until 900"
  const untilMatch = trimmed.match(/^until\s+(?:(\d{1,2})(?::(\d{2}))?|(\d{3,4}))$/);
  if (untilMatch) {
    const compact = untilMatch[3];
    const hour = compact === undefined ? Number(untilMatch[1]) : Number(compact.slice(0, -2));
    const minute = compact === undefined ? Number(untilMatch[2] ?? 0) : Number(compact.slice(-2));
    if (hour > 23 || minute > 59) {
      return { error: `"${input.trim()}" is not a valid time of day` };
    }
    const target = new Date(now);
    target.setHours(hour, minute, 0, 0);
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    return { timeInSeconds: Math.round((target.getTime() - now.getTime()) / 1000) };
  }

  // Plain number without a unit means minutes
  if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
    const timeInSeconds = Math.round(Number(trimmed) * 60);
    return timeInSeconds > 0 ? { timeInSeconds } : { error: PARSE_ERROR };
  }

  const tokenPattern = /(\d+(?:\.\d+)?)\s*(h|m|s)/g;
  const seen = new Set<string>();
  let totalSeconds = 0;
  let consumed = "";
  for (const match of trimmed.matchAll(tokenPattern)) {
    const [token, value, unit] = match;
    if (seen.has(unit)) {
      return { error: `Unit "${unit}" appears more than once` };
    }
    seen.add(unit);
    totalSeconds += Number(value) * SECONDS_PER_UNIT[unit];
    consumed += token;
  }
  // Reject inputs containing anything beyond the matched tokens and whitespace
  if (seen.size === 0 || trimmed.replace(/\s+/g, "") !== consumed.replace(/\s+/g, "")) {
    return { error: PARSE_ERROR };
  }

  const timeInSeconds = Math.round(totalSeconds);
  return timeInSeconds > 0 ? { timeInSeconds } : { error: PARSE_ERROR };
}
