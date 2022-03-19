import { legacyAccountBTC, segWitAccountBTC } from "@test/mocks/accounts";
import { generateAddressFromExtendedPubKey } from "@/addresses";

describe("Derivation", () => {
  it("should retrieve the correct legacy address for a given xpub", () => {
    expect(
      generateAddressFromExtendedPubKey(legacyAccountBTC.extendedKey, 0)
    ).toBe(legacyAccountBTC.addresses[0]);
  });

  it("should retrieve the correct (native) SegWit address for a given zpub", () => {
    expect(
      generateAddressFromExtendedPubKey(segWitAccountBTC.extendedKey, 0)
    ).toBe(segWitAccountBTC.addresses[0]);
  });

  it("should throw if index is 2^31", () => {
    expect(() =>
      generateAddressFromExtendedPubKey(segWitAccountBTC.extendedKey, 2 ** 31)
    ).toThrow("must be smaller");
  });
});
