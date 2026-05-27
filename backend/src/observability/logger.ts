type Level = "debug" | "info" | "warn" | "error";
type Bindings = Record<string, unknown>;

const LEVEL_ORDER: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function configuredMinLevel(): number {
  const raw = (process.env.LOG_LEVEL ?? "info").toLowerCase() as Level;
  return LEVEL_ORDER[raw] ?? LEVEL_ORDER.info;
}

function errReplacer(_k: string, v: unknown) {
  if (v instanceof Error) {
    return {
      name: v.name,
      message: v.message,
      stack: v.stack,
      cause: v.cause,
    };
  }
  return v;
}

class Logger {
  constructor(private readonly bindings: Bindings = {}) {}

  child(b: Bindings): Logger {
    return new Logger({ ...this.bindings, ...b });
  }

  private write(level: Level, payload: Bindings, msg?: string) {
    if (LEVEL_ORDER[level] < configuredMinLevel()) return;
    const record = {
      level,
      time: new Date().toISOString(),
      ...this.bindings,
      ...payload,
      msg,
    };
    const line = JSON.stringify(record, errReplacer);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  }

  debug(payload: Bindings, msg?: string) {
    this.write("debug", payload, msg);
  }
  info(payload: Bindings, msg?: string) {
    this.write("info", payload, msg);
  }
  warn(payload: Bindings, msg?: string) {
    this.write("warn", payload, msg);
  }
  error(payload: Bindings, msg?: string) {
    this.write("error", payload, msg);
  }
}

export const logger = new Logger({ service: "omega-bff" });
export type { Logger };
