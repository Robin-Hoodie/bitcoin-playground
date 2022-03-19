import { bech32 } from "bech32";
import { encode } from "bs58check";
import { hash160 } from "@/utils";

export const pubKeyToLegacyAddress = (pubKey: Buffer) => {
  const hash = hash160(pubKey);
  const addressPrefix = Buffer.alloc(1);
  return encode(Buffer.concat([addressPrefix, hash]));
};

// https://en.bitcoin.it/wiki/Bech32#:~:text=Bech32%20is%20a%20segwit%20address,is%20the%20preferred%20address%20scheme.
export const pubKeyToSegwitAddress = (pubKey: Buffer) => {
  const hash = hash160(pubKey);
  const words = bech32.toWords(hash);
  const wordsWithVersion = [0, ...words];
  return bech32.encode("bc", wordsWithVersion);
};
