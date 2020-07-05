import {
  IsTask,
  Payload,
  IsTaskConfiguration,
  IsTaskCacheHandler,
  SourceData,
  IsTaskNotification,
  TaskStatus,
  CacheStatus,
  IsTaskObserver,
  IsCacheNotification
} from "../../types/core";

import { createUUID } from "@helpers/index";
import { DefaultTaskCacheHandler } from "../cache/DefaultTaskCacheHandler";
import { INVALID_SOURCE_TASK_ID } from "@config/Messages";

export abstract class Task implements IsTask {
  id: string;
  description?: string | undefined;
  skip: boolean;
  status: TaskStatus;
  dependsOn?: string[];
  taskCacheHandler: IsTaskCacheHandler;
  subscribers: IsTaskObserver[];

  constructor(taskConfiguration?: IsTaskConfiguration) {
    this.id = taskConfiguration?.id || createUUID();
    this.description = taskConfiguration?.description;

    if (taskConfiguration?.dependencies)
      this.setDependencies(taskConfiguration.dependencies);

    this.taskCacheHandler =
      taskConfiguration?.taskCacheHandler || new DefaultTaskCacheHandler();

    this.skip = false;
    this.status = TaskStatus.TASK_PENDING;
    this.subscribers = [];
  }

  abstract execute(): Promise<Payload>;

  private existsDependency(id: string): boolean {
    const exists = this.dependsOn?.find(taskId => taskId === id);
    return exists != null && exists != undefined;
  }

  private allValidDependency(ids: string[]): boolean {
    for (let i = 0; i < ids.length; i++)
      if (!this.isValidDependency(ids[i])) return false;

    return true;
  }

  private isValidDependency(id: string): boolean {
    const valid = id !== this.id;
    return valid;
  }

  private readyToRun(taskIds: string[]): boolean {
    if (this.dependsOn) {
      return this.dependsOn?.every(e => taskIds.includes(e));
    } else {
      return false;
    }
  }

  cacheNotificationArrived(notification: IsCacheNotification): void {
    if (this.readyToRun(notification.taskIds)) {
      this.taskCacheHandler.unsubscribeFromCache(this);
      this.run().catch(err => {});
    }
  }

  getId(): string {
    return this.id;
  }

  setSkip(_skip: boolean): void {
    this.skip = _skip;
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

  setDependencies(ids: string[]) {
    if (this.allValidDependency(ids)) this.dependsOn = ids;
    else throw new Error(INVALID_SOURCE_TASK_ID);
  }

  addDependency(id: string) {
    if (!this.existsDependency(id)) {
      this.dependsOn?.push(id);
    }
  }

  getSourceData(): Promise<SourceData[] | SourceData> {
    return this.taskCacheHandler.getSourceData({ taskIds: this.dependsOn });
  }

  save(data: Payload | null): Promise<Payload> {
    return this.taskCacheHandler
      .updateCache({ taskId: this.id }, CacheStatus.DONE, data)
      .then(result => {
        return result?.data || null;
      })
      .catch(err => {
        return err;
      });
  }

  run(): Promise<Payload> {
    return new Promise<Payload>((resolve, reject) => {
      if (!this.skip) {
        this.status = TaskStatus.TASK_STARTED;
        this.notify({
          taskId: this.id,
          taskStatus: this.status,
          message: `Task ${this.id} started`
        });

        this.taskCacheHandler
          .updateCache({ taskId: this.id }, CacheStatus.PENDING)
          .then(() => {
            this.execute()
              .then(result => {
                this.save(result)
                  .then(result => {
                    this.status = TaskStatus.TASK_COMPLETED;

                    this.notify({
                      taskId: this.id,
                      taskStatus: this.status,
                      message: `Task ${this.id} Completed`,
                      data: result
                    });

                    resolve(result);
                  })
                  .catch(err => {
                    this.status = TaskStatus.TASK_CONCLUDED_WITH_ERROR;

                    this.notify({
                      taskId: this.id,
                      taskStatus: this.status,
                      message: `Task ${this.id} concluded with error: ${err} `
                    });

                    this.taskCacheHandler
                      .updateCache({ taskId: this.id }, CacheStatus.ERROR)
                      .then(() => reject(err))
                      .catch(err2 => reject(err2));
                  });
              })
              .catch(err => {
                this.status = TaskStatus.TASK_CONCLUDED_WITH_ERROR;

                this.notify({
                  taskId: this.id,
                  taskStatus: this.status,
                  message: `Task ${this.id} concluded with error: ${err} `
                });

                this.taskCacheHandler
                  .updateCache({ taskId: this.id }, CacheStatus.ERROR)
                  .then(() => {
                    reject(err);
                  })
                  .catch(err2 => reject(err2));
              });
          })
          .catch(err => {
            this.status = TaskStatus.TASK_CONCLUDED_WITH_ERROR;

            this.notify({
              taskId: this.id,
              taskStatus: this.status,
              message: `Task ${this.id} concluded with error: ${err} `
            });
            reject(err);
          });
      } else {
        this.status = TaskStatus.TASK_SKIPPED;

        this.notify({
          taskId: this.id,
          taskStatus: this.status,
          message: `Task ${this.id} skipped`
        });

        resolve(null);
      }
    });
  }
}
