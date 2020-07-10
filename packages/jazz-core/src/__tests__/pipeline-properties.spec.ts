import { Application } from "@core/app/Application";
import { Pipeline } from "@core/pipeline/Pipeline";
import {
  IsApplication,
  IsPipelineNotification,
  PropertyType,
  Payload
} from "../types/core";

import {
  SecondTask,
  FirstTask,
  ThirdTask
} from "./mocks/pipeline-properties/MockTasks";

describe("pipeline-properties", () => {
  let app: IsApplication;
  beforeEach(() => {
    app = Application.getInstance();
  });
  afterEach(() => {
    app.detach();
  });

  it("Should call 3 tasks, and the second and third tasks must receive different properties from the first task", done => {
    const task1 = new FirstTask({ id: "10" });
    const task2 = new SecondTask({
      id: "20",
      dependencies: [{ taskId: "10", property: "bigger-than-five" }]
    });
    const task3 = new ThirdTask({
      id: "30",
      dependencies: [{ taskId: "10", property: "less-equal-five" }]
    });
    const pipeline = new Pipeline();

    task1.addProperty({
      id: "bigger-than-five",
      type: PropertyType.EXPRESSION,
      expression: (data: Payload) => {
        return (data as number[]).filter(num => num > 5);
      }
    });

    task1.addProperty({
      id: "less-equal-five",
      type: PropertyType.EXPRESSION,
      expression: (data: Payload) => {
        return (data as number[]).filter(num => num <= 5);
      }
    });

    pipeline
      .addTask(task1)
      .addTask(task2)
      .addTask(task3);

    app.addPipeline(pipeline);

    pipeline.start((notification: IsPipelineNotification) => {
      if (notification.taskId === "30") {
        expect(notification.data).toEqual([1, 2, 3, 4, 5]);
        done();
      }
    });
  });
});
