import { writeFile } from "fs";

const jsontofile = (jsonObject: {}, outputFile: string) => {
  writeFile(outputFile, JSON.stringify(jsonObject, null, 2), err => {
    if (err) throw new Error(err.toString());
  });
};

export default jsontofile;
