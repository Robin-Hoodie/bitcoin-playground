import { legacyAccountBTC } from "./mocks/accounts";
import { decodeExtendedKey } from "./extended-key";

const expectHexEqualsActual = (expected: Buffer, actual: string) =>
  expect(expected.toString("hex")).toBe(actual);

describe("XPub", () => {
  // BIP-32 Bitcoin Master Private Key
  it("should correctly decode the given extended private key", () => {
    const { version, depth, parentKeyFingerPrint, childIndex, chainCode, key } =
      decodeExtendedKey(
        // Generated from http://bip32.org/
        "xprv9s21ZrQH143K2JF8RafpqtKiTbsbaxEeUaMnNHsm5o6wCW3z8ySyH4UxFVSfZ8n7ESu7fgir8imbZKLYVBxFPND1pniTZ81vKfd45EHKX73"
      );
    expect(version).toBe("0488ade4");
    expect(depth).toBe("00");
    expect(parentKeyFingerPrint).toBe("00000000");
    expect(childIndex).toBe("00000000");
    expectHexEqualsActual(
      chainCode,
      "180c998615636cd875aa70c71cfa6b7bf570187a56d8c6d054e60b644d13e9d3"
    );
    expectHexEqualsActual(
      key,
      "005c22f8937210130ad1bbc50678a7c0a119a483d47928c323bf0baa3a57fa547d"
    );
  });

  // BIP-32 Bitcoin 3rd-level Public Key
  it("should correctly decode the given extended public key", () => {
    const { version, depth, parentKeyFingerPrint, childIndex, chainCode, key } =
      decodeExtendedKey(legacyAccountBTC.extendedKey);
    expect(version).toBe("0488b21e");
    expect(depth).toBe("03");
    expect(parentKeyFingerPrint).toBe("ae78ca03");
    expect(childIndex).toBe("80000000");
    expectHexEqualsActual(
      chainCode,
      "aac6c9b273c9ff45e46e322f7a5576c208fc78e09ddbfb1bdfb611b2cfe57ef1"
    );
    expectHexEqualsActual(
      key,
      "026ca80223a200272135312ddc0b9a02254b07d0dc8f6bb7e5e4917253b81c3c3c"
    );
  });
});
