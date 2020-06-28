import {
  IsPipeline,
  IsTask,
  IsApplication,
  IsLogger,
  IsTaskCacheHandler,
  ResultData
} from "../types/core";
import { DefaultLogger } from "./DefaultLogger";
import { createUUID } from "@helpers/index";
import { INVALID_APP, NONE_TASKS } from "@config/Messages";
import { DefaultTaskCacheHandler } from "./DefaultTaskCacheHandler";

export class Pipeline implements IsPipeline {
  id: string;
  logger: IsLogger;
  app: IsApplication;
  tasks: IsTask[];
  taskCacheHandler: IsTaskCacheHandler;

  constructor(_id?: string) {
    this.id = _id || createUUID();
  }

  start(): Promise<ResultData> {
    if (!this.app) {
      return new Promise<ResultData>((resolve, reject) => {
        reject(INVALID_APP);
      });
    }

    if (!this.tasks || this.tasks.length === 0) {
      return new Promise<ResultData>((resolve, reject) => {
        reject(NONE_TASKS);
      });
    }

    return this.tasks[0].run();
  }

  getId(): string {
    return this.id;
  }

  setApplication(_app: IsApplication): void {
    this.app = _app;
    this.logger = this.app?.appConfig?.logger || new DefaultLogger();
    this.taskCacheHandler =
      this.app?.getCacher() || new DefaultTaskCacheHandler();

    this.tasks.forEach((task, index) => {
      task.taskCacheHandler = this.taskCacheHandler;
      if (index > 0) task.taskCacheHandler.subscribeOnCache(task);
    });
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
      //newTask.taskCacheHandler = this.taskCacheHandler;
      //newTask.taskCacheHandler.subscribeOnCache(newTask);
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
