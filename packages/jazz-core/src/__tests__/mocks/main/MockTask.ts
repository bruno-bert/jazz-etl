import { Task } from "@core/task/Task";
import { SourceData, Payload } from "../../../types/core";

export class MockTask extends Task {
  execute(data: SourceData): Promise<Payload> {
    return new Promise<Payload>((resolve, reject) => {
      try {
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
}
