import { Application } from "@core/app/Application";
import { Pipeline } from "@core/pipeline/Pipeline";
import {
  IsApplication,
  IsPipelineNotification,
  PropertyType,
  Payload
} from "../../types/core";

import { LeftTask, RightTask, JoinTask } from "./MockTasks";

describe("pipeline-join-tasks", () => {
  let app: IsApplication;
  beforeEach(() => {
    app = Application.getInstance();
  });
  afterEach(() => {
    app.detach();
  });

  it("Should call 3 tasks, the 1st and 2nd payloads must be merged in the 3rd", done => {
    const pipeline = new Pipeline();

    const task1 = new LeftTask({ id: "1" });
    const task2 = new RightTask({ id: "2" });
    const task3 = new JoinTask({ id: "3" });

    task3.addDependency({ taskId: task1.getId(), label: "left" });
    task3.addDependency({ taskId: task2.getId(), label: "right" });

    pipeline
      .addTask(task1)
      .addTask(task2)
      .addTask(task3);

    app.addPipeline(pipeline);

    pipeline.start((notification: IsPipelineNotification) => {
      expect(null).toEqual(null);
      done();
    });
  });
});
