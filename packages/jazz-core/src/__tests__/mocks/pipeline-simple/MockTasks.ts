import { Task } from "@core/Task";
import { SourceData, ResultData } from "../../../types/core";
import { sourceInfo, SourceTestInfo, FinalResultInfo } from "./Factory";

export class FirstTask extends Task {
  getSourceData(): Promise<SourceData[] | SourceData> {
    return new Promise<SourceData[] | SourceData>((resolve, reject) => {
      resolve(sourceInfo);
    });
  }
  execute(): Promise<ResultData> {
    return new Promise<ResultData>(async (resolve, reject) => {
      const source: SourceTestInfo = (await this.getSourceData()) as SourceTestInfo;
      resolve({ name: `${source.firstName} ${source.lastName}` });
    });
  }
}

export class SecondTask extends Task {
  execute(): Promise<ResultData> {
    return new Promise<ResultData>(async (resolve, reject) => {
      const sourceData = (await this.getSourceData()) as SourceData[];
      const source = sourceData[0] as FinalResultInfo;
      resolve({ name: `${source.name} Silva` });
    });
  }
}
