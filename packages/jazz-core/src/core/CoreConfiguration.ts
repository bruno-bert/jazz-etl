import { ModuleLoadedFromExternal } from "./ModuleLoader";
import { DefaultLogger } from "./Logger";
import { CoreConfigurationType } from "../types";

const CoreConfiguration: CoreConfigurationType = {
  env: "production",
  defaultKey: "JazzIsAwesome",
  logStrategy: DefaultLogger.getInstance(),
  moduleLoadStrategy: null, //new ModuleLoadedFromExternal(),
  featureFlags: {
    detachPluginOnPackage: true,
    detachFunctionOnPackage: true,
    detachJazzPack: true,
    allowOvewriteExecute: true
  }
};

export default CoreConfiguration;
