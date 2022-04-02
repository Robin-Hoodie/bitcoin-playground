import { randomBytes } from "crypto";
import { pointMultiply } from "@/math";
import { ORDER, GENERATOR_POINT } from "@/constants/constants";
import { bufferToBigInt } from "@/utils";

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
