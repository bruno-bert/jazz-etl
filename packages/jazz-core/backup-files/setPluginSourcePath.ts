/* eslint-disable import/prefer-default-export */
export default (source: string, pluginName?: string) => {
  let result = null;
  if (source === "native") {
    result = `native-plugins/${pluginName}`;
    return result;
  }

  if (source === "this") {
    result = "src";
    return result;
  }

  result = source;
  return result;
};
