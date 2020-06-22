/* eslint-disable no-param-reassign */
/* eslint-disable array-callback-return */
/* eslint-disable class-methods-use-this */

import { name as pluginName } from "./config";
import { xmltojson } from "./helpers";
//import { Task } from "../../core/Task";
import { Task } from "@core/Task";
import { Configuration, IsPlugin } from "../../types";
import { XmlToJsonObjectTaskParameters } from "./src/types";

export class XmlToJsonObjectTask extends Task {
  private sourceFile: string;
  private plugin: IsPlugin;

  constructor(
    id: string,
    description: string = "",
    params: XmlToJsonObjectTaskParameters,
    config: Configuration,
    rawDataFrom: any = null
  ) {
    super(id, params, config, description, rawDataFrom);

    [this.plugin] = this.config.plugins.filter(
      plugin => plugin.name === pluginName
    );

    this.sourceFile = params.source;
    XmlToJsonObjectTask.validateParameters(params);
  }

  execute() {
    const { sourceFile } = this;

    return new Promise<any>(async (resolve, reject) => {
      try {
        let result = await xmltojson(sourceFile);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  static validateParameters({ source }: XmlToJsonObjectTaskParameters) {
    if (!source) {
      throw new TypeError("Source file is required");
    }
  }
}
