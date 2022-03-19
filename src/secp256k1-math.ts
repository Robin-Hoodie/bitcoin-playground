import { modInv, modPow } from "bigint-mod-arith";
import { bufferToBigInt, extractX, extractY, modulo } from "./utils";
import type { Bit } from "./types";

export const ORDER =
  115792089237316195423570985008687907852837564279074904382605163141518161494337n;

export const PRIME_MODULUS =
  2n ** 256n -
  2n ** 32n -
  2n ** 9n -
  2n ** 8n -
  2n ** 7n -
  2n ** 6n -
  2n ** 4n -
  1n;

export const GENERATOR_POINT = Buffer.from(
  "0479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8",
  "hex"
);

const bitLengthCompressedPoint = 264;
const bitLengthUncompressedPoint = 520;

const extractCoordinates = (point: Buffer) => {
  return {
    x: extractX(point),
    y: extractY(point),
  };
};

const bigIntTo32ByteHex = (number: bigint) =>
  number.toString(16).padStart(64, "0");

const isEven = (number: bigint) => modulo(number, 2n) === 0n;
const isOdd = (number: bigint) => modulo(number, 2n) === 1n;

const pointIsCompressed = (point: Buffer) => {
  const prefix = point.slice(0, 1).toString("hex");
  if (prefix === "02" || prefix === "03") {
    if (point.length === bitLengthCompressedPoint / 8) {
      return true;
    }
    throw new Error(
      `Point ${point.toString(
        "hex"
      )} has the correct prefix (${prefix}) but does not have a length of ${bitLengthCompressedPoint} bits (${
        point.length * 8
      } bits)`
    );
  }
  if (prefix === "04") {
    if (point.length === bitLengthUncompressedPoint / 8) {
      return false;
    }
    throw new Error(
      `Point ${point.toString(
        "hex"
      )} has the correct prefix (${prefix}) but does not have a length of ${bitLengthUncompressedPoint} bits (${
        point.length * 8
      })`
    );
  }
  throw new Error(
    `Point ${point.toString("hex")} does not have a '02', '03' or '04' prefix`
  );
};

// See https://learnmeabitcoin.com/technical/public-key#how-to-decompress-a-public-key
const uncompressPoint = (point: Buffer) => {
  if (!pointIsCompressed(point)) {
    return point;
  }
  const prefix = point.slice(0, 1).toString("hex");
  const x = extractX(point);
  const ySquared = modulo(x ** 3n + 7n);
  let y = modPow(ySquared, (PRIME_MODULUS + 1n) / 4n, PRIME_MODULUS);
  if (prefix === "02" && isOdd(y)) {
    y = modulo(PRIME_MODULUS - y);
  }
  if (prefix === "03" && isEven(y)) {
    y = modulo(PRIME_MODULUS - y);
  }
  return Buffer.concat([
    Buffer.from("04", "hex"),
    Buffer.from(bigIntTo32ByteHex(x), "hex"),
    Buffer.from(bigIntTo32ByteHex(y), "hex"),
  ]);
};

const pointAsBuffer = (pointX: bigint, pointY: bigint, compressed: boolean) => {
  const pointXHex = bigIntTo32ByteHex(pointX);
  if (compressed) {
    const prefix = isEven(pointY) ? "02" : "03";
    return Buffer.from(`${prefix}${pointXHex}`, "hex");
  }
  const prefix = "04";
  const pointYHex = bigIntTo32ByteHex(pointY);
  return Buffer.from(`${prefix}${pointXHex}${pointYHex}`, "hex");
};

export const pointDouble = (
  point: Buffer,
  { compressed } = { compressed: false }
) => {
  const pointUncompressed = uncompressPoint(point);
  const { x, y } = extractCoordinates(pointUncompressed);
  const slope = modulo(3n * x ** 2n * modInv(2n * y, PRIME_MODULUS));
  const doubledPointX = modulo(slope ** 2n - 2n * x);
  const doubledPointY = modulo(slope * (x - doubledPointX) - y);
  return pointAsBuffer(doubledPointX, doubledPointY, compressed);
};

export const pointAdd = (
  pointOne: Buffer,
  pointTwo: Buffer,
  { compressed } = { compressed: false }
) => {
  if (pointOne.equals(pointTwo)) {
    return pointDouble(pointOne, { compressed });
  }
  const pointOneUncompressed = uncompressPoint(pointOne);
  const pointTwoUncompressed = uncompressPoint(pointTwo);
  const { x: pointOneX, y: pointOneY } =
    extractCoordinates(pointOneUncompressed);
  const { x: pointTwoX, y: pointTwoY } =
    extractCoordinates(pointTwoUncompressed);
  const slope = modulo(
    (pointOneY - pointTwoY) * modInv(pointOneX - pointTwoX, PRIME_MODULUS)
  );
  const sumPointX = modulo(slope ** 2n - pointOneX - pointTwoX);
  const sumPointY = modulo(slope * (pointOneX - sumPointX) - pointOneY);
  return pointAsBuffer(sumPointX, sumPointY, compressed);
};

export const pointMultiply = (
  point: Buffer,
  multiplier: number | bigint | Buffer,
  { compressed } = { compressed: false }
) => {
  let multiplierAsBinaryString: string;
  if (multiplier instanceof Buffer) {
    multiplierAsBinaryString = bufferToBigInt(multiplier).toString(2);
  } else {
    // For scalar === 149 => '10010101'
    multiplierAsBinaryString = multiplier.toString(2);
  }
  const bits = multiplierAsBinaryString
    .slice(1) // '10010101' => '0010101'
    .split("") as Bit[]; // '0010101' => ['0', '0', '1', '0', '1', '0', '1']
  return bits.reduce((accPoint, bit, index, bitArray) => {
    const isLastBit = index === bitArray.length - 1;
    // Can use uncompressed points for small perf boost in intermediate calculations
    const compressPoint = isLastBit ? { compressed } : { compressed: false };
    const pointDoubled = pointDouble(accPoint, compressPoint);
    if (bit === "1") {
      return pointAdd(pointDoubled, point, compressPoint);
    }
    return pointDoubled;
  }, point);
};

interface Signature {
  r: bigint;
  s: bigint;
}

export const sign = (privateKey: bigint, hashOfMessage: Buffer): Signature => {
  const randomNumber = generateRandomNumberWithinBounds();
  const randomPoint = pointMultiply(GENERATOR_POINT, randomNumber);
  const randomPointX = extractX(randomPoint);
  const r = modulo(randomPointX, ORDER);
  const s = modulo(
    modInv(randomNumber, ORDER) *
      (bufferToBigInt(hashOfMessage) + privateKey * randomNumber),
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
