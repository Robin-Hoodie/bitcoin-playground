import { randomBytes } from "crypto";
import { ORDER } from "./secp256k1-math";
import { bufferToBigInt } from "./utils";

export const generateRandomNumberWithinBounds = (bounds = ORDER - 1n) => {
  let privateKey;
  while (!privateKey || privateKey > bounds) {
    privateKey = bufferToBigInt(randomBytes(32));
  }
  return privateKey;
};
