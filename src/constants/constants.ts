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

export const HEX_CHARS_PER_BYTE = 2;