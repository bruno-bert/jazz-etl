import { Plugin } from "@core/plugin/Plugin";
import { MockPipelineBuilder } from "./MockPipelineBuilder";

export class MockPlugin extends Plugin {
  constructor() {
    super(new MockPipelineBuilder());
  }
}
