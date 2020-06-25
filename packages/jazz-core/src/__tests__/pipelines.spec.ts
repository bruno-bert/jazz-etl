import { Application } from "@core/Application";

import { INVALID_SOURCE_TASK_ID, INVALID_APP } from "@config/Messages";

import { Pipeline } from "@core/Pipeline";
import { Task } from "@core/Task";
import { ResultData, SourceData, IsApplication } from "src/types/core";

type SourceTestData = {
  firstName: string;
  lastName: string;
};
type TransformedTestData = {
  name: string;
};
const sourceData: SourceTestData = { firstName: "John", lastName: "Doe" };
const finalResult: TransformedTestData = {
  name: "John Doe Silva"
};
class FirstTask extends Task {
  getSourceData(): Promise<SourceData> {
    return new Promise<SourceData>((resolve, reject) => {
      resolve(sourceData);
    });
  }
  execute(): Promise<ResultData> {
    return new Promise<ResultData>(async (resolve, reject) => {
      const sourceData: SourceTestData = (await this.getSourceData()) as SourceTestData;
      resolve({ data: `${sourceData.firstName} ${sourceData.lastName}` });
    });
  }
}

class SecondTask extends Task {
  execute(): Promise<ResultData> {
    return new Promise<ResultData>(async (resolve, reject) => {
      const sourceData: TransformedTestData = (await this.getSourceData()) as TransformedTestData;
      resolve({ name: `${sourceData.name} Silva` });
    });
  }
}

describe("Pipeline Tests", () => {
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
    expect(pipeline.run()).rejects.toEqual(INVALID_APP);
  });

  it("Should call 2 tasks in pipeline and result a single result at the end with expected object transformation", () => {
    const task1 = new FirstTask({ id: "10" });
    const task2 = new SecondTask({ id: "20", sourceTaskIds: ["10"] });
    const pipeline = new Pipeline();
    pipeline.addTask(task1);
    pipeline.addTask(task2);
    app.addPipeline(pipeline);
    expect(pipeline.run()).resolves.toBe(finalResult);
  });
});
