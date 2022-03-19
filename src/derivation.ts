import { createHmac } from "crypto";
import { pointAdd } from "./secp256k1-math";
import {
  decodeExtendedKey,
  isXPubDecoded,
  isZPubDecoded,
} from "./extended-key";
import { pubKeyToSegwitAddress, pubKeyToLegacyAddress } from "./address";
import { generatePublicKey, isPrivateKeyValid } from "./keys";

const maxIndexNormalChildKeys = 2 ** 31;

const getIndexAsBuffer = (index: number) => {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(index);
  return buffer;
};

const generatePubKeyAndChainCode = (
  pubKey: Buffer,
  chainCode: Buffer,
  index: Buffer
) => {
  // Churn inputs throught HMAC-SHA512
  const hmac = createHmac("sha512", chainCode);
  hmac.update(Buffer.concat([pubKey, index]));
  const digest = hmac.digest();

  // Split HMAC-SHA512 output
  const digestFirstHalf = digest.slice(0, 32);
  const childChainCode = Buffer.from(digest.slice(32));

  if (!isPrivateKeyValid(digestFirstHalf)) {
    throw new Error("First half of digest is not valid. Try the next index");
  }

  const childPubKey = pointAdd(generatePublicKey(digestFirstHalf), pubKey, {
    compressed: true,
  });

  if (!childPubKey) {
    throw new Error(
      "Child public key is at point of infinity after adding parent public key to it . Try the next index"
    );
  }

  return {
    pubKey: childPubKey,
    chainCode: childChainCode,
  };
};

export const generateAddressFromExtendedPubKey = (
  extendedKey: string,
  index: number
) => {
  if (index >= maxIndexNormalChildKeys) {
    throw new Error(
      `Index ${index} must be smaller than allowed index ${maxIndexNormalChildKeys}`
    );
  }

  const decodedExtendedKey = decodeExtendedKey(extendedKey);

  const isXPubKey = isXPubDecoded(decodedExtendedKey);
  const isZPubKey = isZPubDecoded(decodedExtendedKey);

  if (isXPubKey || isZPubKey) {
    const { pubKey: pubKeyIntermediate, chainCode } =
      generatePubKeyAndChainCode(
        decodedExtendedKey.key,
        decodedExtendedKey.chainCode,
        // Generate receival (external) address based on https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#change
        getIndexAsBuffer(0)
      );

    const indexAsBuffer = getIndexAsBuffer(index);

    const { pubKey } = generatePubKeyAndChainCode(
      pubKeyIntermediate,
      chainCode,
      indexAsBuffer
    );

    if (isXPubKey) {
      return pubKeyToLegacyAddress(pubKey);
    }
    return pubKeyToSegwitAddress(pubKey);
  }

  throw new Error(
    "Generation of addresses is only possible based on XPubs & ZPubs"
  );
};
