import { PipelineRunner } from "@jazz-etl/jazz-core/PipelineRunner/dist";
import { XmlToJsonObjectTask } from "../src/core/XmlToJsonObjectTask";

describe("End to End test for pipeline", () => {
  it("Should get a the xml file from folder, convert it into json object", () => {
    const runner = new PipelineRunner({
      pipeline: [new XmlToJsonObjectTask({ source: "./test/xml" })]
    });

    runner.run();
  });
});
