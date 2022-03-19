import { pubKeyToSegwitAddress, pubKeyToLegacyAddress } from "@/addresses";
import { legacyAccountBTC, segWitAccountBTC } from "@test/mocks/accounts";

describe("Addressses", () => {
  describe("pubKeyToLegacyAddress", () => {
    it("should retrieve the correct legacy (P2PKH) address for a given public key", () => {
      const pubKey = Buffer.from(legacyAccountBTC.publicKeys[0], "hex");
      const address = legacyAccountBTC.addresses[0];
      expect(pubKeyToLegacyAddress(pubKey)).toBe(address);
    });

    it("should retrieve the correct Segwit (P2WPKH) address for a given public key", () => {
      const pubKey = Buffer.from(segWitAccountBTC.publicKeys[0], "hex");
      const address = segWitAccountBTC.addresses[0];
      expect(pubKeyToSegwitAddress(pubKey)).toBe(address);
    });
  });
});
