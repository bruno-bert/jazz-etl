import {
  IsPipeline,
  IsTask,
  IsApplication,
  IsLogger,
  IsTaskCacheHandler,
  PipelineCallBack,
  IsTaskNotification,
  IsTaskObserver,
  IsPipelineNotification,
  Payload,
  TaskStatus
} from "../../types/core";
import { DefaultLogger } from "../logger/DefaultLogger";
import { createUUID } from "@helpers/uuid";
import { INVALID_APP, NONE_TASKS } from "@config/Messages";
import { DefaultTaskCacheHandler } from "../cache/DefaultTaskCacheHandler";
import { timeStamp } from "console";

export class Pipeline implements IsPipeline {
  id: string;
  logger: IsLogger;
  app: IsApplication;
  tasks: IsTask[];
  taskCacheHandler: IsTaskCacheHandler;
  pipelineCallBack: PipelineCallBack;
  subscribers: IsTaskObserver[];
  completed: boolean;

  constructor(_id?: string) {
    this.id = _id || createUUID();
    this.subscribers = [];
    this.completed = false;
  }

  setCompleted(completed: boolean): void {
    this.completed = completed;
  }
  isCompleted() {
    return this.completed;
  }
  subscribe(observer: IsTaskObserver): void {
    const index = this.subscribers.findIndex(
      _subscriber => _subscriber === observer
    );
    if (index === -1) this.subscribers.push(observer);
  }

  checkCompleteness() {
    const pendingOrNotCompletedTasks = this.tasks.filter(task => {
      return (
        task.status === TaskStatus.TASK_PENDING ||
        task.status === TaskStatus.TASK_STARTED
      );
    });

    const thereArePendingTasks = pendingOrNotCompletedTasks.length > 0;
    return !thereArePendingTasks;
  }

  notify(notification: IsTaskNotification): void {
    const completed = this.checkCompleteness();
    this.setCompleted(completed);

    if (this.pipelineCallBack) {
      if (
        this.completed ||
        notification.taskStatus === TaskStatus.TASK_CONCLUDED_WITH_ERROR
      ) {
        this.pipelineCallBack(
          this.createNotification({
            taskId: notification.taskId,
            taskStatus: notification.taskStatus,
            data: notification.data || {},
            message: notification.message,
            completed: this.completed
          })
        );

        this.subscribers.forEach(subscriber => {
          subscriber.notify(notification);
        });
      }
    }
  }

  start(cb?: PipelineCallBack): Promise<Payload> {
    if (!this.app) {
      return new Promise<Payload>((resolve, reject) => {
        reject(INVALID_APP);
      });
    }

    if (!this.tasks || this.tasks.length === 0) {
      return new Promise<Payload>((resolve, reject) => {
        reject(NONE_TASKS);
      });
    }

    if (typeof cb === "function") this.pipelineCallBack = cb;
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

      /** subscribes each task as observer from the cache handler */
      if (index > 0) task.taskCacheHandler.subscribeOnCache(task);

      /** subscribes the pipeline as observer of each task */
      task.subscribe(this);
    });
  }

  getApplication(): IsApplication {
    return this.app;
  }
  addTask(newTask: IsTask): IsPipeline {
    if (!this.tasks) {
      this.tasks = [];
    }

    if (
      this.tasks.indexOf(newTask) === -1 &&
      !this.tasks.find(task => task.id === newTask.id)
    ) {
      this.tasks.push(newTask);
    }
    return this;
  }
  getTask(taskId: string): IsTask | null {
    const task = this.tasks.find(task => {
      task.id === taskId;
    });

    if (task) return task;
    else return null;
  }

  createNotification({
    taskId = "",
    taskStatus = TaskStatus.TASK_PENDING,
    data = {},
    message = "",
    completed = false
  }) {
    const notification: IsPipelineNotification = {
      taskId: taskId,
      taskStatus: taskStatus,
      data: data,
      message: message,
      completed: completed
    };
    return notification;
  }
}
