import { createHmac } from "crypto";
import {
  pointMultiply,
  pointAdd,
  GENERATOR_POINT,
  ORDER,
} from "./secp256k1-math";
import {
  decodeExtendedKey,
  isXPubDecoded,
  isZPubDecoded,
} from "./extended-key";
import { pubKeyToSegwitAddress, pubKeyToLegacyAddress } from "./address";
import { bufferToBigInt } from "./utils";

const maxIndexNormalChildKeys = 2 ** 31;

const getIndexAsBuffer = (index: number) => {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(index);
  return buffer;
};

const isPrivateKeyValid = (privateKey: Buffer) =>
  bufferToBigInt(privateKey) < ORDER;
const privateKeyToPoint = (privateKey: Buffer) => {
  if (!isPrivateKeyValid(privateKey)) {
    throw new Error(
      "Private key is greater than the order of the curve. Try the next index"
    );
  }
  // result of multiplication can't be negative, as we checked that the digest is smaller than the order of the curve
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return pointMultiply(GENERATOR_POINT, privateKey)!;
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

  const childPubKey = pointAdd(privateKeyToPoint(digestFirstHalf), pubKey, {
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
