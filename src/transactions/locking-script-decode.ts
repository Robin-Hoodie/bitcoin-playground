const HEX_TO_OPCODE: Record<string, string> = {
  "76": "OP_DUP",
  a9: "OP_HASH160",
  "88": "OP_EQUALVERIFY",
  ac: "OP_CHECKSIG",
};

// See https://www.oreilly.com/library/view/mastering-bitcoin/9781491902639/apa.html for OP codes
export const decodeLockingScriptP2PKH = (lockingScriptRaw: string) => {
  if (lockingScriptRaw.length !== 50) {
    throw new Error(
      `Locking script ${lockingScriptRaw} did not contain exactly 25 bytes. Length is ${lockingScriptRaw.length}`
    );
  }
  const opCodeOne = HEX_TO_OPCODE[lockingScriptRaw.slice(0, 2)];
  const opCodeTwo = HEX_TO_OPCODE[lockingScriptRaw.slice(2, 4)];
  const opCodeThree = HEX_TO_OPCODE[lockingScriptRaw.slice(-4, -2)];
  const opCodeFour = HEX_TO_OPCODE[lockingScriptRaw.slice(-2)];
  return `${opCodeOne} ${opCodeTwo} ${lockingScriptRaw.slice(
    6,
    -4
  )} ${opCodeThree} ${opCodeFour}`;
};
