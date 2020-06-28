import { Plugin } from "@core/Plugin";
import { MockPipelineBuilder } from "./MockPipelineBuilder";

export class MockPlugin extends Plugin {
  constructor() {
    super(new MockPipelineBuilder());
  }
}
