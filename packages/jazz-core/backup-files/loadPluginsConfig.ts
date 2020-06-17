/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
import ModuleLoader from "../core/ModuleLoader";
import setPluginConfigPath from "./setPluginConfigPath";
import _ from "lodash";
import { PluginConfiguration } from "../types";

const loadPluginsConfig = (pipelineInfo: string[]) => {
  const configs: PluginConfiguration[] = [];

  pipelineInfo.map(item => {
    const [source, pluginName] = String(item).split(":");
    const pluginPath = setPluginConfigPath(source, pluginName);

    const pluginConfig: PluginConfiguration =
      source === "native"
        ? ModuleLoader.getInstance().loadFromInternalDependency(pluginPath)
        : source === "this"
        ? ModuleLoader.getInstance().loadPlugin(pluginPath)
        : ModuleLoader.getInstance().loadPluginFromPath(pluginPath);

    if (!pluginConfig) {
      const message = `loadPluginsConfig - Cannot Instantiate configuration object of plugin ${pluginName}`;
      throw new Error(message);
    } else {
      configs.push(pluginConfig);
    }
  });

  return _.uniq(configs);
};

export default loadPluginsConfig;
