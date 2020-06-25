import {
  IsTaskCacheHandler,
  ResultData,
  IsTaskCacheHandlerConfiguration,
  SourceData,
  TargetDataIdentifier,
  SourceDataIdentifier,
  CachedResultData,
  IsTaskNotification,
  TaskEvent,
  CacheStatus
} from "src/types/core";

import {
  ERROR_SOURCEDATA_NOT_OVERRIDEN,
  TASK_NOT_FOUND
} from "@config/Messages";

export class InMemoryTaskCacheHandler implements IsTaskCacheHandler {
  private static instance: IsTaskCacheHandler | null;
  private static results: CachedResultData[];
  config: IsTaskCacheHandlerConfiguration;

  private constructor() {
    InMemoryTaskCacheHandler.results = [];
  }

  notify(notification: IsTaskNotification): void {
    switch (notification.taskEvent) {
      case TaskEvent.TASK_STARTED: {
        this.save({ taskId: notification.taskId }, CacheStatus.PENDING);
        break;
      }
      case TaskEvent.TASK_CONCLUDED_WITH_ERROR: {
        this.save({ taskId: notification.taskId }, CacheStatus.ERROR);
        break;
      }
      case TaskEvent.TASK_ABORTED: {
        this.save({ taskId: notification.taskId }, CacheStatus.ABORTED);
        break;
      }
      case TaskEvent.TASK_SKIPPED: {
        this.save({ taskId: notification.taskId }, CacheStatus.SKIPPED);
        break;
      }
      case TaskEvent.TASK_SAVED: {
        this.save(
          { taskId: notification.taskId },
          CacheStatus.DONE,
          notification.data
        );
        break;
      }

      default: {
        break;
      }
    }
    console.log(notification);
  }

  static clear(): void {
    InMemoryTaskCacheHandler.results = [];
  }

  static detach(): void {
    InMemoryTaskCacheHandler.clear();
    InMemoryTaskCacheHandler.instance = null;
  }

  static getInstance(): IsTaskCacheHandler {
    if (!InMemoryTaskCacheHandler.instance) {
      InMemoryTaskCacheHandler.instance = new InMemoryTaskCacheHandler();
    }
    return InMemoryTaskCacheHandler.instance;
  }

  private static refreshCachedResult(
    targetDataIdentifier: TargetDataIdentifier,
    status: CacheStatus,
    data?: ResultData
  ): CachedResultData {
    return {
      id: targetDataIdentifier.taskId,
      data: data,
      status: status
    };
  }

  /*   private static existsInCache(targetDataIdentifier: TargetDataIdentifier) {
    const exist = InMemoryTaskCacheHandler.results.find(
      result => result?.id === targetDataIdentifier.taskId
    );
    return exist;
  } */

  save(
    targetDataIdentifier: TargetDataIdentifier,
    status: CacheStatus,
    data?: ResultData
  ): Promise<ResultData> {
    return new Promise<ResultData>((resolve, reject) => {
      const cachedResult: CachedResultData = InMemoryTaskCacheHandler.refreshCachedResult(
        targetDataIdentifier,
        status,
        data
      );

      InMemoryTaskCacheHandler.results.push(cachedResult);

      resolve(data);
    });
  }

  getResult(targetDataIdentifier: TargetDataIdentifier): ResultData | null {
    const cached = InMemoryTaskCacheHandler.results.find(
      result => result?.id === targetDataIdentifier.taskId
    );
    return cached?.data || null;
  }

  getSourceData(
    sourceDataIdentifier: SourceDataIdentifier
  ): Promise<SourceData[]> {
    if (sourceDataIdentifier?.taskIds) {
      return new Promise<SourceData[]>((resolve, reject) => {
        const ids = sourceDataIdentifier?.taskIds;
        let sourceDatas: ResultData[] = [];
        let loop = false;
        let cached: CachedResultData = null;

        for (let i = 0; i < ids!.length; i++) {
          cached = null;
          cached = InMemoryTaskCacheHandler.results.find(
            result => result!.id === ids![i]
          ) as CachedResultData | null;

          /** task id not found in cacher - rejects all */
          if (!cached) {
            reject(TASK_NOT_FOUND);
            return;
          }

          /** aborted or skipped or error - rejects all */
          if (
            cached.status === CacheStatus.ABORTED ||
            cached.status === CacheStatus.ERROR ||
            cached.status === CacheStatus.SKIPPED
          ) {
            reject(`Task ${cached.id} aborted or skipped or error`);
            return;
          }

          /** if done, add to cache */
          if (cached.status === CacheStatus.DONE) {
            sourceDatas.push(cached.data || null);
            if (sourceDatas.length === ids!.length) {
              /** if got all sourceIds, resolve the promise */
              resolve(sourceDatas);
              return;
            }
          }

          if (cached.status === CacheStatus.PENDING) {
            /** pending */
            loop = true;
            while (loop) {
              let updated = InMemoryTaskCacheHandler.results.find(
                result => result!.id === ids![i]
              ) as CachedResultData | null;
              if (updated?.status !== CacheStatus.PENDING) {
                /** if not pending anymore, exit the loop */
                loop = false;

                /** aborted or skipped or error - rejects all */
                if (
                  updated?.status === CacheStatus.ABORTED ||
                  updated?.status === CacheStatus.ERROR ||
                  updated?.status === CacheStatus.SKIPPED
                ) {
                  reject(`Task ${updated.id} aborted or skipped or error`);
                  return;
                }

                /** if done, add to cache */
                if (updated?.status === CacheStatus.DONE) {
                  sourceDatas.push(updated.data || null);
                  if (sourceDatas.length === ids!.length) {
                    /** if got all sourceIds, resolve the promise */
                    resolve(sourceDatas);
                    return;
                  }
                }
              }
            }
            return;
          }
        }
      });
    } else {
      throw new Error(ERROR_SOURCEDATA_NOT_OVERRIDEN);
    }
  }
}
