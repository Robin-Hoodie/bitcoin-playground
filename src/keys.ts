import { randomBytes } from "crypto";
import { pointMultiply } from "./secp256k1-math";
import { ORDER, GENERATOR_POINT } from "./utils/constants-secp-256k1";
import { bufferToBigInt } from "./utils";

interface OptionsCompression {
  compressed: boolean;
}

export const isPrivateKeyValid = (privateKey: Buffer) =>
  bufferToBigInt(privateKey) <= ORDER - 1n;

export const generatePrivateKey = () => {
  while (true) {
    const privateKey = randomBytes(32);
    if (isPrivateKeyValid(privateKey)) {
      return privateKey;
    }
  }
};

export const generatePublicKey = (
  privateKey: Buffer,
  optionsCompression?: OptionsCompression
) => pointMultiply(GENERATOR_POINT, privateKey, optionsCompression);

export const generateKeyPair = (optionsCompression?: OptionsCompression) => {
  const privateKey = generatePrivateKey();
  const publicKey = generatePublicKey(privateKey, optionsCompression);
  return {
    privateKey,
    publicKey,
  };
};
