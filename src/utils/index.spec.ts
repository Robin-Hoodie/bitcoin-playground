import { ORDER } from "../secp256k1-math";
import { hash160, bufferToBigInt, bufferToBinaryString } from ".";

describe("Crypto Utils", () => {
  it("should retrieve the correct hash for a given public key", () => {
    const pubKey = Buffer.from(
      "034e017c6ad98c83241db7f9f0e0c8f552cd4ce60023ac10230136d3480a4d9e97",
      "hex"
    );
    expect(hash160(pubKey).toString("hex")).toBe(
      "9cbbf17cc7ba64c3cd56b9dddac33d7e6c86ab93"
    );
  });
  it("should convert the buffer to a bigint with the value 16", () => {
    const buffer = Buffer.from("10", "hex");
    expect(bufferToBigInt(buffer)).toBe(16n);
  });

  it("should convert only the middle 2 digits of the buffer to a bigint with the value of 16", () => {
    const buffer = Buffer.from("10001010", "hex");
    // 1 byte per 2 hex chars, so the chars "0010" should be converted
    expect(bufferToBigInt(buffer, 1, 3)).toBe(16n);
  });

  it("should convert the buffer to a binary string of 0s and 1s", () => {
    const buffer = Buffer.from(ORDER.toString(16), "hex");
    expect(bufferToBinaryString(buffer)).toBe(
      "1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111010111010101011101101110011100110101011110100100010100000001110111011111111010010010111101000110011010000001101100100000101000001"
    );
  });
});
