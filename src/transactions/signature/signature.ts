import { modInv } from "bigint-mod-arith";
import { bufferToBigInt, modulo, extractX } from "@/utils";
import { generatePrivateKey } from "@/keys";
import { pointMultiply, pointAdd } from "@/math";
import { ORDER, GENERATOR_POINT } from "@/constants/constants";

export const sign = (hashOfMessage: Buffer, privateKey: Buffer): Buffer => {
  const randomNumber = bufferToBigInt(generatePrivateKey());
  if (randomNumber === 0n) {
    return sign(hashOfMessage, privateKey);
  }
  const randomPoint = pointMultiply(GENERATOR_POINT, randomNumber);
  const randomPointX = extractX(randomPoint);
  const privateKeyAsNumber = bufferToBigInt(privateKey);
  if (randomPointX === 0n) {
    return sign(hashOfMessage, privateKey);
  }
  const r = modulo(randomPointX, ORDER);
  const s = modulo(
    modInv(randomNumber, ORDER) *
      (bufferToBigInt(hashOfMessage) + r * privateKeyAsNumber),
    ORDER
  );

  // See https://learnmeabitcoin.com/technical/ecdsa#signing-step-6
  const sLow = s > ORDER / 2n ? ORDER - s : s;
  return Buffer.concat([
    Buffer.from(r.toString(16).padStart(64, "0"), "hex"),
    Buffer.from(sLow.toString(16).padStart(64, "0"), "hex"),
  ]);
};

export const verify = (
  hashOfMessage: Buffer,
  publicKey: Buffer,
  signature: Buffer
) => {
  const r = bufferToBigInt(signature, 0, 32);
  const s = bufferToBigInt(signature, 32);
  const sModInverse = modInv(s, ORDER);
  const pointOne = pointMultiply(
    GENERATOR_POINT,
    bufferToBigInt(hashOfMessage) * sModInverse
  );
  const pointTwo = pointMultiply(publicKey, r * sModInverse);
  const pointResult = pointAdd(pointOne, pointTwo);
  return extractX(pointResult) === r;
};
