export const encrypter = async () => {
  const Cryptr = require("cryptr");
  const cryptr = new Cryptr("JazzIsAwesome");
  const fs = require("fs");
  const configFile = "./src/__tests__/pack-config.js";
  const encryptedFile = "./src/__tests__/pack-config.sec";
  fs.readFile(configFile, "utf8", (err, code) => {
    if (!err) {
      const encrypted = cryptr.encrypt(code);
      fs.writeFile(encryptedFile, encrypted, errWrite => {
        if (errWrite) {
          console.error("Error on trying to write encrypted file", errWrite);
        }
      });
    } else {
      console.error("Error on trying to read file to encrypt", err);
    }
  });
};

export const decrypter = async (encryptedFile, key) => {
  const configFile = "./src/__tests__/pack-config.js";
  const fs = require("fs");
  const Cryptr = require("cryptr");
  const cryptr = new Cryptr(key);
  fs.readFile(encryptedFile, (err, encrypted) => {
    if (!err) {
      const code = cryptr.decrypt(encrypted);
      fs.writeFile(configFile, code, errWrite => {
        if (errWrite) {
          console.error("Error on trying to write decrypted file", errWrite);
        }
      });
    } else {
      console.error("Error on trying to read file to decrypt", err);
    }
  });
};

export const decryptToString = (encryptedFile, key) => {
  const fs = require("fs");
  const Cryptr = require("cryptr");
  const cryptr = new Cryptr(key);
  const encrypted = fs.readFileSync(encryptedFile);
  return cryptr.decrypt(encrypted);
};
