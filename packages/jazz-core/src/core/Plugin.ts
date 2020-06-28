import { IsPlugin, IsPipeline, IsPipelineBuilder, IsTask } from "../types/core";
import { Pipeline } from "./Pipeline";

export abstract class Plugin implements IsPlugin {
  name: string;
  builder: IsPipelineBuilder;
  pipeline: IsPipeline;

  constructor(_builder: IsPipelineBuilder) {
    this.builder = _builder;
    this.pipeline = this.builder.build();
  }

  getTaskIds(): string[] | null {
    if (this.pipeline) return this.pipeline.tasks.map(task => task.id);
    else return null;
  }
  getPipelineByTaskIds(taskIds: string[]): IsPipeline | null {
    if (!this.pipeline) {
      return null;
    } else {
      let tasks: IsTask[] = [];

      for (let id of taskIds) {
        let found = this.pipeline.tasks.find(task => task.id === id);

        if (found) {
          tasks.push(found);
        }
      }

      const pipeline = new Pipeline();
      pipeline.tasks = tasks;

      return pipeline;
    }
  }

  getPipeline(): IsPipeline {
    return this.pipeline;
  }
}
