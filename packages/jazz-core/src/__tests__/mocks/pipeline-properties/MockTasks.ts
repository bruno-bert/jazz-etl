import { Task } from "@core/task/Task";
import { SourceData, Payload } from "../../../types/core";

export const sourceInfo = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export class FirstTask extends Task {
  getSourceData(): Promise<SourceData[] | SourceData> {
    return new Promise<SourceData[] | SourceData>((resolve, reject) => {
      resolve({ payload: sourceInfo });
    });
  }
  execute(data: SourceData | SourceData[]): Promise<Payload> {
    return new Promise<Payload>(async (resolve, reject) => {
      console.log("execucao da task 1", data);
      resolve(data);
    });
  }
}

export class SecondTask extends Task {
  execute(data: SourceData | SourceData[]): Promise<Payload> {
    return new Promise<Payload>(async (resolve, reject) => {
      console.log("execucao da task 2", data);
      resolve(data);
    });
  }
}

export class ThirdTask extends Task {
  execute(data: SourceData | SourceData[]): Promise<Payload> {
    return new Promise<Payload>(async (resolve, reject) => {
      console.log("execucao da task 3", data);
      resolve(data);
    });
  }
}
