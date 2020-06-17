import ConfigInfo from "../core/ConfigInfo";

/** TODO - define config info type/interface */
export const createConfigInfo = (
  configFile: string,
  log: string = "toConsole",
  debug: boolean = false,
  decryptKey: string | null = null
) =>
  new ConfigInfo({
    configFile,
    log,
    debug,
    decryptKey
  });

module.exports = createConfigInfo;
