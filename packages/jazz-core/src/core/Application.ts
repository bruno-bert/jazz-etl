import {
  IsApplication,
  IsLogger,
  IsPipeline,
  ApplicationCallBack,
  LOG_LEVEL,
  IsTaskCacheHandler,
  IsApplicationConfiguration,
  ResultData,
  IsTaskNotification,
  IsApplicationNotification,
  TaskEvent
} from "../types/core";

import { SUCCESS_MESSAGE, EMPTY_PIPELINE } from "@config/Messages";
import { DefaultLogger } from "./DefaultLogger";
import { DefaultTaskCacheHandler } from "./DefaultTaskCacheHandler";

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
        taskEvent: notification.taskEvent,
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
    taskEvent = -1,
    data = {},
    message = "",
    completed = false
  }) {
    const notification: IsApplicationNotification = {
      taskId: taskId,
      taskEvent: taskEvent,
      data: data,
      message: message,
      completed: completed
    };
    return notification;
  }
  start(cb: ApplicationCallBack): void {
    try {
      Application.applicationCallBack = cb;
      if (this.pipelines.length === 0) {
        this.logger.log(EMPTY_PIPELINE, LOG_LEVEL.WARN);
      }
    } catch (err) {
      cb(Application.createNotification({ message: err }));
    }
  }
}
