/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
/* eslint-disable import/no-dynamic-require */
import CoreConfiguration from "./CoreConfiguration";
import requireFromString from "require-from-string";
import { LoadModuleStrategy } from "../types";

export class ModuleLoadedFromInternal implements LoadModuleStrategy {
  constructor() {}
  load(name: string) {
    return require(`../${name}`);
  }
}

export class ModuleLoadedFromExternal implements LoadModuleStrategy {
  constructor() {}
  load(name: string) {
    const module = require(`${process.cwd()}/${name}`);
    return module;
  }
}

export class ModuleLoadedFromPath implements LoadModuleStrategy {
  constructor() {}
  load(name: string) {
    const module = require(name);
    return module;
  }
}

export class ModuleLoadedFromMemory implements LoadModuleStrategy {
  constructor() {}
  load(code: string, appendPaths: string[]) {
    return requireFromString(code, { appendPaths });
  }
}

class ModuleLoader {
  private static instance: ModuleLoader;
  private strategy: LoadModuleStrategy;
  private fromMemoryLoader: LoadModuleStrategy;
  private fromInternalLoader: LoadModuleStrategy;
  private fromExternalLoader: LoadModuleStrategy;
  private fromPathLoader: LoadModuleStrategy;

  private constructor(
    strategy: LoadModuleStrategy = new ModuleLoadedFromExternal()
  ) {
    this.strategy = strategy;

    this.fromMemoryLoader = new ModuleLoadedFromMemory();
    this.fromInternalLoader = new ModuleLoadedFromInternal();
    this.fromExternalLoader = new ModuleLoadedFromExternal();
    this.fromPathLoader = new ModuleLoadedFromPath();
  }

  static getInstance(): ModuleLoader {
    if (!ModuleLoader.instance) {
      ModuleLoader.instance = new ModuleLoader(
        CoreConfiguration.moduleLoadStrategy || new ModuleLoadedFromExternal()
      );
    }
    return ModuleLoader.instance;
  }

  load(name: string | Function | {}) {
    return this.strategy.load(name);
  }

  loadPackage(name: string | Function) {
    return CoreConfiguration.featureFlags.detachJazzPack
      ? this.strategy.load(name)
      : this.loadFromInternalDependency(name);
  }

  loadPackageFromMemory(code: string | Function, appendPaths: string[]) {
    return this.fromMemoryLoader.load(code, appendPaths);
  }

  /** TODO */
  loadPlugin(name: string | Function): any {
    return CoreConfiguration.featureFlags.detachPluginOnPackage
      ? this.strategy.load(name)
      : this.loadFromInternalDependency(name);
  }

  /** TODO */
  loadPluginFromPath(name: string | Function): any {
    return this.fromPathLoader.load(name);
  }

  loadFunction(name: string | Function | {}) {
    return CoreConfiguration.featureFlags.detachFunctionOnPackage
      ? this.strategy.load(name)
      : this.loadFromInternalDependency(name);
  }

  loadFromInternalDependency(name: string | Function | {}) {
    return this.fromInternalLoader.load(name);
  }

  loadFromExternalDependency(name: string | Function | {}) {
    return this.fromExternalLoader.load(name);
  }
}

export default ModuleLoader;
