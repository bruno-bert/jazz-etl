import { Application } from "@core/Application";

import {
  SUCCESS_MESSAGE,
  ERROR_SOURCEDATA_NOT_OVERRIDEN,
  TASK_NOT_FOUND,
  PIPELINE_NOT_FOUND
} from "@config/Messages";

import { Pipeline } from "@core/Pipeline";
import { Task } from "@core/Task";
import { ResultData, IsPipelineBuilder, IsPipeline } from "src/types/core";
import { Plugin } from "@core/Plugin";

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
    let task1 = new MockTask("1");
    let task2 = new MockTask("2");
    let task3 = new MockTask("3");
    let task4 = new MockTask("4");
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
  it("Should return a callback with a success message", () => {
    const app = new Application();
    app.logger.setDebug(false);

    app.start((err: string | null, result: string | null) => {
      expect(err).toBe(null);
      expect(result).toEqual(SUCCESS_MESSAGE);
    });
  });

  it("Should add a pipeline to the app", () => {
    const app = new Application();
    const pipeline = new Pipeline();
    app.logger.setDebug(false);
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
    })("1");

    pipeline.addTask(task);
    app.addPipeline(pipeline);
    app.start((err: string | null, result: string | null) => {
      expect(app.pipelines.length).toBeGreaterThan(0);
    });
  });

  it("Should avoid tasks with same id in pipeline", () => {
    const app = new Application();
    const pipeline = new Pipeline();
    app.logger.setDebug(false);
    let task1 = new MockTask("1");
    let task2 = new MockTask("1");
    pipeline.addTask(task1);
    pipeline.addTask(task2);
    app.addPipeline(pipeline);
    app.start((err: string | null, result: string | null) => {
      expect(app.pipelines[0].tasks.length).toEqual(1);
    });
  });

  it("Should add 2 tasks in pipeline", () => {
    const app = new Application();
    const pipeline = new Pipeline();
    app.logger.setDebug(false);
    let task1 = new MockTask("1");
    let task2 = new MockTask("2");

    pipeline.addTask(task1);
    pipeline.addTask(task2);
    app.addPipeline(pipeline);
    app.start((err: string | null, result: string | null) => {
      expect(app.pipelines[0].tasks.length).toEqual(2);
    });
  });

  it("Should add entire plugin pipeline into main pipeline", () => {
    const app = new Application();
    const plugin = new MockPlugin();
    app.logger.setDebug(false);
    app.addPipeline(plugin.getPipeline());
    app.start((err: string | null, result: string | null) => {
      expect(app.pipelines.length).toEqual(1);
      expect(app.pipelines[0].tasks.length).toEqual(4);
    });
  });

  it("Should return all task Ids from certain plugin", () => {
    const app = new Application();
    const plugin = new MockPlugin();
    app.logger.setDebug(false);
    const taskIds = plugin.getTaskIds();
    expect(taskIds?.length).toEqual(4);
  });

  it("Should add selected tasks from plugin pipeline into main pipeline", () => {
    const app = new Application();
    const plugin = new MockPlugin();
    app.logger.setDebug(false);

    const pipeline = plugin.getPipelineByTaskIds(["1", "2"]);

    if (pipeline) app.addPipeline(pipeline);

    app.start((err: string | null, result: string | null) => {
      expect(app.pipelines.length).toEqual(1);
      expect(app.pipelines[0].tasks.length).toEqual(2);
    });
  });

  it("Should run a task standalone and return an error in case task has no sourceTaskId and getSourceData is not overriden", async () => {
    const app = new Application();
    app.logger.setDebug(false);
    let task = new MockTask("1");

    await expect(task.run()).rejects.toThrowError(
      ERROR_SOURCEDATA_NOT_OVERRIDEN
    );
  });

  it("Should run a task standalone and return an error in case task has sourceTaskId but is not part of a pipeline", async () => {
    const app = new Application();
    app.logger.setDebug(false);
    let task = new MockTask("1", "test description", "1");
    await expect(task.run()).rejects.toThrowError(PIPELINE_NOT_FOUND);
  });

  it("Should run a task standalone which has method getSourceData overriden", async () => {
    const app = new Application();
    app.logger.setDebug(false);
    const testResult = { message: "test" };
    let task = new (class OtherTask extends MockTask {
      getSourceData() {
        return testResult;
      }
    })("1");

    await expect(task.run()).resolves.toEqual(testResult);
  });
});
