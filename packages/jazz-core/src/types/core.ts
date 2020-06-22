export enum LOG_LEVEL {
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface IsObservable {
  notify(message: {}): void;
  subscribe(observer: {}): void;
}

export interface IsLogger {
  debug: boolean;
  setDebug(_debug: boolean): void;
  log(message: string, level?: LOG_LEVEL): void;
}

export type ResultData = {} | null;

export interface IsCommand {
  execute(): Promise<ResultData>;
}

export interface IsTask extends IsCommand {
  id: string;
  description?: string;
  result: ResultData | null;
  skip?: boolean;
  sourceTaskId?: string;
  pipeline: IsPipeline;
  getPipeline(): IsPipeline;
  getSourceData(): ResultData;
  run(): Promise<ResultData>;
  save(data: ResultData | null): Promise<ResultData>;
  setSkip(skip: boolean): void;
  getResult(): Promise<ResultData>;
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

export interface IsPipeline {
  tasks: IsTask[];
  logger: IsLogger;
  setApplication(app: IsApplication): void;
  getApplication(): IsApplication;
  addTask(task: IsTask): void;
  getTask(taskId: string): IsTask | null;
}

export interface IsApplication {
  logger?: IsLogger;
  pipelines?: IsPipeline[];
  start(cb: (err: string | null, result: string | null) => void): void;
  addPipeline(pipeline: IsPipeline): void;
}

export type ApplicationCallback = (
  err: string | null,
  result: string | null
) => void;
