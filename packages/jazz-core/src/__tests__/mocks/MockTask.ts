import { Task } from "@core/task/Task";
import { ResultData } from "../../types/core";

export class MockTask extends Task {
  execute(): Promise<ResultData> {
    return new Promise<ResultData>((resolve, reject) => {
      try {
        const data = this.getSourceData();
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
}
