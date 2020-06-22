import {
  IsApplication,
  IsLogger,
  IsPipeline,
  ApplicationCallback,
  LOG_LEVEL
} from "../types/core";

import { SUCCESS_MESSAGE, EMPTY_PIPELINE } from "@config/Messages";
import { DefaultLogger } from "./DefaultLogger";

export class Application implements IsApplication {
  logger: IsLogger;
  pipelines: IsPipeline[];

  constructor(_pipelines?: IsPipeline[], _logger?: IsLogger) {
    this.pipelines = _pipelines || [];
    this.logger = _logger || new DefaultLogger();
  }

  addPipeline(pipeline: IsPipeline) {
    if (this.pipelines.indexOf(pipeline) === -1) {
      pipeline.setApplication(this);
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
