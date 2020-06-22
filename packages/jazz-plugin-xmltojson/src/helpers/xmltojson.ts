import { readFileSync } from "fs";
import xml2js from "xml2js";

const xmltojson = (
  xmlPath: string,
  parseOptions = { explicitArray: false, mergeAttrs: true }
): Promise<any> => {
  const parser = new xml2js.Parser(parseOptions);

  try {
    const data = readFileSync(xmlPath);

    return new Promise((resolve, reject) => {
      parser.parseString(data, (err: any, json: any) => {
        if (err) reject(err);
        else resolve(json);
      });
    });
  } catch (err) {
    throw new Error(err.toString());
  }
};

export default xmltojson;
