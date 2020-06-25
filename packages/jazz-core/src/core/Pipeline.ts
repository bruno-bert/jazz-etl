import {
  IsPipeline,
  IsTask,
  IsApplication,
  IsLogger,
  IsTaskCacheHandler,
  ResultData
} from "src/types/core";
import { DefaultLogger } from "./DefaultLogger";
import { InMemoryTaskCacheHandler } from "./InMemoryTaskCacheHandler";
import { createUUID } from "@helpers/index";
import { INVALID_APP } from "@config/Messages";

export class Pipeline implements IsPipeline {
  id: string;
  logger: IsLogger;
  app: IsApplication;
  tasks: IsTask[];
  taskCacheHandler: IsTaskCacheHandler;

  constructor(_id?: string) {
    this.id = _id || createUUID();
  }

  run(): Promise<ResultData> {
    if (!this.app) {
      return new Promise<ResultData>((resolve, reject) => {
        reject(INVALID_APP);
      });
    }

    return Promise.all(
      this.tasks.map(task => {
        return task.run();
      })
    );
  }

  all(): Promise<ResultData[]> {
    if (!this.app) {
      return new Promise<ResultData[]>((resolve, reject) => {
        reject(INVALID_APP);
      });
    }

    return Promise.all(
      this.tasks.map(task => {
        return task.run();
      })
    );
  }

  getId(): string {
    return this.id;
  }

  setApplication(_app: IsApplication): void {
    this.app = _app;
    this.logger = this.app?.appConfig?.logger || new DefaultLogger();
    this.taskCacheHandler =
      this.app?.getCacher() || InMemoryTaskCacheHandler.getInstance();
  }
  getApplication(): IsApplication {
    return this.app;
  }
  addTask(newTask: IsTask): void {
    if (!this.tasks) {
      this.tasks = [];
    }

    if (
      this.tasks.indexOf(newTask) === -1 &&
      !this.tasks.find(task => task.id === newTask.id)
    ) {
      newTask.taskCacheHandler = this.taskCacheHandler;
      this.tasks.push(newTask);
    }
  }
  getTask(taskId: string): IsTask | null {
    const task = this.tasks.find(task => {
      task.id === taskId;
    });

    if (task) return task;
    else return null;
  }
}
