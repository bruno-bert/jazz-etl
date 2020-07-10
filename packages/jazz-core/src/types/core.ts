export enum LOG_LEVEL {
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export enum TaskStatus {
  TASK_PENDING = "TASK_PENDING",
  TASK_STARTED = "TASK_STARTED",
  TASK_SKIPPED = "TASK_SKIPPED",
  TASK_COMPLETED = "TASK_COMPLETED",
  TASK_CONCLUDED_WITH_ERROR = "TASK_CONCLUDED_WITH_ERROR"
}

export interface IsObservable {
  notify(message: {}): void;
  subscribe(observer: {}): void;
}
export interface IsObserver {
  notify(message: {}): void;
}

export type SourceDataIdentifier = {
  dependencies?: TaskDependency[];
};

export type TargetDataIdentifier = {
  taskId: string;
};

export type IsCacheNotification = {
  messages: CachedMessage[];
};

export type IsTaskNotification = {
  taskId: string;
  taskStatus: TaskStatus;
  data?: Payload | null;
  message?: string;
};

export interface IsTaskObserver {
  notify(notification: IsTaskNotification): void;
}

export interface IsTaskObservable {
  notify(notification: IsTaskNotification): void;
  subscribe(observer: IsTaskObserver): void;
}

export type TaskDependency = {
  taskId: string;
  property?: string;
};

export type TaskAppearance = {
  color?: string;
  backgroundColor?: string;
  icon?: string;
  showName?: boolean;
};
export interface IsTask extends IsTaskObservable, IsCacheObserver {
  id: string;
  name?: string;
  appearance?: TaskAppearance;
  description?: string;
  status: TaskStatus;
  dependencies?: TaskDependency[];
  properties?: TaskProperty[];
  taskCacheHandler?: IsTaskCacheHandler;

  execute(data: SourceData | SourceData[]): Promise<Payload>;

  setDependencies(dependencies: TaskDependency[]): void;

  addDependency(dependency: TaskDependency): IsTask;
  setDependencies(dependencies: TaskDependency[]): IsTask;
  removeDependency(dependency: TaskDependency): IsTask;

  addProperty(property: TaskProperty): IsTask;
  setProperties(properties: TaskProperty[]): IsTask;
  removeProperty(property: TaskProperty): IsTask;

  getId(): string;
  run(): Promise<Payload>;
  save(data: Payload | null): Promise<Payload[]>;
  getSourceData(): Promise<SourceData[] | SourceData>;
}

export interface IsCacheObservable {
  cacheNotify(notification: IsCacheNotification): void;
  subscribeOnCache(observer: IsCacheObserver): void;
  unsubscribeFromCache(observer: IsCacheObserver): void;
}
export interface IsCacheObserver {
  onNotificationFromCache(notification: IsCacheNotification): void;
}

export interface IsPipelineObservable {
  notify(notification: IsTaskNotification): void;
  subscribe(observer: IsTaskObserver): void;
}

export interface IsTaskCacheHandlerConfiguration {
  expiresIn?: number;
  sourceTaskIds?: string[];
}

export interface IsTaskCacheHandler extends IsCacheObservable {
  config: IsTaskCacheHandlerConfiguration;

  updateCache(
    targetDataIdentifier: TargetDataIdentifier,
    status: CacheStatus,
    data?: Payload | null,
    resolvedProperties?: TaskProperty[] | null
  ): Promise<CachedMessage[]>;

  getSourceData(
    sourceDataIdentifier: SourceDataIdentifier
  ): Promise<SourceData[] | SourceData>;
}

export interface IsApplicationConfiguration {
  pipelines?: IsPipeline[];
  logger?: IsLogger;
  taskCacheHandler?: IsTaskCacheHandler;
}

export interface IsTaskPropertyHandler {
  resolve(data: Payload, property: TaskProperty): TaskProperty;
  resolveAll(data: Payload, properties: TaskProperty[]): TaskProperty[];
  validate(properties: TaskProperty[]): boolean;
}

export interface IsTaskConfiguration {
  id?: string;
  name?: string;
  description?: string;
  appearance?: TaskAppearance;
  dependencies?: TaskDependency[] | string[];
  taskCacheHandler?: IsTaskCacheHandler;
  propertyHandler?: IsTaskPropertyHandler;
  properties?: TaskProperty[];
}

export interface IsLogger {
  debug: boolean;
  setDebug(_debug: boolean): void;
  log(message: string, level?: LOG_LEVEL): void;
}

export enum PropertyType {
  FIXED_VALUE = "FIXED_VALUE",
  ENVIRONMENT_VARIABLE = "ENVIRONMENT_VARIABLE",
  CONTEXT_VARIABLE_LOCAL = "CONTEXT_VARIABLE_LOCAL",
  CONTEXT_VARIABLE_GLOBAL = "CONTEXT_VARIABLE_GLOBAL",
  EXPRESSION = "EXPRESSION"
}

export type PropertyValue =
  | {}
  | []
  | string
  | null
  | Function
  | boolean
  | number;
export type TaskProperty = {
  id: string;
  type: PropertyType;
  expression: any;
  value?: PropertyValue;
};
export type Payload = {} | null | undefined;
export enum CacheStatus {
  PENDING = "PENDING",
  DONE = "DONE",
  ERROR = "ERROR",
  SKIPPED = "SKIPPED"
}
export type CachedMessage = {
  id: string;
  property?: string;
  status: CacheStatus;
  data?: Payload;
};

export type SourceData = {
  taskId?: string;
  property?: string;
  payload: Payload | null;
} | null;

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
  name?: string;
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
