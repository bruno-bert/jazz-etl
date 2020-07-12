import { Application } from "@core/app/Application";
import { Pipeline } from "@core/pipeline/Pipeline";
import { INVALID_SOURCE_TASK_ID, INVALID_APP } from "@config/Messages";
import {
  IsApplication,
  IsTaskNotification,
  IsPipelineNotification
} from "../types/core";
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
      return new SecondTask({ id: "1", dependencies: [{ taskId: "1" }] });
    };
    expect(createTask).toThrowError(INVALID_SOURCE_TASK_ID);
  });

  it("Should throw an error to pipeline without application", () => {
    const task1 = new FirstTask({ id: "10" });
    const task2 = new SecondTask({
      id: "20",
      dependencies: [{ taskId: "10" }]
    });
    const pipeline = new Pipeline();
    pipeline.addTask(task1);
    pipeline.addTask(task2);
    expect(
      pipeline.start((notification: IsTaskNotification) => {})
    ).rejects.toEqual(INVALID_APP);
  });

  it("Should call 2 tasks in pipeline and result a single result at the end with expected object transformation", done => {
    const task1 = new FirstTask({ id: "10" });
    const task2 = new SecondTask({
      id: "20",
      dependencies: [{ taskId: "10" }]
    });
    const pipeline = new Pipeline();
    pipeline.addTask(task1).addTask(task2);
    app.addPipeline(pipeline);

    pipeline.start((notification: IsPipelineNotification) => {
      try {
        if (notification.completed) {
          expect(notification.data).toEqual(finalResult);
          done();
        }
      } catch (err) {
        done(err);
      }
    });
  });
});
