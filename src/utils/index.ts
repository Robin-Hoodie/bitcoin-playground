import { createHash } from "crypto";
import { PRIME_MODULUS } from "@/constants";

export const hash160 = (data: Uint8Array) => {
  const innerHash = createHash("sha256").update(data).digest();
  return createHash("ripemd160").update(innerHash).digest();
};

export const bufferToBigInt = (
  buffer: Buffer,
  start = 0,
  end = buffer.length
) => BigInt(`0x${buffer.slice(start, end).toString("hex")}`);

export const bufferToBinaryString = (buffer: Buffer) =>
  bufferToBigInt(buffer).toString(2);

export const extractX = (point: Buffer) =>
  bufferToBigInt(point, 1, 1 + 256 / 8);
export const extractY = (point: Buffer) => bufferToBigInt(point, 1 + 256 / 8);

/**
 * This accounts for modulo of negative numbers, see below:
 * https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers#answer-17323608
 **/
export const modulo = (number: bigint, modulus = PRIME_MODULUS) =>
  ((number % modulus) + modulus) % modulus;
