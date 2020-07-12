import { ERROR_SOURCEDATA_NOT_OVERRIDEN } from "@config/Messages";
import {
  IsTaskCacheHandler,
  CachedMessage,
  IsCacheObserver,
  IsTaskCacheHandlerConfiguration,
  IsCacheNotification,
  TargetDataIdentifier,
  CacheStatus,
  Payload,
  SourceDataIdentifier,
  SourceData,
  TaskProperty
} from "../../types/core";
import { reject } from "lodash";

export class DefaultTaskCacheHandler implements IsTaskCacheHandler {
  messages: CachedMessage[];
  subscribers: IsCacheObserver[];
  config: IsTaskCacheHandlerConfiguration;

  constructor() {
    this.messages = [];
    this.subscribers = [];
  }
  unsubscribeFromCache(observer: IsCacheObserver): void {
    const index = this.subscribers.indexOf(observer);
    this.subscribers.splice(index, 1);
  }

  cacheNotify(notification: IsCacheNotification): void {
    this.subscribers.forEach(subscriber => {
      subscriber.onNotificationFromCache(notification);
    });
  }

  subscribeOnCache(subscriber: IsCacheObserver): void {
    this.subscribers.push(subscriber);
  }

  clear(): void {
    this.messages = [];
  }

  private indexInCache(taskId: string, propertyId?: string): number {
    const index = this.messages.findIndex(
      message =>
        message?.id === taskId &&
        (message?.property === propertyId || !propertyId)
    );
    return index;
  }

  updateCacheProperty(
    id: string,
    status: CacheStatus,
    data?: Payload,
    property?: TaskProperty
  ): Promise<CachedMessage> {
    return new Promise<CachedMessage>((resolve, reject) => {
      try {
        let message: CachedMessage;
        message = {
          id: id,
          property: property?.id,
          data: data,
          status: status
        };

        const index = this.indexInCache(id, property?.id);

        if (index === -1) {
          this.messages.push(message);
        } else {
          this.messages[index] = message;
        }

        if (status !== CacheStatus.PENDING) {
          const cacheNotification: IsCacheNotification = {
            messages: this.messages
          };

          this.cacheNotify(cacheNotification);
        }

        resolve(message);
      } catch (err) {
        reject(err);
      }
    });
  }

  updateCache(
    targetDataIdentifier: TargetDataIdentifier,
    status: CacheStatus,
    data?: Payload,
    resolvedProperties?: TaskProperty[]
  ): Promise<CachedMessage[]> {
    const promises: Promise<CachedMessage>[] = [];

    promises.push(
      this.updateCacheProperty(targetDataIdentifier.taskId, status, data)
    );

    if (resolvedProperties) {
      for (let i = 0; i < resolvedProperties?.length; i++) {
        promises.push(
          this.updateCacheProperty(
            targetDataIdentifier.taskId,
            status,
            resolvedProperties[i].value,
            resolvedProperties[i]
          )
        );
      }
    }

    return new Promise<CachedMessage[]>((resolve, reject) => {
      Promise.all(promises)
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  getSourceData(
    sourceDataIdentifier: SourceDataIdentifier
  ): Promise<SourceData[]> {
    return new Promise<SourceData[]>((resolve, reject) => {
      const dependencies = sourceDataIdentifier?.dependencies;
      let sourceDatas: SourceData[] = [];

      if (!dependencies) {
        reject(ERROR_SOURCEDATA_NOT_OVERRIDEN);
        return;
      }

      for (let i = 0; i < dependencies!.length; i++) {
        let fromCache = this.messages.find(
          result =>
            result!.id === dependencies![i].taskId &&
            result!.property === dependencies![i].property
        ) as CachedMessage | null;

        if (!fromCache) {
          continue;
        }

        if (fromCache?.status === CacheStatus.PENDING) {
          continue;
        }

        if (fromCache?.status === CacheStatus.DONE) {
          let source: SourceData = {
            taskId: fromCache.id,
            property: fromCache.property,
            payload: fromCache.data
          };
          sourceDatas.push(source || null);
          continue;
        }

        if (
          fromCache?.status === CacheStatus.ERROR ||
          fromCache?.status === CacheStatus.SKIPPED
        ) {
          reject(`Task ${fromCache.id} skipped or raised error`);
          return;
        }
      }

      resolve(sourceDatas);
    });
  }
}
