import {
  IsApplication,
  IsLogger,
  IsPipeline,
  ApplicationCallback,
  LOG_LEVEL,
  IsTaskCacheHandler,
  IsApplicationConfiguration,
  ResultData
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

  private constructor(appConfig?: IsApplicationConfiguration) {
    this.pipelines = appConfig?.pipelines || [];
    this.logger = appConfig?.logger || new DefaultLogger();
    this.taskCacheHandler =
      appConfig?.taskCacheHandler || new DefaultTaskCacheHandler();
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
  addPipeline(pipeline: IsPipeline) {
    if (this.pipelines.indexOf(pipeline) === -1) {
      pipeline.setApplication(this);
      this.ovewriteCache(pipeline);
      this.pipelines.push(pipeline);
    }
  }

  start(cb: ApplicationCallback): void {
    try {
      if (this.pipelines.length === 0) {
        this.logger.log(EMPTY_PIPELINE, LOG_LEVEL.WARN);
      }

      cb(null, SUCCESS_MESSAGE);
    } catch (err) {
      cb(err, null);
    }
  }
}
