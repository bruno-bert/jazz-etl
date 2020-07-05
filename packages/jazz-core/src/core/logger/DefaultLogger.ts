import { IsLogger, LOG_LEVEL } from "../../types/core";

export class DefaultLogger implements IsLogger {
  debug: boolean;

  constructor() {
    this.debug = false;
  }

  setDebug(_debug: boolean): void {
    this.debug = _debug;
  }

  log(message: string, level?: LOG_LEVEL | undefined): void {
    if (!this.debug) return;

    if (level) {
      switch (level) {
        case LOG_LEVEL.INFO:
          console.info(message);
          break;
        case LOG_LEVEL.WARN:
          console.warn(message);
          break;
        case LOG_LEVEL.ERROR:
          console.error(message);
          break;
        default:
          console.log(message);
      }
    } else {
      console.log(message);
    }
  }
}
