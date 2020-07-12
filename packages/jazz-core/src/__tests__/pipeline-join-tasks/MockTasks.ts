import { Task } from "@core/task/Task";
import { SourceData, Payload } from "../../types/core";
import _ from "lodash";

export const sourceInfo1 = { userId: "12345", email: "john.doe@test.com" };
export const sourceInfo2 = { userId: "12345", address: "Test Avenue" };

export const sourceInfoArray1 = [
  { userId: "12345", email: "john.doe@test.com" },
  { userId: "6789", email: "mary.jane@test.com" }
];
export const sourceInfoArray2 = [
  { userId: "12345", address: "Test Avenue" },
  { userId: "6789", address: "Test Avenue 2" }
];

export class LeftTask extends Task {
  getSourceData(): Promise<SourceData[]> {
    return new Promise((resolve, reject) => {
      resolve([{ payload: sourceInfo1 }]);
    });
  }
}

export class RightTask extends Task {
  getSourceData(): Promise<SourceData[]> {
    return new Promise((resolve, reject) => {
      resolve([{ payload: sourceInfo2 }]);
    });
  }
}

export class JoinTask extends Task {
  private left: Payload;
  private right: Payload;

  resolveDependencies(data: SourceData[]) {
    const leftDep = this.dependencies?.find(dep => dep.label === "left");
    const rightDep = this.dependencies?.find(dep => dep.label === "right");

    this.left = data.filter(
      source =>
        source?.taskId === leftDep?.taskId &&
        source?.property === leftDep?.property
    );

    this.right = data.filter(
      source =>
        source?.taskId === rightDep?.taskId &&
        source?.property === rightDep?.property
    );
  }

  execute(data: SourceData | SourceData[]): Promise<Payload> {
    return new Promise<Payload>(async (resolve, reject) => {
      this.resolveDependencies(data as SourceData[]);

      const joinLeft = (left: any, right: any) => {
        return _.map(left, function(obj: any) {
          return _.assign(obj, _.find(right, { userId: obj.userId }));
        });
      };

      const joinRight = (left: any, right: any) => {
        return _.map(left, function(obj: any) {
          return _.assign(obj, _.find(right, { userId: obj.userId }));
        });
      };

      const joinAll = (left: any, right: any) => {
        return _.map(left, function(obj: any) {
          return _.assign(obj, _.find(right, { userId: obj.userId }));
        });
      };

      const joinLeftResult = joinLeft(this.left, this.right);
      const joinRightResult = joinRight(this.left, this.right);
      const joinAllResult = joinAll(this.left, this.right);

      console.log("left", this.left);
      console.log("right", this.right);
      console.log("joinLeftResult", joinLeftResult);
      resolve(joinLeftResult);
    });
  }
}
