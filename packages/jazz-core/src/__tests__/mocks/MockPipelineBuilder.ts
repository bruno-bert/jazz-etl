import { IsPipelineBuilder, IsPipeline } from "../../types/core";
import { Pipeline } from "@core/pipeline/Pipeline";
import { MockTask } from "./MockTask";

export class MockPipelineBuilder implements IsPipelineBuilder {
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
