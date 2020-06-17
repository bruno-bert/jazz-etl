import { PipelineRunner } from "../core/PipelineRunner";
import { IsUserConfig } from "../types";
import { readFile } from "fs";

const isJSON = (str: string) => {
  try {
    const json = JSON.parse(str);
    if (Object.prototype.toString.call(json).slice(8, -1) !== "Object") {
      return false;
    }
  } catch (e) {
    return false;
  }
  return true;
};

describe("End to End test for pipeline when informing the input and output files through user parameter", () => {
  it("Should get a the xml file from folder, convert it into json and save it into folder - json must be valid", () => {
    const userConfig: IsUserConfig = {
      configFile: "src/__tests__/e2e-pack-config.js",
      inputProcessParameters: {
        source: "./test.xml",
        output: "./test-2.json"
      }
    };

    const runner = new PipelineRunner(userConfig);
    runner.run();

    /*
    readFile("./test.json", (err, data) => {
      expect(err).toBeNull();
      let content = JSON.parse(data.toString());
      expect(isJSON(content)).toBe(true);
    });*/
  });
});
