// eslint-disable-next-line import/prefer-default-export
export { default as setPluginConfigPath } from "./setPluginConfigPath";
export { default as loadPipelineTasks } from "./loadPipelineTasks";
export { default as loadPluginsConfig } from "./loadPluginsConfig";

//export { default as encrypter, decrypter, decryptToString } from "./encryption";
//export { default as requireFromString } from "./requireFromString";

export const isFunction = (object: any) => typeof object === "function";
export const isNative = (className: string) =>
  String(className).indexOf("native") !== -1;
export const isThis = (className: string) =>
  String(className).indexOf("src") !== -1;

export const isPreTask = (name: string) => name.indexOf("pre-") !== -1;
export const isPostTask = (name: string) => name.indexOf("post-") !== -1;
export const isPreOrPostTask = (name: string) =>
  isPreTask(name) || isPostTask(name);

export const determineSource = (className: string) => {
  if (isNative(className)) {
    return "native";
  }

  if (isThis(className)) {
    return "this";
  }

  return className;
};
