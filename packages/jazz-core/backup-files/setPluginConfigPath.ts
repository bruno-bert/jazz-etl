/* eslint-disable import/prefer-default-export */
import setPluginSourcePath from "./setPluginSourcePath";

export default (source: string, pluginName: string) => {
  let result = "";

  if (source === "native") {
    result = `${String(setPluginSourcePath(source, pluginName))}/config`;
  } else if (source === "this") {
    result = "src/config";
  } else {
    result = `${String(setPluginSourcePath(source))}/config`;
  }

  return result;
};
