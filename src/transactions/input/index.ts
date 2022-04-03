import { Input } from "@/types";
import { HEX_CHARS_PER_BYTE } from "@/constants/constants";
import { convertToLE } from "@/utils";

const CHARS_INPUT_TXID = 32 * HEX_CHARS_PER_BYTE;
const CHARS_INPUT_OUTPUT_INDEX = 4 * HEX_CHARS_PER_BYTE;
const CHARS_INPUT_UNLOCKING_SCRIPT_SIZE = 1 * HEX_CHARS_PER_BYTE; // This is actually 2-18
const CHARS_INPUT_SEQUENCE = 4 * HEX_CHARS_PER_BYTE;

interface InputWithIndexEnd {
  input: Input;
  indexEnd: number;
}

const decodeInput = (rawTransaction: string, indexStart: number) => {
  const txIndexStart = indexStart;
  const txIndexEnd = indexStart + CHARS_INPUT_TXID;
  const txId = convertToLE(rawTransaction.slice(txIndexStart, txIndexEnd));

  const vOutIndexStart = txIndexEnd;
  const vOutIndexEnd = vOutIndexStart + CHARS_INPUT_OUTPUT_INDEX;
  const vOut = rawTransaction.slice(vOutIndexStart, vOutIndexEnd);

  const unlockingScriptSizeIndexStart = vOutIndexEnd;
  const unlockingScriptSizeIndexEnd =
    unlockingScriptSizeIndexStart + CHARS_INPUT_UNLOCKING_SCRIPT_SIZE;
  const unlockingScriptSize = rawTransaction.slice(
    unlockingScriptSizeIndexStart,
    unlockingScriptSizeIndexEnd
  );
  const unlockingScriptSizeBytes = parseInt(unlockingScriptSize, 16);
  const scriptSigIndexStart = unlockingScriptSizeIndexEnd;
  const scriptSigIndexEnd =
    scriptSigIndexStart + unlockingScriptSizeBytes * HEX_CHARS_PER_BYTE;
  const scriptSig = rawTransaction.slice(
    scriptSigIndexStart,
    scriptSigIndexEnd
  );

  const sequenceIndexStart = scriptSigIndexEnd;
  const sequenceIndexEnd = sequenceIndexStart + CHARS_INPUT_SEQUENCE;
  const sequence = rawTransaction.slice(sequenceIndexStart, sequenceIndexEnd);

  return {
    input: {
      txid: txId,
      vout: parseInt(vOut, 16),
      scriptSig,
      sequence: parseInt(sequence, 16),
    },
    indexEnd: sequenceIndexEnd,
  };
};

export const decodeInputs = (rawTransaction: string, indexStart: number) => {
  const inputIndexStart = indexStart + 2;
  const inputCount = rawTransaction.slice(indexStart, inputIndexStart);
  const inputCountDecimal = parseInt(inputCount, 16);
  const inputsWithIndicesEnd = new Array(inputCountDecimal)
    .fill(null)
    .reduce<InputWithIndexEnd[]>((inputs, _, i) => {
      const previousIndexEnd = inputs[i - 1]?.indexEnd || inputIndexStart;
      const inputWithIndexEnd = decodeInput(rawTransaction, previousIndexEnd);
      return [...inputs, inputWithIndexEnd];
    }, []);
  const inputs = inputsWithIndicesEnd.map(
    (inputWithIndexEnd) => inputWithIndexEnd.input
  );
  const { indexEnd: inputsIndexEnd } =
    inputsWithIndicesEnd[inputsWithIndicesEnd.length - 1];
  return {
    inputs,
    inputsIndexEnd,
  };
};
