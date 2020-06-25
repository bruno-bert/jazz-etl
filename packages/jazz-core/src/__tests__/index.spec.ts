import { Application } from "@core/Application";

import {
  SUCCESS_MESSAGE,
  ERROR_SOURCEDATA_NOT_OVERRIDEN
} from "@config/Messages";

import { Pipeline } from "@core/Pipeline";
import { Task } from "@core/Task";
import {
  ResultData,
  IsPipelineBuilder,
  IsPipeline,
  SourceData,
  IsTaskCacheHandler,
  IsTaskCacheHandlerConfiguration,
  TargetDataIdentifier,
  IsApplication
} from "src/types/core";
import { Plugin } from "@core/Plugin";

class CustomCacheHandler implements IsTaskCacheHandler {
  config: IsTaskCacheHandlerConfiguration;
  getSourceData() {
    return new Promise<SourceData>((resolve, reject) => {
      resolve(null);
    });
  }

  save(
    targetId: TargetDataIdentifier,
    data: Promise<ResultData>
  ): Promise<ResultData> {
    return new Promise<ResultData>((resolve, reject) => {
      resolve(data);
    });
  }
  getResult(): Promise<ResultData> {
    throw new Error("Method not implemented.");
  }
}

class MockTask extends Task {
  execute(): Promise<ResultData> {
    return new Promise<ResultData>((resolve, reject) => {
      try {
        const data = this.getSourceData();
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
}

class MockPipelineBuilder implements IsPipelineBuilder {
  build(): IsPipeline {
    const pipeline = new Pipeline();
    let task1 = new MockTask({ id: "1" });
    let task2 = new MockTask({ id: "2" });
    let task3 = new MockTask({ id: "3" });
    let task4 = new MockTask({ id: "4" });
    pipeline.addTask(task1);
    pipeline.addTask(task2);
    pipeline.addTask(task3);
    pipeline.addTask(task4);
    return pipeline;
  }
}

class MockPlugin extends Plugin {
  constructor() {
    super(new MockPipelineBuilder());
  }
}

describe("Application Tests", () => {
  let app: IsApplication;
  beforeEach(() => {
    app = Application.getInstance();
  });
  afterEach(() => {
    app.detach();
  });

  it("Should return a callback with a success message", () => {
    app.start((err: string | null, result: string | null) => {
      expect(err).toBe(null);
      expect(result).toEqual(SUCCESS_MESSAGE);
    });
  });

  it("Should add a pipeline to the app", () => {
    const pipeline = new Pipeline();
    let task = new (class MyTask extends Task {
      execute(): Promise<ResultData> {
        return new Promise<ResultData>((resolve, reject) => {
          try {
            resolve({ data: "some data" });
          } catch (err) {
            reject(err);
          }
        });
      }
    })({ id: "1" });

    pipeline.addTask(task);
    app.addPipeline(pipeline);
    app.start((err: string | null, result: string | null) => {
      expect(app.pipelines.length).toBeGreaterThan(0);
    });
  });

  it("Should avoid tasks with same id in pipeline", () => {
    const pipeline = new Pipeline();
    let task1 = new MockTask({ id: "1" });
    let task2 = new MockTask({ id: "1" });
    pipeline.addTask(task1);
    pipeline.addTask(task2);
    app.addPipeline(pipeline);
    app.start((err: string | null, result: string | null) => {
      expect(app.pipelines[0].tasks.length).toEqual(1);
    });
  });

  it("Should add 2 tasks in pipeline", () => {
    const pipeline = new Pipeline();
    let task1 = new MockTask({ id: "1" });
    let task2 = new MockTask({ id: "2" });

    pipeline.addTask(task1);
    pipeline.addTask(task2);
    app.addPipeline(pipeline);
    app.start((err: string | null, result: string | null) => {
      expect(app.pipelines[0].tasks.length).toEqual(2);
    });
  });

  it("Should add entire plugin pipeline into main pipeline", () => {
    const plugin = new MockPlugin();
    app.addPipeline(plugin.getPipeline());
    app.start((err: string | null, result: string | null) => {
      expect(app.pipelines.length).toEqual(1);
      expect(app.pipelines[0].tasks.length).toEqual(4);
    });
  });

  it("Should return all task Ids from certain plugin", () => {
    const plugin = new MockPlugin();
    const taskIds = plugin.getTaskIds();
    expect(taskIds?.length).toEqual(4);
  });

  it("Should add selected tasks from plugin pipeline into main pipeline", () => {
    const plugin = new MockPlugin();

    const pipeline = plugin.getPipelineByTaskIds(["1", "2"]);

    if (pipeline) app.addPipeline(pipeline);

    app.start((err: string | null, result: string | null) => {
      expect(app.pipelines.length).toEqual(1);
      expect(app.pipelines[0].tasks.length).toEqual(2);
    });
  });

  it("Should run a task standalone and return an error in case task has no sourceTaskId and getSourceData is not overriden", async () => {
    let task = new MockTask({ id: "1" });

    await expect(task.run()).rejects.toThrowError(
      ERROR_SOURCEDATA_NOT_OVERRIDEN
    );
  });

  it("Should run a task standalone which has method getSourceData overriden", async () => {
    const testResult = { message: "test" };
    let task = new (class OtherTask extends MockTask {
      getSourceData() {
        return new Promise<SourceData>((resolve, reject) => {
          resolve(testResult);
        });
      }
    })({ id: "1" });

    await expect(task.run()).resolves.toEqual(testResult);
  });

  it("Should not run a skipped task and return null", async () => {
    const testResult = { message: "test" };
    let task = new (class OtherTask extends MockTask {
      getSourceData() {
        return new Promise<SourceData>((resolve, reject) => {
          resolve(testResult);
        });
      }
    })({ id: "1" });
    task.setSkip(true);
    await expect(task.run()).resolves.toEqual(null);
  });

  it("Should allow create task without any configuration - automatic id", async () => {
    const pipeline = new Pipeline();
    let task1 = new MockTask();
    let task2 = new MockTask();

    pipeline.addTask(task1);
    pipeline.addTask(task2);

    app.addPipeline(pipeline);
    app.start((err: string | null, result: string | null) => {
      expect(app.pipelines[0].tasks.length).toEqual(2);
    });
  });

  it("Should avoid duplicated task - automatic id", async () => {
    const pipeline = new Pipeline();
    let task = new MockTask();

    pipeline.addTask(task);
    pipeline.addTask(task);

    app.addPipeline(pipeline);
    app.start((err: string | null, result: string | null) => {
      expect(app.pipelines[0].tasks.length).toEqual(1);
    });
  });

  it("Should be able to inform a custom task cache handler for standalone task", async () => {
    let testResult = { message: "this has the data" };
    let cacher = new (class extends CustomCacheHandler {
      getSourceData() {
        return new Promise<SourceData>((resolve, reject) => {
          resolve(testResult);
        });
      }
    })();

    let task = new MockTask({ taskCacheHandler: cacher });

    await expect(task.run()).resolves.toBe(testResult);
  });

  it("Should ignore custom task cache handler from a task that inside a pipeline (must conside the handler on pipeline level)", async () => {
    let testResultTaskLevel = {
      message: "this has the data- from cacher in task"
    };
    let testResultPipelineLevel = {
      message: "this has the data - from cacher in pipeline"
    };

    let cacherTask = new (class extends CustomCacheHandler {
      getSourceData() {
        return new Promise<SourceData>((resolve, reject) => {
          resolve(testResultTaskLevel);
        });
      }
    })();

    let cacherApp = new (class extends CustomCacheHandler {
      getSourceData() {
        return new Promise<SourceData>((resolve, reject) => {
          resolve(testResultPipelineLevel);
        });
      }
    })();

    /** refresh the app instance */
    app.detach();
    app = Application.getInstance({
      taskCacheHandler: cacherApp
    });

    const pipeline = new Pipeline();
    let task1 = new MockTask({ taskCacheHandler: cacherTask });
    let task2 = new MockTask({ taskCacheHandler: cacherTask });
    pipeline.addTask(task1);
    pipeline.addTask(task2);
    app.addPipeline(pipeline);
    await expect(pipeline.all()).resolves.toEqual([
      testResultPipelineLevel,
      testResultPipelineLevel
    ]);
  });

  it("Should run task standalone and wait result using async/await", async () => {
    let testResult = { message: "this has the data" };
    let task = new (class MyTask extends Task {
      execute(): Promise<ResultData> {
        return new Promise<ResultData>((resolve, reject) => {
          try {
            resolve(testResult);
          } catch (err) {
            reject(err);
          }
        });
      }
    })();
    const result = await task.run();
    expect(result).toBe(testResult);
  });
});
