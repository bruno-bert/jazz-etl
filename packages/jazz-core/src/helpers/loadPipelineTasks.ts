/* eslint-disable guard-for-in */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
import ModuleLoader from "../core/ModuleLoader";
import setPluginConfigPath from "./setPluginConfigPath";
import setPluginSourcePath from "./setPluginSourcePath";
import { IsTask, IsLogger, IsPlugin } from "../types";

const loadPipelineTasks = (
  pipelineInfo: string[],
  pluginsConfigFromPackage: IsPlugin[],
  logger: IsLogger
) => {
  let tasks: IsTask[] = [];
  let pipelineTask = null;

  pipelineInfo.map(item => {
    const [source, pluginName, taskName] = String(item).split(":");
    const pluginConfigPath = setPluginConfigPath(source, pluginName);
    const pluginSourcePath = setPluginSourcePath(source, pluginName);
    const [pluginConfigFromPackage] = pluginsConfigFromPackage.filter(
      p => p.name === pluginName
    );

    const pluginConfig =
      source === "native"
        ? ModuleLoader.getInstance().loadFromInternalDependency(
            pluginConfigPath
          )
        : source === "this"
        ? ModuleLoader.getInstance().loadPlugin(pluginConfigPath)
        : ModuleLoader.getInstance().loadPluginFromPath(pluginConfigPath);

    let pluginPipeline: any;

    if (!pluginConfig) {
      const message = `LoadPipelineTasks - Cannot Instantiate configuration object of plugin ${pluginName}`;
      logger.error(message);
      throw new Error(message);
    }

    pluginPipeline = pluginConfig.pipeline;

    /** TODO - anys */
    if (taskName === "*") {
      pluginPipeline.map((p: any) => {
        [pipelineTask] = pluginPipeline.filter(
          (taskItem: any) => taskItem.id === p.id
        );
        pipelineTask.pluginSourcePath = pluginSourcePath;
        const taskConfigFromPackage: any =
          pluginConfigFromPackage && pluginConfigFromPackage.tasks
            ? pluginConfigFromPackage.tasks[p.id]
            : null;
        for (const param in taskConfigFromPackage) {
          if (taskConfigFromPackage.hasOwnProperty(param)) {
            pipelineTask[param] = taskConfigFromPackage[param];
          }
        }

        return pipelineTask;
      });

      tasks = [...tasks, ...pluginPipeline];
    } else {
      /** TODO - anys */
      [pipelineTask] = pluginPipeline.filter(
        (taskItem: any) => taskItem.id === taskName
      );
      pipelineTask.pluginSourcePath = pluginSourcePath;

      if (pipelineTask) {
        /** TODO - anys */
        const taskConfigFromPackage: any =
          pluginConfigFromPackage && pluginConfigFromPackage.tasks
            ? pluginConfigFromPackage.tasks[pipelineTask.id]
            : null;
        for (const param in taskConfigFromPackage) {
          if (taskConfigFromPackage.hasOwnProperty(param)) {
            pipelineTask[param] = taskConfigFromPackage[param];
          }
        }

        tasks.push(pipelineTask);
      } else {
        logger.warn(
          `Task ${taskName} not added to process pipeline since cannot be found`
        );
      }
    }
  });

  return tasks;
};

export default loadPipelineTasks;
