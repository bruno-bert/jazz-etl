import {
  IsTask,
  ResultData,
  IsTaskConfiguration,
  IsTaskCacheHandler,
  SourceData,
  IsObserver,
  IsTaskNotification,
  TaskEvent,
  CacheStatus,
  IsTaskObserver,
  IsCacheNotification
} from "../types/core";

import { createUUID } from "@helpers/index";
import { DefaultTaskCacheHandler } from "./DefaultTaskCacheHandler";
import { INVALID_SOURCE_TASK_ID } from "@config/Messages";
import _ from "lodash";

export abstract class Task implements IsTask {
  id: string;
  description?: string | undefined;
  skip: boolean | undefined;
  inProgress: boolean;
  completed: boolean;
  isAborted: boolean;
  sourceTaskIds?: string[];
  taskCacheHandler: IsTaskCacheHandler;
  subscribers: IsTaskObserver[];

  constructor(taskConfiguration?: IsTaskConfiguration) {
    this.id = taskConfiguration?.id || createUUID();
    this.description = taskConfiguration?.description;

    if (taskConfiguration?.sourceTaskIds)
      this.setSourceTaskIds(taskConfiguration.sourceTaskIds);

    this.taskCacheHandler =
      taskConfiguration?.taskCacheHandler || new DefaultTaskCacheHandler();

    this.inProgress = false;
    this.isAborted = false;
    this.skip = false;
    this.completed = false;

    this.subscribers = [];
  }
  readyToRun(taskIds: string[]): boolean {
    if (this.sourceTaskIds) {
      const intersection = taskIds.filter(value =>
        this.sourceTaskIds?.includes(value)
      );

      return _.isEqual(intersection, this.sourceTaskIds);
    } else {
      return false;
    }
  }

  cacheNotificationArrived(notification: IsCacheNotification): void {
    if (this.readyToRun(notification.taskIds)) {
      this.taskCacheHandler.unsubscribeFromCache(this);
      this.run();
    }
  }

  abstract execute(): Promise<ResultData>;

  getId(): string {
    return this.id;
  }

  abort(): void {
    this.isAborted = true;
    this.notify({
      taskId: this.id,
      taskEvent: TaskEvent.TASK_ABORTED,
      message: `Task ${this.id} Aborted`
    });
    this.taskCacheHandler.updateCache({ taskId: this.id }, CacheStatus.ABORTED);
  }

  setCompleted(completed: boolean, data?: ResultData): void {
    this.completed = completed;
    if (this.completed) {
      this.notify({
        taskId: this.id,
        taskEvent: TaskEvent.TASK_COMPLETED,
        message: `Task ${this.id} Completed`,
        data: data
      });
    }
  }
  setProgress(progress: boolean): void {
    this.inProgress = progress;

    if (this.inProgress) {
      this.notify({
        taskId: this.id,
        taskEvent: TaskEvent.TASK_STARTED,
        message: `Task ${this.id} started`
      });
    }
  }

  setSkip(_skip: boolean): void {
    this.skip = _skip;
    this.completed = false;
    this.notify({ taskId: this.id, taskEvent: TaskEvent.TASK_SKIPPED });
    this.taskCacheHandler.updateCache({ taskId: this.id }, CacheStatus.SKIPPED);
  }

  notify(notification: IsTaskNotification): void {
    this.subscribers.forEach(subscriber => {
      subscriber.notify(notification);
    });
  }

  subscribe(observer: IsTaskObserver): void {
    const index = this.subscribers.findIndex(
      _subscriber => _subscriber === observer
    );
    if (index === -1) this.subscribers.push(observer);
  }

  private existsSourceTaskId(id: string): boolean {
    const exists = this.sourceTaskIds?.find(taskId => taskId === id);
    return exists != null && exists != undefined;
  }

  private allValidSourceTaskId(ids: string[]): boolean {
    for (let i = 0; i < ids.length; i++)
      if (!this.isValidSourceTaskId(ids[i])) return false;

    return true;
  }

  private isValidSourceTaskId(id: string): boolean {
    const valid = id !== this.id;
    return valid;
  }

  setSourceTaskIds(ids: string[]) {
    if (this.allValidSourceTaskId(ids)) this.sourceTaskIds = ids;
    else throw new Error(INVALID_SOURCE_TASK_ID);
  }

  addSourceTaskId(id: string) {
    if (!this.existsSourceTaskId(id)) {
      this.sourceTaskIds?.push(id);
    }
  }

  getSourceData(): Promise<SourceData[] | SourceData> {
    return this.taskCacheHandler.getSourceData({ taskIds: this.sourceTaskIds });
  }

  save(data: ResultData | null): Promise<ResultData> {
    return this.taskCacheHandler.save({ taskId: this.id }, data);
  }

  notifyError(err: string) {
    this.notify({
      taskId: this.id,
      taskEvent: TaskEvent.TASK_CONCLUDED_WITH_ERROR,
      message: `Task ${this.id} concluded with error: ${err} `
    });
  }

  run(): Promise<ResultData> {
    this.setProgress(true);
    this.setCompleted(false);

    return new Promise<ResultData>((resolve, reject) => {
      if (!this.skip) {
        this.taskCacheHandler
          .updateCache({ taskId: this.id }, CacheStatus.PENDING)
          .then(() => {
            this.execute()
              .then(result => {
                this.save(result)
                  .then(result => {
                    this.setProgress(false);
                    this.setCompleted(true, result);
                    resolve(result);
                  })
                  .catch(err => {
                    this.notifyError(err);
                    this.setProgress(false);
                    this.setCompleted(true);

                    this.taskCacheHandler
                      .updateCache({ taskId: this.id }, CacheStatus.ERROR)
                      .then(() => reject(`Error on Save ${err}`))
                      .catch(err2 =>
                        reject(
                          `Error on Save: ${err}\nError on Update Cache: ${err2}`
                        )
                      );
                  });
              })
              .catch(err => {
                this.notifyError(err);
                this.setProgress(false);
                this.setCompleted(true);
                this.taskCacheHandler
                  .updateCache({ taskId: this.id }, CacheStatus.ERROR)
                  .then(() => reject(`Error on Task Execution: ${err}`))
                  .catch(err2 =>
                    reject(
                      `Error on Task Execution: ${err}\nError on Update Cache: ${err2}`
                    )
                  );
              });
          })
          .catch(err => {
            reject(`Error on trying to update cache to start task run: ${err}`);
          });
      } else {
        this.setProgress(false);
        this.setCompleted(true);
        resolve(null);
      }
    });
  }
}
