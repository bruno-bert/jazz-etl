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
  IsCacheNotification,
  TaskDependency,
  TaskAppearance,
  CachedMessage,
  TaskProperty,
  IsTaskPropertyHandler
} from "../../types/core";

import { createUUID } from "@helpers/uuid";
import { DefaultTaskCacheHandler } from "../cache/DefaultTaskCacheHandler";
import { INVALID_SOURCE_TASK_ID, INVALID_PROPERTY } from "@config/Messages";
import { DefaultTaskPropertyHandler } from "./DefaultTaskPropertyHandler";

export abstract class Task implements IsTask {
  id: string;
  name?: string | undefined;
  description?: string | undefined;
  appearance?: TaskAppearance;
  skip: boolean;
  status: TaskStatus;
  dependencies?: TaskDependency[];
  taskCacheHandler: IsTaskCacheHandler;
  subscribers: IsTaskObserver[];
  propertyHandler?: IsTaskPropertyHandler;
  properties?: TaskProperty[];

  constructor(taskConfiguration?: IsTaskConfiguration) {
    this.id = taskConfiguration?.id || createUUID();
    this.name = taskConfiguration?.name;
    this.description = taskConfiguration?.description;
    this.appearance = taskConfiguration?.appearance;

    if (taskConfiguration?.dependencies) {
      if (this.isArrayOfStrings(taskConfiguration?.dependencies)) {
        taskConfiguration.dependencies = this.stringToTaskDependency(
          taskConfiguration.dependencies as string[]
        );
      }
      this.setDependencies(taskConfiguration.dependencies as TaskDependency[]);
    } else {
      this.dependencies = [];
    }

    if (taskConfiguration?.properties)
      this.setProperties(taskConfiguration.properties);
    else this.properties = [];

    this.taskCacheHandler =
      taskConfiguration?.taskCacheHandler || new DefaultTaskCacheHandler();

    this.propertyHandler =
      taskConfiguration?.propertyHandler || new DefaultTaskPropertyHandler();

    this.skip = false;
    this.status = TaskStatus.TASK_PENDING;
    this.subscribers = [];
  }

  execute(data: SourceData | SourceData[]): Promise<Payload> {
    return new Promise<Payload>(async (resolve, reject) => {
      // console.log("executing task", this.id);
      resolve(data);
    });
  }

  private stringToTaskDependency(dependencies: string[]) {
    let deps: TaskDependency[] = [];
    dependencies.forEach(depId => {
      deps.push({ taskId: depId });
    });
    return deps;
  }

