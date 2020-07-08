import crypto from "crypto";

import bytesToUuid from "./bytesToUuid";
import { RandomOptions, RngOptions, InputBuffer } from "../../types/uuid";

function rng() {
  const rnds8 = new Uint8Array(16);
  return crypto.randomFillSync(rnds8);
}

export const createUUID = (
  options?: RandomOptions | RngOptions,
  buf?: InputBuffer,
  offset?: number
): string => {
  options = options || {};

  const rnds =
    (options as RandomOptions).random || ((options as RngOptions).rng || rng)();

  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  return bytesToUuid(rnds, offset);
};
