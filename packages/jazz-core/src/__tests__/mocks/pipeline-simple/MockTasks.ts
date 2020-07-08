import { Task } from "@core/task/Task";
import { SourceData, Payload } from "../../../types/core";
import { sourceInfo, SourceTestInfo, FinalResultInfo } from "./Factory";

export class FirstTask extends Task {
  getSourceData(): Promise<SourceData[] | SourceData> {
    return new Promise<SourceData[] | SourceData>((resolve, reject) => {
      resolve(sourceInfo);
    });
  }
  execute(data: SourceData | SourceData[]): Promise<Payload> {
    return new Promise<Payload>(async (resolve, reject) => {
      const source: SourceTestInfo = data as SourceTestInfo;
      resolve({ name: `${source.firstName} ${source.lastName}` });
    });
  }
}

export class SecondTask extends Task {
  execute(data: SourceData | SourceData[]): Promise<Payload> {
    return new Promise<Payload>(async (resolve, reject) => {
      const source = (data as SourceData[])[0] as FinalResultInfo;
      resolve({ name: `${source.name} Silva` });
    });
  }
}