  private isArrayOfStrings(value: any): boolean {
    if (value instanceof Array) {
      var somethingIsNotString = false;
      value.forEach(function(item) {
        if (typeof item !== "string") {
          somethingIsNotString = true;
        }
      });
      if (!somethingIsNotString && value.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  /** dependencies */
  private existsDependency(dependency: TaskDependency): boolean {
    const exists = this.dependencies?.find(
      taskDependency =>
        taskDependency.taskId === dependency.taskId &&
        taskDependency.property === dependency.property
    );
    return exists != null && exists != undefined;
  }

  private allValidDependency(dependencies: TaskDependency[]): boolean {
    for (let i = 0; i < dependencies.length; i++)
      if (!this.isValidDependency(dependencies[i])) return false;

    return true;
  }

  private isValidDependency(dependency: TaskDependency): boolean {
    const valid = dependency.taskId !== this.id;
    return valid;
  }

  addDependency(dependency: TaskDependency): IsTask {
    if (!this.existsDependency(dependency)) {
      this.dependencies?.push(dependency);
    }
    return this;
  }

  removeDependency(dependency: TaskDependency): IsTask {
    if (this.dependencies) {
      const index = this.dependencies?.indexOf(dependency);
      if (index !== -1) this.dependencies?.splice(index, 1);
    }
    return this;
  }

  setDependencies(dependencies: TaskDependency[]): IsTask {
    if (this.allValidDependency(dependencies)) this.dependencies = dependencies;
    else throw new Error(INVALID_SOURCE_TASK_ID);
    return this;
  }

  /** END - dependencies */

  private isReadyToRun(messagesInCache: CachedMessage[]): boolean {
    if (this.dependencies) {
      for (let i = 0; i < this.dependencies.length; i++) {
        let dep = this.dependencies[i];
        let index = messagesInCache.findIndex(
          message =>
            message.id === dep.taskId &&
            message.property === dep.property &&
            (message.status === CacheStatus.DONE ||
              message.status === CacheStatus.ERROR ||
              message.status === CacheStatus.SKIPPED)
        );

        if (index === -1) return false;
      }
      return true;
    } else {
      return true;
    }
  }

  onNotificationFromCache(notification: IsCacheNotification): void {
    //console.log("onNotificationFromCache", notification);
    if (this.isReadyToRun(notification.messages)) {
      this.taskCacheHandler.unsubscribeFromCache(this);
      this.run().catch(err => {});
    }
  }

  getId(): string {
    return this.id;
  }

  setSkip(_skip: boolean): void {
    this.skip = _skip;
    /** TODO - update cache with property */
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

  /** properties */
  private existsProperty(property: TaskProperty): boolean {
    const exists = this.properties?.find(
      taskProperty => taskProperty.id === property.id
    );
    return exists != null && exists != undefined;
  }

  setProperties(properties: TaskProperty[]): IsTask {
    if (this.propertyHandler?.validate(properties))
      this.properties = properties;
    else throw new Error(INVALID_PROPERTY);
    return this;
  }

  addProperty(property: TaskProperty): IsTask {
    if (!this.existsProperty(property)) {
      this.properties?.push(property);
    }
    return this;
  }

  removeProperty(property: TaskProperty): IsTask {
    if (this.properties) {
      const index = this.properties?.indexOf(property);
      if (index !== -1) this.properties?.splice(index, 1);
    }
    return this;
  }

  /** END -  properties */

  getSourceData(): Promise<SourceData[]> {
    return this.taskCacheHandler.getSourceData({
      dependencies: this.dependencies
    });
  }

  save(data: Payload | null): Promise<Payload[]> {
    let resolvedProperties =
      this.properties && this.propertyHandler
        ? this.propertyHandler.resolveAll(data, this.properties)
        : null;

    return this.taskCacheHandler
      .updateCache(
        { taskId: this.id },
        CacheStatus.DONE,
        data,
        resolvedProperties
      )
      .then(results => {
        return results?.map(result => result?.data || null) || null;
      })
      .catch(err => {
        return err;
      });
  }

  run(): Promise<Payload> {
    return new Promise<Payload>((resolve, reject) => {
      const handleError = (err: string) => {
        this.status = TaskStatus.TASK_CONCLUDED_WITH_ERROR;

        this.notify({
          taskId: this.id,
          taskStatus: this.status,
          message: `Task ${this.id} concluded with error: ${err} `
        });

        /** TODO - update cache with property */
        this.taskCacheHandler
          .updateCache({ taskId: this.id }, CacheStatus.ERROR)
          .then(() => reject(err))
          .catch(err2 => reject(err2));
      };

      const handlePostSave = (payload: Payload, savedCaches: Payload[]) => {
        this.status = TaskStatus.TASK_COMPLETED;
        this.notify({
          taskId: this.id,
          taskStatus: this.status,
          message: `Task ${this.id} Completed`,
          data: payload
        });
        resolve(savedCaches);
      };

      const handleSkip = () => {
        this.status = TaskStatus.TASK_SKIPPED;

        this.notify({
          taskId: this.id,
          taskStatus: this.status,
          message: `Task ${this.id} skipped`
        });

        resolve(null);
      };

      const handleExecute = (data: SourceData | SourceData[]) => {
        this.status = TaskStatus.TASK_STARTED;
        this.notify({
          taskId: this.id,
          taskStatus: this.status,
          message: `Task ${this.id} started`
        });

        this.execute(data)
          .then(payload => {
            this.save(payload)
              .then(savedCaches => {
                handlePostSave(payload, savedCaches);
              })
              .catch(err => handleError(err));
          })
          .catch(err => handleError(err));
      };

      if (this.skip) {
        handleSkip();
      } else {
        this.getSourceData()
          .then(data => handleExecute(data))
          .catch(err => handleError(err));
      }
    });
  }
}
