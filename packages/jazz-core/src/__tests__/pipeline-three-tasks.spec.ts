import { Application } from "@core/app/Application";
import { Pipeline } from "@core/pipeline/Pipeline";
import {
  IsApplication,
  TaskStatus,
  IsTaskNotification,
  IsPipelineNotification
} from "../types/core";
import {
  finalResult,
  secondTaskResult
} from "./mocks/pipeline-three-tasks/Factory";
import {
  SecondTask,
  FirstTask,
  ThirdTask
} from "./mocks/pipeline-three-tasks/MockTasks";

describe("pipeline-three-tasks", () => {
  let app: IsApplication;
  beforeEach(() => {
    app = Application.getInstance();
  });
  afterEach(() => {
    app.detach();
  });

  it("Should call 3 tasks in pipeline and result a single result at the end with expected object transformation", done => {
    const task1 = new FirstTask({ id: "10" });
    const task2 = new SecondTask({
      id: "20",
      dependencies: [{ taskId: "10" }]
    });
    const task3 = new ThirdTask({ id: "30", dependencies: [{ taskId: "20" }] });
    const pipeline = new Pipeline();
    pipeline
      .addTask(task1)
      .addTask(task2)
      .addTask(task3);
    app.addPipeline(pipeline);

    pipeline.start((notification: IsPipelineNotification) => {
      if (notification.completed) {
        expect(notification.data).toEqual(finalResult);
        done();
      }
    });
  });

  it("Should add 3 tasks in pipeline, but skip the 3rd which has no dependents, so the final result must be result of second task", done => {
    const task1 = new FirstTask({ id: "10" });
    const task2 = new SecondTask({
      id: "20",
      dependencies: [{ taskId: "10" }]
    });
    const task3 = new ThirdTask({ id: "30", dependencies: [{ taskId: "20" }] });
    const pipeline = new Pipeline();
    pipeline
      .addTask(task1)
      .addTask(task2)
      .addTask(task3);
    app.addPipeline(pipeline);

    task3.setSkip(true);

    pipeline.start((notification: IsPipelineNotification) => {
      try {
        if (notification.completed) {
          expect(notification.data).toEqual(secondTaskResult);
          done();
        }
      } catch (err) {
        done(err);
      }
    });
  });

  it("Should add 3 tasks in pipeline, but skip the 2nd which has 3rd task as dependent, so pipeline should throw an error", done => {
    const task1 = new FirstTask({ id: "10" });
    const task2 = new SecondTask({
      id: "20",
      dependencies: [{ taskId: "10" }]
    });
    const task3 = new ThirdTask({ id: "30", dependencies: [{ taskId: "20" }] });
    const pipeline = new Pipeline();
    pipeline
      .addTask(task1)
      .addTask(task2)
      .addTask(task3);
    app.addPipeline(pipeline);

    task2.setSkip(true);

    pipeline.start((notification: IsTaskNotification) => {
      try {
        if (notification.taskId === "30") {
          expect(notification.taskStatus).toEqual(
            TaskStatus.TASK_CONCLUDED_WITH_ERROR
          );
          done();
        }
      } catch (err) {
        done(err);
      }
    });
  });

  it("Should add 3 tasks in pipeline, but skip the first which has 2nd task as dependent, so pipeline should throw an error", done => {
    const task1 = new FirstTask({ id: "10" });
    const task2 = new SecondTask({
      id: "20",
      dependencies: [{ taskId: "10" }]
    });
    const task3 = new ThirdTask({ id: "30", dependencies: [{ taskId: "20" }] });
    const pipeline = new Pipeline();
    pipeline
      .addTask(task1)
      .addTask(task2)
      .addTask(task3);
    app.addPipeline(pipeline);

    task1.setSkip(true);

    pipeline.start((notification: IsPipelineNotification) => {
      try {
        if (notification.taskId === "20") {
          expect(notification.taskStatus).toEqual(
            TaskStatus.TASK_CONCLUDED_WITH_ERROR
          );
          done();
        }
      } catch (err) {
        done(err);
      }
    });
  });

  it("Should add 3 tasks in pipeline, but skip the first and the second, the pipeline must raise error in 3rd task", done => {
    const task1 = new FirstTask({ id: "10" });
    const task2 = new SecondTask({ id: "20", dependencies: ["10"] });
    const task3 = new ThirdTask({ id: "30", dependencies: ["20"] });
    const pipeline = new Pipeline();
    pipeline
      .addTask(task1)
      .addTask(task2)
      .addTask(task3);
    app.addPipeline(pipeline);

    task1.setSkip(true);
    task2.setSkip(true);

    pipeline.start((notification: IsTaskNotification) => {
      try {
        if (notification.taskId === "30") {
          expect(notification.taskStatus).toEqual(
            TaskStatus.TASK_CONCLUDED_WITH_ERROR
          );
          done();
        }
      } catch (err) {
        done(err);
      }
    });
  });
});
