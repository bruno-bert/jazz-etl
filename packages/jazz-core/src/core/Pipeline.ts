import { isPreTask, isPostTask } from "../helpers";
import { IsTask, IsPipeline } from "../types";

class Pipeline implements IsPipeline {
  private static instance: Pipeline;

  public items: IsTask[];

  private results: IsTask[];

  private constructor() {
    this.items = [];
    this.results = [];
  }

  static getInstance(): Pipeline {
    if (!Pipeline.instance) {
      Pipeline.instance = new Pipeline();
    }
    return Pipeline.instance;
  }

  addTask(task: IsTask) {
    this.items.push(task);
    return this;
  }

  addResult(task: IsTask) {
    this.results.push(task);
    return this;
  }

  getResult(taskName: string, prefix?: string): {} | [] | null {
    let task = null;
    const isPre = isPreTask(taskName);
    const isPost = isPostTask(taskName);
    let theTaskName = taskName;
    let thePrefix = prefix;

    if (isPre) {
      thePrefix = "pre";
    } else if (isPost) {
      thePrefix = "post";
    }

    theTaskName = taskName.replace("pre-", "").replace("post-", "");

    if (!thePrefix) {
      task =
        this.results && this.results.length > 0
          ? this.results.filter(item => item.id === theTaskName)[0]
          : null;
    } else {
      task =
        this.results && this.results.length > 0
          ? this.results.filter(
              item => item.id === theTaskName && item.prefix === thePrefix
            )[0]
          : null;
    }

    return task ? task.result : null;
  }

  clear() {
    this.items = [];
    this.results = [];
  }
}

export default Pipeline;
