import { EMPTY_PIPELINE } from "@config/Messages";
import { DefaultLogger } from "../logger/DefaultLogger";
import { DefaultTaskCacheHandler } from "../cache/DefaultTaskCacheHandler";
import {
  IsApplication,
  IsLogger,
  IsPipeline,
  IsTaskCacheHandler,
  IsApplicationConfiguration,
  ApplicationCallBack,
  IsTaskNotification,
  IsApplicationNotification,
  TaskStatus
} from "../../types/core";

export class Application implements IsApplication {
  private static instance: IsApplication | null;
  logger: IsLogger;
  pipelines: IsPipeline[];
  taskCacheHandler: IsTaskCacheHandler;
  appConfig?: IsApplicationConfiguration | undefined;
  private static applicationCallBack: ApplicationCallBack;

  private constructor(appConfig?: IsApplicationConfiguration) {
    this.pipelines = appConfig?.pipelines || [];
    this.logger = appConfig?.logger || new DefaultLogger();
    this.taskCacheHandler =
      appConfig?.taskCacheHandler || new DefaultTaskCacheHandler();
  }

  static checkCompleteness(pipelines: IsPipeline[]) {
    const notCompletedPipelines = pipelines.filter(pipeline => {
      pipeline.completed === false;
    });

    const notCompleted = notCompletedPipelines.length > 0;
    return !notCompleted;
  }

  notify(notification: IsTaskNotification): void {
    const completed = Application.checkCompleteness(this.pipelines);
    const appNotification: IsApplicationNotification = Application.createNotification(
      {
        taskId: notification.taskId,
        taskStatus: notification.taskStatus,
        data: notification.data || {},
        message: notification.message,
        completed: completed
      }
    );

    if (Application.applicationCallBack)
      Application.applicationCallBack(appNotification);
  }

  detach(): void {
    Application.instance = null;
  }

  static getInstance(appConfig?: IsApplicationConfiguration): IsApplication {
    if (!Application.instance) {
      Application.instance = new Application(appConfig);
    }
    return Application.instance;
  }

  getCacher(): IsTaskCacheHandler {
    return this.taskCacheHandler;
  }

  private ovewriteCache(pipeline: IsPipeline): void {
    pipeline.tasks.map(
      task => (task.taskCacheHandler = pipeline.taskCacheHandler)
    );
  }
  addPipeline(pipeline: IsPipeline): IsApplication {
    if (this.pipelines.indexOf(pipeline) === -1) {
      pipeline.setApplication(this);
      this.ovewriteCache(pipeline);
      pipeline.subscribe(this);
      this.pipelines.push(pipeline);
    }
    return this;
  }

  static createNotification({
    taskId = "",
    taskStatus = TaskStatus.TASK_PENDING,
    data = {},
    message = "",
    completed = false
  }) {
    const notification: IsApplicationNotification = {
      taskId: taskId,
      taskStatus: taskStatus,
      data: data,
      message: message,
      completed: completed
    };
    return notification;
  }
  start(cb?: ApplicationCallBack): void {
    if (typeof cb === "function") Application.applicationCallBack = cb;
    if (this.pipelines.length === 0) {
      throw new Error(EMPTY_PIPELINE);
    }
  }
}
