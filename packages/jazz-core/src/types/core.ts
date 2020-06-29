export enum LOG_LEVEL {
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface IsObservable {
  notify(message: {}): void;
  subscribe(observer: {}): void;
}
export interface IsObserver {
  notify(message: {}): void;
}

export enum TaskEvent {
  TASK_STARTED,
  TASK_SKIPPED,
  TASK_ABORTED,
  TASK_COMPLETED,
  TASK_CONCLUDED_WITH_ERROR
}
export type IsTaskNotification = {
  taskId: string;
  taskEvent: TaskEvent;
  data?: ResultData | null;
  message?: string;
};

export type IsCacheNotification = {
  taskIds: string[];
};

export interface IsTaskObservable {
  notify(notification: IsTaskNotification): void;
  subscribe(observer: IsTaskObserver): void;
}
export interface IsPipelineObservable {
  notify(notification: IsTaskNotification): void;
  subscribe(observer: IsTaskObserver): void;
}

export interface IsTaskObserver {
  notify(notification: IsTaskNotification): void;
}

export interface IsCacheObservable {
  cacheNotify(notification: IsCacheNotification): void;
  subscribeOnCache(observer: IsCacheObserver): void;
  unsubscribeFromCache(observer: IsCacheObserver): void;
}
export interface IsCacheObserver {
  cacheNotificationArrived(notification: IsCacheNotification): void;
}

export interface IsTaskCacheHandlerConfiguration {
  expiresIn?: number;
  sourceTaskIds?: string[];
}

export type SourceDataIdentifier = {
  taskIds?: string[];
};

export type TargetDataIdentifier = {
  taskId: string;
};

export interface IsTaskCacheHandler extends IsCacheObservable {
  config: IsTaskCacheHandlerConfiguration;

  updateCache(
    targetDataIdentifier: TargetDataIdentifier,
    status: CacheStatus,
    data?: ResultData | null
  ): Promise<CachedResultData>;

  save(
    targetDataIdentifier: TargetDataIdentifier,
    data?: ResultData | null
  ): Promise<ResultData>;
  getSourceData(
    sourceDataIdentifier: SourceDataIdentifier
  ): Promise<SourceData[] | SourceData>;
}

export interface IsApplicationConfiguration {
  pipelines?: IsPipeline[];
  logger?: IsLogger;
  taskCacheHandler?: IsTaskCacheHandler;
}

export interface IsTaskConfiguration {
  id?: string;
  description?: string;
  sourceTaskIds?: string[];
  taskCacheHandler?: IsTaskCacheHandler;
}

export interface IsLogger {
  debug: boolean;
  setDebug(_debug: boolean): void;
  log(message: string, level?: LOG_LEVEL): void;
}

export type ResultData = {} | null;
export enum CacheStatus {
  PENDING,
  DONE,
  ERROR,
  ABORTED,
  SKIPPED
}
export type CachedResultData = {
  id: string;
  status: CacheStatus;
  data?: ResultData | null;
} | null;
export type SourceData = {} | null;

export interface IsCommand {
  execute(): Promise<ResultData>;
}

export interface IsTask extends IsCommand, IsTaskObservable, IsCacheObserver {
  id: string;
  description?: string;
  skip?: boolean;
  completed: boolean;
  sourceTaskIds?: string[];
  taskCacheHandler?: IsTaskCacheHandler;

  readyToRun(taskIds: string[]): boolean;
  abort(): void;
  notifyError(err: string): void;
  setProgress(progress: boolean): void;
  setSourceTaskIds(ids: string[]): void;
  addSourceTaskId(id: string): void;

  getId(): string;
  run(): Promise<ResultData>;
  save(data: ResultData | null): Promise<ResultData>;
  getSourceData(): Promise<SourceData[] | SourceData>;
  setSkip(skip: boolean): void;
  setCompleted(completed: boolean, data: ResultData): void;
}

export interface IsPipelineBuilder {
  build(): IsPipeline;
}

export interface IsPlugin {
  name: string;
  pipeline: IsPipeline;
  builder: IsPipelineBuilder;
  getPipeline(): IsPipeline;
  getTaskIds(): string[] | null;
  getPipelineByTaskIds(taskIds: string[]): IsPipeline | null;
}

export interface IsPipeline extends IsTaskObserver, IsPipelineObservable {
  id: string;
  tasks: IsTask[];
  logger: IsLogger;
  completed: boolean;
  taskCacheHandler: IsTaskCacheHandler;
  setCompleted(complete: boolean): void;
  isCompleted(): boolean;
  getId(): string;
  setApplication(app: IsApplication): void;
  getApplication(): IsApplication;
  start(cb: PipelineCallBack): void;
  addTask(task: IsTask): IsPipeline;
  getTask(taskId: string): IsTask | null;
}

export interface IsApplication extends IsTaskObserver {
  appConfig?: IsApplicationConfiguration;
  pipelines: IsPipeline[];
  detach(): void;
  getCacher(): IsTaskCacheHandler;
  start(cb: ApplicationCallBack): void;
  addPipeline(pipeline: IsPipeline): IsApplication;
}

export interface IsApplicationNotification extends IsTaskNotification {
  completed: boolean;
}
export interface IsPipelineNotification extends IsTaskNotification {
  completed: boolean;
}

export type ApplicationCallBack = (
  notification: IsApplicationNotification
) => void;
export type PipelineCallBack = (notification: IsPipelineNotification) => void;
