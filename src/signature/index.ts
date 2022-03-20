import { modInv } from "bigint-mod-arith";
import { bufferToBigInt, modulo, extractX } from "@/utils";
import { generatePrivateKey } from "@/keys";
import { pointMultiply, pointAdd } from "@/math";
import { ORDER, GENERATOR_POINT } from "@/constants";

interface Signature {
  r: bigint;
  s: bigint;
}

export const sign = (privateKey: Buffer, hashOfMessage: Buffer): Signature => {
  const randomNumber = bufferToBigInt(generatePrivateKey());
  const randomPoint = pointMultiply(GENERATOR_POINT, randomNumber);
  const randomPointX = extractX(randomPoint);
  const privateKeyAsNumber = bufferToBigInt(privateKey);
  const r = modulo(randomPointX, ORDER);
  const s = modulo(
    (privateKeyAsNumber * randomNumber + bufferToBigInt(hashOfMessage)) *
      modInv(randomNumber, ORDER),
    ORDER
  );
  return {
    r,
    s,
  };
};

export const verify = (
  publicKey: Buffer,
  hashOfMessage: Buffer,
  { r, s }: Signature
) => {
  const sModInverse = modInv(s, ORDER);
  const pointOne = pointMultiply(
    GENERATOR_POINT,
    bufferToBigInt(hashOfMessage) * sModInverse
  );
  const pointTwo = pointMultiply(publicKey, r * sModInverse);
  const pointResult = pointAdd(pointOne, pointTwo);
  return extractX(pointResult) === r;
};
