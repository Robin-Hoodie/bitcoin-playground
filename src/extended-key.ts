import { decode } from "bs58check";

interface ExtendedKeyDecoded {
  version: "0488ade4" | "0488b21e" | "04b24746";
  depth: string;
  parentKeyFingerPrint: string;
  childIndex: string;
  chainCode: Buffer;
  key: Buffer;
}

interface XPrivDecoded extends ExtendedKeyDecoded {
  version: "0488ade4";
}

interface XPubDecoded extends ExtendedKeyDecoded {
  version: "0488b21e";
}

interface ZPubDecoded extends ExtendedKeyDecoded {
  version: "04b24746";
}

export const isXPrivDecoded = (
  extendedKey: ExtendedKeyDecoded
): extendedKey is XPrivDecoded => {
  return extendedKey.version === "0488ade4";
};

export const isXPubDecoded = (
  extendedKey: ExtendedKeyDecoded
): extendedKey is XPubDecoded => extendedKey.version === "0488b21e";

export const isZPubDecoded = (
  extendedKey: ExtendedKeyDecoded
): extendedKey is ZPubDecoded => extendedKey.version === "04b24746";

export const decodeExtendedKey = (extendedKey: string): ExtendedKeyDecoded => {
  const extendedKeyDecoded = decode(extendedKey);
  const version = extendedKeyDecoded
    .slice(0, 4)
    .toString("hex") as ExtendedKeyDecoded["version"];
  const depth = extendedKeyDecoded.slice(4, 5).toString("hex");
  const parentKeyFingerPrint = extendedKeyDecoded.slice(5, 9).toString("hex");
  const childIndex = extendedKeyDecoded.slice(9, 13).toString("hex");
  const chainCode = Buffer.from(extendedKeyDecoded.slice(13, 45));
  const key = Buffer.from(extendedKeyDecoded.slice(45));
  return {
    version,
    depth,
    parentKeyFingerPrint,
    childIndex,
    chainCode,
    key,
  };
};
