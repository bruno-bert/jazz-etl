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

export enum TaskStatus {
  TASK_PENDING = "TASK_PENDING",
  TASK_STARTED = "TASK_STARTED",
  TASK_SKIPPED = "TASK_SKIPPED",
  TASK_COMPLETED = "TASK_COMPLETED",
  TASK_CONCLUDED_WITH_ERROR = "TASK_CONCLUDED_WITH_ERROR"
}
export type IsTaskNotification = {
  taskId: string;
  taskStatus: TaskStatus;
  data?: Payload | null;
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
    data?: Payload | null
  ): Promise<CachedPayload>;

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
  dependencies?: string[];
  taskCacheHandler?: IsTaskCacheHandler;
}

export interface IsLogger {
  debug: boolean;
  setDebug(_debug: boolean): void;
  log(message: string, level?: LOG_LEVEL): void;
}

export type Payload = {} | null;
export enum CacheStatus {
  PENDING,
  DONE,
  ERROR,
  SKIPPED
}
export type CachedPayload = {
  id: string;
  status: CacheStatus;
  data?: Payload | null;
} | null;
export type SourceData = {} | null;

export interface IsCommand {
  execute(): Promise<Payload>;
}

export interface IsTask extends IsCommand, IsTaskObservable, IsCacheObserver {
  id: string;
  description?: string;
  status: TaskStatus;
  dependsOn?: string[];
  taskCacheHandler?: IsTaskCacheHandler;

  setDependencies(ids: string[]): void;
  addDependency(id: string): void;

  getId(): string;
  run(): Promise<Payload>;
  save(data: Payload | null): Promise<Payload>;
  getSourceData(): Promise<SourceData[] | SourceData>;
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
  start(cb?: PipelineCallBack): void;
  addTask(task: IsTask): IsPipeline;
  getTask(taskId: string): IsTask | null;
}

export interface IsApplication extends IsTaskObserver {
  appConfig?: IsApplicationConfiguration;
  pipelines: IsPipeline[];
  detach(): void;
  getCacher(): IsTaskCacheHandler;
  start(cb?: ApplicationCallBack): void;
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
