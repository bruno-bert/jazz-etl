/* eslint-disable no-nested-ternary */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-restricted-syntax */
/* eslint-disable array-callback-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
import ModuleLoader from "./ModuleLoader";
import Pipeline from "./Pipeline";
import CoreConfiguration from "./CoreConfiguration";

import { loadPipelineTasks, isFunction, isNative, isThis } from "../helpers";
import {
  IsLogger,
  IsTaskRunner,
  IsPipeline,
  Configuration,
  IsTask
} from "../types";

class TaskRunner implements IsTaskRunner {
  private logger: IsLogger;
  private pipeline: IsPipeline;

  /** TODO - anys */
  constructor(taskParameters: {}, taskConfig: Configuration) {
    this.logger = taskConfig.logger;
    this.pipeline = this.createPipeline(taskParameters, taskConfig);
  }

  /** TODO - anys */
  createPipeline(taskParameters: {}, taskConfig: Configuration): IsPipeline {
    /** TODO - anys */
    let TaskClass: any = null;
    let taskInstance: any = null;

    Pipeline.getInstance().clear();

    /* TODO - anys */
    const pipeline = loadPipelineTasks(
      taskConfig.pipelineConfiguration.pipeline,
      taskConfig.pipelineConfiguration.plugins,
      this.logger
    );

    if (pipeline) {
      /* TODO - anys */
      pipeline.map((task: any) => {
        if (!task.skip) {
          let source = `${task.pluginSourcePath}/${task.class}`;
          source = isNative(source) ? task.class : source;

          try {
            TaskClass = isNative(source)
              ? ModuleLoader.getInstance().loadFromInternalDependency(
                  task.class
                )
              : isThis(source)
              ? ModuleLoader.getInstance().loadPlugin(source)
              : ModuleLoader.getInstance().loadPluginFromPath(source);
          } catch (err) {
            this.logger.error(
              `Error on trying to instantiate the task ${source}: ${err}`
            );
          }

          console.warn(TaskClass);

          if (TaskClass) {
            taskInstance = new TaskClass(
              task.id,
              taskParameters,
              taskConfig,
              task.description,
              task.rawDataFrom
            );

            /**  handles methods ovewrites  */
            if (CoreConfiguration.featureFlags.allowOvewriteExecute) {
              taskInstance.preExecute = task.preExecute
                ? task.preExecute
                : taskInstance.preExecute;
              taskInstance.execute = task.execute
                ? task.execute
                : taskInstance.execute;
              taskInstance.postExecute = task.postExecute
                ? task.postExecute
                : taskInstance.postExecute;

              if (task.preExecute) {
                if (isFunction(task.preExecute)) {
                  taskInstance.preExecute = task.preExecute;
                } else
                  taskInstance.preExecute = ModuleLoader.getInstance().load(
                    task.preExecute
                  );
              }

              if (task.execute) {
                if (isFunction(task.execute)) {
                  taskInstance.execute = task.execute;
                } else
                  taskInstance.execute = ModuleLoader.getInstance().load(
                    task.execute
                  );
              }

              if (task.postExecute) {
                if (isFunction(task.postExecute)) {
                  taskInstance.postExecute = task.postExecute;
                } else
                  taskInstance.postExecute = ModuleLoader.getInstance().load(
                    task.postExecute
                  );
              }
            }

            if (task.getRawData) {
              if (isFunction(task.getRawData)) {
                taskInstance.getRawData = task.getRawData;
              } else
                taskInstance.getRawData = ModuleLoader.getInstance().load(
                  task.getRawData
                );
            }

            if (task.ovewritables) {
              task.ovewritables.map((method: string) => {
                if (task[method]) {
                  if (isFunction(task[method]))
                    taskInstance[method] = task[method];
                  else
                    taskInstance[method] = ModuleLoader.getInstance().load(
                      task[method]
                    );
                }
              });
            }

            taskInstance.subscribe(this);

            Pipeline.getInstance().addTask(taskInstance);
          } else {
            this.logger.warn(
              `Task named ${task.class} cannot be instantianted`
            );
          }
        } else {
          this.logger.info(`Task named ${task.id} skipped`);
        }

        return Pipeline.getInstance();
      });
    }

    this.logger.info("Pipeline" + Pipeline.getInstance());
    return Pipeline.getInstance();
  }

  async run() {
    if (this.pipeline && this.pipeline.items) {
      for (let i = 0, len = this.pipeline.items.length; i < len; i++) {
        await this.pipeline.items[i].run();
      }
    }
  }

  onError(err: string) {
    this.logger.error(err);
    throw new Error(err);
  }

  onSuccess(data: any) {
    this.logger.info("Task completed sucessfully");
  }
}

export default TaskRunner;
