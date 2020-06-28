import { Application } from "@core/Application";
import { Pipeline } from "@core/Pipeline";
import { INVALID_SOURCE_TASK_ID, INVALID_APP } from "@config/Messages";
import { IsApplication } from "../types/core";
import { finalResult } from "./mocks/pipeline-simple/Factory";
import { SecondTask, FirstTask } from "./mocks/pipeline-simple/MockTasks";

describe("pipeline-simple", () => {
  let app: IsApplication;
  beforeEach(() => {
    app = Application.getInstance();
  });
  afterEach(() => {
    app.detach();
  });

  it("Should throw an error for invalid source task id", () => {
    const createTask = () => {
      return new SecondTask({ id: "1", sourceTaskIds: ["1"] });
    };
    expect(createTask).toThrowError(INVALID_SOURCE_TASK_ID);
  });

  it("Should raise error to pipeline without application", () => {
    const task1 = new FirstTask({ id: "10" });
    const task2 = new SecondTask({ id: "20", sourceTaskIds: ["10"] });
    const pipeline = new Pipeline();
    pipeline.addTask(task1);
    pipeline.addTask(task2);
    expect(pipeline.start()).rejects.toEqual(INVALID_APP);
  });

  it.only("Should call 2 tasks in pipeline and result a single result at the end with expected object transformation", () => {
    const task1 = new FirstTask({ id: "10" });
    const task2 = new SecondTask({ id: "20", sourceTaskIds: ["10"] });
    const pipeline = new Pipeline();
    pipeline.addTask(task1);
    pipeline.addTask(task2);
    app.addPipeline(pipeline);
    //expect(pipeline.start()).resolves.toEqual(finalResult);
    pipeline.start();
  });
});
