import { Task } from "@core/task/Task";
import { SourceData, Payload } from "../../../types/core";
import { sourceInfo, SourceTestInfo, FinalResultInfo } from "./Factory";

export class FirstTask extends Task {
  getSourceData(): Promise<SourceData[] | SourceData> {
    return new Promise<SourceData[] | SourceData>((resolve, reject) => {
      resolve(sourceInfo);
    });
  }
  execute(): Promise<Payload> {
    return new Promise<Payload>(async (resolve, reject) => {
      const source: SourceTestInfo = (await this.getSourceData()) as SourceTestInfo;
      resolve({ name: `${source.firstName} ${source.lastName}` });
    });
  }
}

export class SecondTask extends Task {
  execute(): Promise<Payload> {
    return new Promise<Payload>(async (resolve, reject) => {
      try {
        const sourceData = (await this.getSourceData()) as SourceData[];
        const source = sourceData[0] as FinalResultInfo;
        resolve({ name: `${source.name} Silva` });
      } catch (err) {
        reject(err);
      }
    });
  }
}

export class ThirdTask extends Task {
  execute(): Promise<Payload> {
    return new Promise<Payload>(async (resolve, reject) => {
      try {
        const sourceData = (await this.getSourceData()) as SourceData[];
        const source = sourceData[0] as FinalResultInfo;
        resolve({ name: `${source.name} Santos` });
      } catch (err) {
        reject(err);
      }
    });
  }
}
