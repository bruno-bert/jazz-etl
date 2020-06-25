import {
  IsTask,
  ResultData,
  IsTaskConfiguration,
  IsTaskCacheHandler,
  SourceData,
  IsObserver,
  IsTaskNotification,
  TaskEvent
} from "src/types/core";

import { createUUID } from "@helpers/index";
import { InMemoryTaskCacheHandler } from "./InMemoryTaskCacheHandler";
import { INVALID_SOURCE_TASK_ID } from "@config/Messages";

export abstract class Task implements IsTask {
  id: string;
  description?: string | undefined;
  skip: boolean | undefined;
  inProgress: boolean;
  isAborted: boolean;
  sourceTaskIds?: string[];
  taskCacheHandler: IsTaskCacheHandler;
  subscribers: IsObserver[];

  constructor(taskConfiguration?: IsTaskConfiguration) {
    this.id = taskConfiguration?.id || createUUID();
    this.description = taskConfiguration?.description;

    if (taskConfiguration?.sourceTaskIds)
      this.setSourceTaskIds(taskConfiguration.sourceTaskIds);

    this.taskCacheHandler =
      taskConfiguration?.taskCacheHandler ||
      InMemoryTaskCacheHandler.getInstance();

    this.inProgress = false;
    this.isAborted = false;
    this.skip = false;

    this.subscribers = [];
    this.subscribe(this.taskCacheHandler);
  }

  abstract execute(): Promise<ResultData>;

  getId(): string {
    return this.id;
  }

  abort(): void {
    this.isAborted = true;
    this.notify({ taskId: this.id, taskEvent: TaskEvent.TASK_ABORTED });
  }
  setInProgress(progress: boolean): void {
    this.inProgress = progress;

    if (this.inProgress) {
      this.notify({
        taskId: this.id,
        taskEvent: TaskEvent.TASK_STARTED
      });
    }
  }

  setSkip(_skip: boolean): void {
    this.skip = _skip;
    this.notify({ taskId: this.id, taskEvent: TaskEvent.TASK_SKIPPED });
  }

  notify(notification: IsTaskNotification): void {
    this.subscribers.forEach(subscriber => {
      subscriber.notify(notification);
    });
  }

  subscribe(subscriber: IsObserver): void {
    const index = this.subscribers.findIndex(
      _subscriber => subscriber === subscriber
    );
    if (index === -1) this.subscribers.push(subscriber);
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

  getSourceData(): Promise<SourceData> {
    return this.taskCacheHandler.getSourceData({ taskIds: this.sourceTaskIds });
  }

  save(data: ResultData | null): Promise<ResultData> {
    this.notify({ taskId: this.id, taskEvent: TaskEvent.TASK_SAVED });
    return this.taskCacheHandler.save({ taskId: this.id }, data);
  }

  setError(err: string) {
    this.notify({
      taskId: this.id,
      taskEvent: TaskEvent.TASK_CONCLUDED_WITH_ERROR
    });
  }

  run(): Promise<ResultData> {
    this.setInProgress(true);
    return new Promise<ResultData>((resolve, reject) => {
      if (!this.skip) {
        this.execute()
          .then(result => {
            this.save(result)
              .then(result => {
                this.setInProgress(false);
                resolve(result);
              })
              .catch(err => {
                this.setError(err);
                this.setInProgress(false);
                reject(err);
              });
          })
          .catch(err => {
            this.setError(err);
            this.setInProgress(false);
            reject(err);
          });
      } else {
        this.setInProgress(false);
        resolve(null);
      }
    });
  }
}
