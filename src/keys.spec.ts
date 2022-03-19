import { generatePublicKey, isPrivateKeyValid, generateKeyPair } from "./keys";
import { ORDER } from "./utils/constants-secp-256k1";

describe("Keys", () => {
  // The private/public keypairs below was generated with https://learnmeabitcoin.com/technical/public-key
  it("should generate a valid public key for a given private key", () => {
    const privateKey = Buffer.from(
      "9b42f1605843799c63211d3c0b7762bec595ef0085dbe65464dd9a84b7082325",
      "hex"
    );
    expect(
      generatePublicKey(privateKey, { compressed: true }).toString("hex")
    ).toBe(
      "03762bf0ed0d89ccb415e84cadf3dfa607c01c676bf1496665376d85082edfe35a"
    );
  });

  it("should return false for a private key that is equal to the order of the secp256k1 curve", () => {
    const privateKey = Buffer.from(ORDER.toString(16), "hex");
    expect(isPrivateKeyValid(privateKey)).toBe(false);
  });

  it("should return true for a private key that is equal to 1 less than the order of the secp256k1 curve", () => {
    const privateKey = Buffer.from((ORDER - 1n).toString(16), "hex");
    expect(isPrivateKeyValid(privateKey)).toBe(true);
  });
});
