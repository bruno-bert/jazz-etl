import { IsPipeline, IsTask, IsApplication, IsLogger } from "src/types/core";
import { DefaultLogger } from "./DefaultLogger";

export class Pipeline implements IsPipeline {
  logger: IsLogger;
  app: IsApplication;
  tasks: IsTask[];

  setApplication(_app: IsApplication): void {
    this.app = _app;
    this.logger = this.app?.logger || new DefaultLogger();
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
      newTask.pipeline = this;
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
