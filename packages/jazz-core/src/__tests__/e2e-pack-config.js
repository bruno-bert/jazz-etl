//const defaultRelativePluginPath = "../..";
//const excelExtractorPluginPath = `${defaultRelativePluginPath}/jazz-plugin-excelextractor/dist`;

module.exports = {
  plugins: [
    {
      name: "jazz-plugin-xmltojson"
    }
  ],
  pipeline: [
    //`${excelExtractorPluginPath}:jazz-plugin-excelextractor:extract`,
    `native:jazz-plugin-xmltojson:xml-to-json-object`
  ]

  /*
  userInputParameters: {
    customer_country_code: {
      alias: "ccc",
      describe: "Customer Country Code",
      demandOption: false,
      default: "320"
    },
   
  }*/
};
