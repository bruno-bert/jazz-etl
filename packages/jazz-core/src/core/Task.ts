import { IsTask, ResultData, IsPipeline, LOG_LEVEL } from "src/types/core";
import {
  ERROR_SOURCEDATA_NOT_OVERRIDEN,
  TASK_NOT_FOUND,
  PIPELINE_NOT_FOUND
} from "@config/Messages";

export abstract class Task implements IsTask {
  id: string;
  description?: string | undefined;
  result: ResultData | null;
  skip?: boolean | undefined;
  sourceTaskId?: string;
  pipeline: IsPipeline;

  constructor(_id: string, _description?: string, _sourceTaskId?: string) {
    this.id = _id;
    this.description = _description;
    this.sourceTaskId = _sourceTaskId;
  }

  getPipeline(): IsPipeline {
    return this.pipeline;
  }

  getSourceData(): ResultData {
    if (this.sourceTaskId) {
      if (this.pipeline) {
        const sourceTask = this.pipeline.getTask(this.sourceTaskId);
        if (sourceTask) {
          return sourceTask.getResult();
        } else {
          throw new Error(TASK_NOT_FOUND);
        }
      } else {
        throw new Error(PIPELINE_NOT_FOUND);
      }
    } else {
      throw new Error(ERROR_SOURCEDATA_NOT_OVERRIDEN);
    }
  }
  save(data: ResultData | null): Promise<ResultData> {
    this.result = data;
    return new Promise<ResultData>((resolve, reject) => {
      try {
        resolve(this.result);
      } catch (err) {
        reject(err);
      }
    });
  }

  setSkip(_skip: boolean): void {
    this.skip = _skip;
  }

  getResult(): Promise<ResultData> {
    return new Promise<ResultData>((resolve, reject) => {
      resolve(this.result);
    });
  }

  run(): Promise<ResultData> {
    return new Promise<ResultData>((resolve, reject) => {
      this.execute()
        .then(result => {
          this.save(result)
            .then(result => {
              resolve(result);
            })
            .catch(err => {
              reject(err);
            });
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  abstract execute(): Promise<ResultData>;
}
