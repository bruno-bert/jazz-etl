import { Application } from "@core/app/Application";

import {
  ERROR_SOURCEDATA_NOT_OVERRIDEN,
  EMPTY_PIPELINE
} from "@config/Messages";

import { Pipeline } from "@core/pipeline/Pipeline";
import { Task } from "@core/task/Task";
import { MockTask } from "./mocks/main/MockTask";
import { MockPlugin } from "./mocks/main/MockPlugin";
import { IsApplication, SourceData, Payload } from "../types/core";

describe("main", () => {
  let app: IsApplication;
  beforeEach(() => {
    app = Application.getInstance();
  });
  afterEach(() => {
    app.detach();
  });

  it("Should throw an error since there is no pipeline in the app", () => {
    expect(() => {
      app.start();
    }).toThrowError(EMPTY_PIPELINE);
  });

  it("Should add a pipeline to the app", () => {
    const pipeline = new Pipeline();
    let task = new (class MyTask extends Task {
      execute(data: SourceData | SourceData[]): Promise<Payload> {
        return new Promise<Payload>((resolve, reject) => {
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
    app.start(() => {
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
    app.start(() => {
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
    app.start(() => {
      expect(app.pipelines[0].tasks.length).toEqual(2);
    });
  });

  it("Should add entire plugin pipeline into main pipeline", () => {
    const plugin = new MockPlugin();
    app.addPipeline(plugin.getPipeline());
    app.start(() => {
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

    app.start(() => {
      expect(app.pipelines.length).toEqual(1);
      expect(app.pipelines[0].tasks.length).toEqual(2);
    });
  });

  it("Should run a task standalone and return an error in case task has no sourceTaskId and getSourceData is not overriden", async () => {
    let task = new MockTask({ id: "teste" });

    await expect(task.run()).rejects.toEqual(ERROR_SOURCEDATA_NOT_OVERRIDEN);
  });

  it("Should run a task standalone which has method getSourceData overriden", async () => {
    const testResult: SourceData = { taskId: "", payload: {} };
    let task = new (class OtherTask extends MockTask {
      getSourceData() {
        return new Promise<SourceData>((resolve, reject) => {
          resolve(testResult);
        });
      }
    })();

    await expect(task.run()).resolves.toEqual([testResult]);
  });

  it("Should not run a skipped task and return null", async () => {
    const testResult: SourceData = { payload: {} };
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
    app.start(() => {
      expect(app.pipelines[0].tasks.length).toEqual(2);
    });
  });

  it("Should avoid duplicated task - automatic id", async () => {
    const pipeline = new Pipeline();
    let task = new MockTask();

    pipeline.addTask(task);
    pipeline.addTask(task);

    app.addPipeline(pipeline);
    app.start(() => {
      expect(app.pipelines[0].tasks.length).toEqual(1);
    });
  });

  it("Should run task standalone and wait result using async/await", async () => {
    const testResult: SourceData = { payload: {} };
    let task = new (class MyTask extends Task {
      getSourceData() {
        return new Promise<SourceData>((resolve, reject) => {
          resolve(testResult);
        });
      }
      execute(data: SourceData | SourceData[]): Promise<Payload> {
        return new Promise<Payload>((resolve, reject) => {
          resolve(testResult);
        });
      }
    })();
    try {
      const result = await task.run();
      expect(result).toBe(testResult);
    } catch (err) {}
  });
});
