export const pluginDirectory = "native-plugins/jazz-plugin-xmltojson";
export const name = "jazz-plugin-xmltojson";

export const pipeline = [
  {
    id: "xml-to-json-object",
    description: " turns a xml file into a json Object",
    class: `${pluginDirectory}/XmlToJsonObjectTask`,
    params: ["source"]
  },
  {
    id: "json-to-file",
    description: " Turns a Json object into a file",
    class: `${pluginDirectory}/JsonObjectToFileTask`,
    params: ["output"]
  }
];

export const inputParameters = {
  sourceFile: {
    alias: "s",
    describe: "Source File",
    demandOption: true,
    default: "source.xml",
    name: "source"
  },
  outputFile: {
    alias: "o",
    describe: "Output File",
    demandOption: true,
    default: "output.json",
    name: "output"
  }
};
