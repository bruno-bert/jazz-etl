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
      console.log("source info da primeira task", source);
      resolve({ name: `${source.firstName} ${source.lastName}` });
    });
  }
}

export class SecondTask extends Task {
  execute(): Promise<ResultData> {
    return new Promise<ResultData>(async (resolve, reject) => {
      console.log("pegando dados da segunda task");

      const sourceData = (await this.getSourceData()) as SourceData[];

      const source = sourceData[0] as FinalResultInfo;
      console.log(
        "executando a segunda task:" + JSON.stringify(sourceData, null, 2)
      );

      resolve({ name: `${source.name} Silva` });
    });
  }
}
