import { createHash } from "crypto";

export const hash160 = (data: Uint8Array) => {
  const innerHash = createHash("sha256").update(data).digest();
  return createHash("ripemd160").update(innerHash).digest();
};

export const bufferToBigInt = (
  buffer: Buffer,
  start = 0,
  end = buffer.length
) => BigInt(`0x${buffer.slice(start, end).toString("hex")}`);
