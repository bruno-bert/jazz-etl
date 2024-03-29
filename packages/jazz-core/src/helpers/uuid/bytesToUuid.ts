import { InputBuffer } from "../../types/uuid";

const byteToHex: any = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function bytesToUuid(buf: InputBuffer, offset_?: number) {
  const offset = offset_ || 0;

  return (
    byteToHex[buf[offset + 0]] +
    byteToHex[buf[offset + 1]] +
    byteToHex[buf[offset + 2]] +
    byteToHex[buf[offset + 3]] +
    "-" +
    byteToHex[buf[offset + 4]] +
    byteToHex[buf[offset + 5]] +
    "-" +
    byteToHex[buf[offset + 6]] +
    byteToHex[buf[offset + 7]] +
    "-" +
    byteToHex[buf[offset + 8]] +
    byteToHex[buf[offset + 9]] +
    "-" +
    byteToHex[buf[offset + 10]] +
    byteToHex[buf[offset + 11]] +
    byteToHex[buf[offset + 12]] +
    byteToHex[buf[offset + 13]] +
    byteToHex[buf[offset + 14]] +
    byteToHex[buf[offset + 15]]
  ).toLowerCase();
}

export default bytesToUuid;
