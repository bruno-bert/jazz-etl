import {
  IsTaskCacheHandler,
  ResultData,
  IsTaskCacheHandlerConfiguration,
  SourceData,
  TargetDataIdentifier,
  SourceDataIdentifier,
  CachedResultData,
  CacheStatus,
  IsCacheNotification,
  IsCacheObserver
} from "../types/core";

import { ERROR_SOURCEDATA_NOT_OVERRIDEN } from "@config/Messages";

export class DefaultTaskCacheHandler implements IsTaskCacheHandler {
  results: CachedResultData[];
  subscribers: IsCacheObserver[];
  config: IsTaskCacheHandlerConfiguration;

  constructor() {
    this.results = [];
    this.subscribers = [];
  }
  unsubscribeFromCache(observer: IsCacheObserver): void {
    const index = this.subscribers.indexOf(observer);
    this.subscribers.splice(index, 1);
  }

  cacheNotify(notification: IsCacheNotification): void {
    this.subscribers.forEach(subscriber => {
      subscriber.cacheNotificationArrived(notification);
    });
  }

  subscribeOnCache(subscriber: IsCacheObserver): void {
    this.subscribers.push(subscriber);
  }

  clear(): void {
    this.results = [];
  }

  private indexInCache(targetDataIdentifier: TargetDataIdentifier): number {
    const index = this.results.findIndex(
      result => result?.id === targetDataIdentifier.taskId
    );
    return index;
  }

  updateCache(
    targetDataIdentifier: TargetDataIdentifier,
    status: CacheStatus,
    data?: ResultData
  ): Promise<CachedResultData> {
    return new Promise<CachedResultData>((resolve, reject) => {
      try {
        const cachedResult: CachedResultData = {
          id: targetDataIdentifier.taskId,
          data: data,
          status: status
        };

        const index = this.indexInCache(targetDataIdentifier);

        if (index === -1) {
          this.results.push(cachedResult);
        } else {
          this.results[index] = cachedResult;
        }

        resolve(cachedResult);
      } catch (err) {
        reject(err);
      }
    });
  }

  save(
    targetDataIdentifier: TargetDataIdentifier,
    data?: ResultData
  ): Promise<ResultData> {
    return new Promise<ResultData>((resolve, reject) => {
      try {
        const cachedResult: CachedResultData = {
          id: targetDataIdentifier.taskId,
          data: data,
          status: CacheStatus.DONE
        };

        const index = this.indexInCache(targetDataIdentifier);

        if (index === -1) {
          this.results.push(cachedResult);
        } else {
          this.results[index] = cachedResult;
        }

        const cacheNotification: IsCacheNotification = {
          taskIds: this.results.map(result => {
            return result!.id;
          })
        };

        this.cacheNotify(cacheNotification);
        resolve(cachedResult?.data);
      } catch (err) {
        reject(err);
      }
    });
  }

  getSourceData(
    sourceDataIdentifier: SourceDataIdentifier
  ): Promise<SourceData[] | SourceData> {
    return new Promise<SourceData[] | SourceData>((resolve, reject) => {
      const ids = sourceDataIdentifier?.taskIds;
      let sourceDatas: ResultData[] = [];

      if (!ids) {
        reject(ERROR_SOURCEDATA_NOT_OVERRIDEN);
        return;
      }

      for (let i = 0; i < ids!.length; i++) {
        let fromCache = this.results.find(
          result => result!.id === ids![i]
        ) as CachedResultData | null;

        if (!fromCache) {
          continue;
        }

        if (fromCache?.status === CacheStatus.PENDING) {
          continue;
        }

        if (fromCache?.status === CacheStatus.DONE) {
          sourceDatas.push(fromCache.data || null);
          continue;
        }

        if (
          fromCache?.status === CacheStatus.ABORTED ||
          fromCache?.status === CacheStatus.ERROR ||
          fromCache?.status === CacheStatus.SKIPPED
        ) {
          reject(`Task ${fromCache.id} aborted or skipped or error`);
          return;
        }
      }

      resolve(sourceDatas);
    });
  }
}
