/* eslint-disable import/prefer-default-export */
export default {
  configFile: {
    alias: "c",
    describe: "Jazzpack Configuration File",
    demandOption: true
  },
  debugMode: {
    alias: "d",
    describe: "Debug mode",
    default: "false"
  },
  logStrategy: {
    alias: "l",
    describe: "Log Strategy",
    demandOption: false,
    default: "toConsole"
  },
  decryptKey: {
    alias: "k",
    describe: "Decrypt Key to JazzPack",
    demandOption: false,
    default: null
  }
};
