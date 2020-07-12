import { Task } from "@core/task/Task";
import { sourceInfo, SourceTestInfo, FinalResultInfo } from "./Factory";
import { SourceData, Payload } from "../../types/core";

export class FirstTask extends Task {
  getSourceData(): Promise<SourceData[]> {
    return new Promise<SourceData[]>((resolve, reject) => {
      resolve([{ payload: sourceInfo }]);
    });
  }
  execute(data: SourceData | SourceData[]): Promise<Payload> {
    return new Promise<Payload>(async (resolve, reject) => {
      const source = (data as SourceData[])[0]?.payload as SourceTestInfo;

      resolve({ name: `${source.firstName} ${source.lastName}` });
    });
  }
}

export class SecondTask extends Task {
  execute(data: SourceData | SourceData[]): Promise<Payload> {
    return new Promise<Payload>(async (resolve, reject) => {
      try {
        const source = (data as SourceData[])[0]?.payload as FinalResultInfo;
        resolve({ name: `${source.name} Silva` });
      } catch (err) {
        reject(err);
      }
    });
  }
}

export class ThirdTask extends Task {
  execute(data: SourceData | SourceData[]): Promise<Payload> {
    return new Promise<Payload>(async (resolve, reject) => {
      try {
        const source = (data as SourceData[])[0]?.payload as FinalResultInfo;
        resolve({ name: `${source.name} Santos` });
      } catch (err) {
        reject(err);
      }
    });
  }
}
