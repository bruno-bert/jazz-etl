/* eslint-disable guard-for-in */
/* eslint-disable prefer-rest-params */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
import { IsLogger } from "../types";
import Observable from "./Observable";

export enum LogType {
  WARNING,
  INFO,
  ERROR,
  LOG
}

export class DefaultLogger extends Observable implements IsLogger {
  private static instance: DefaultLogger;
  private showWarn: boolean;
  private showInfo: boolean;
  private showError: boolean;
  private debugMode: boolean;

  private constructor() {
    super();
    this.showWarn = false;
    this.showInfo = false;
    this.showError = true;
    this.debugMode = false;
  }

  setDebugMode(debugMode: boolean) {
    this.debugMode = debugMode;
  }

  static getInstance(): IsLogger {
    if (!DefaultLogger.instance) {
      DefaultLogger.instance = new DefaultLogger();
    }
    return DefaultLogger.instance;
  }

  log(message: string, file?: string) {
    console.log(message);
    this.notify({ type: LogType.LOG, message });
  }
  info(message: string) {
    if (this.showInfo || this.debugMode) {
      console.info(message);
      this.notify({ type: LogType.INFO, message });
    }
  }
  warn(message: string) {
    if (this.showWarn || this.debugMode) {
      console.warn(message);
      this.notify({ type: LogType.WARNING, message });
    }
  }
  error(message: string) {
    if (this.showError || this.debugMode) {
      console.error(message);
      this.notify({ type: LogType.ERROR, message });
    }
  }
}
