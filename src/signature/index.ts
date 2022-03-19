import { modInv } from "bigint-mod-arith";
import { bufferToBigInt, modulo, extractX } from "@/utils";
import { generatePrivateKey } from "@/keys";
import {
  pointMultiply,
  pointAdd,
} from "@/math";
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
    modInv(randomNumber, ORDER) *
      (bufferToBigInt(hashOfMessage) + privateKeyAsNumber * randomNumber),
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
    sModInverse * bufferToBigInt(hashOfMessage)
  );
  const pointTwo = pointMultiply(publicKey, sModInverse * r);
  const pointResult = pointAdd(pointOne, pointTwo);
  console.log("Resulting point X:", extractX(pointResult));
  console.log("Signature R      :", r);
  return extractX(pointResult) === r;
};
