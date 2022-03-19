import { InputWithIndexEnd, OutputWithIndexEnd, Transaction } from "@/types";
import { decodeP2PKHLockingScript } from "@/transactions";

const CHARS_PER_BYTE = 2;
const CHARS_OUTPUT_VALUE = 8 * CHARS_PER_BYTE;
const CHARS_OUTPUT_LOCKING_SCRIPT_SIZE = 1 * CHARS_PER_BYTE; // This is actually 2-18
const CHARS_INPUT_TXID = 32 * CHARS_PER_BYTE;
const CHARS_INPUT_OUTPUT_INDEX = 4 * CHARS_PER_BYTE;
const CHARS_INPUT_UNLOCKING_SCRIPT_SIZE = 1 * CHARS_PER_BYTE; // This is actually 2-18
const CHARS_INPUT_SEQUENCE = 4 * CHARS_PER_BYTE;
const CHARS_VERSION = 4 * CHARS_PER_BYTE;
const SATS_PER_BTC = 100000000;

export const decodeRawTransactionLegacy = (
  rawTransaction: string
): Transaction => {
  const { version, versionIndexEnd } = decodeVersion(rawTransaction);
  const { inputs, inputsIndexEnd } = decodeInputs(
    rawTransaction,
    versionIndexEnd
  );
  const { outputs, outputsIndexEnd } = decodeOutputs(
    rawTransaction,
    inputsIndexEnd
  );
  const lockTime = rawTransaction.slice(outputsIndexEnd);
  return {
    version,
    inputs,
    outputs,
    lockTime: parseInt(lockTime, 16),
  };
};

const decodeVersion = (rawTransaction: string) => {
  const version = convertToLE(rawTransaction.slice(0, CHARS_VERSION));
  return {
    version: parseInt(version, 16),
    versionIndexEnd: CHARS_VERSION,
  };
};

const decodeInputs = (rawTransaction: string, indexStart: number) => {
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
    scriptSigIndexStart + unlockingScriptSizeBytes * CHARS_PER_BYTE;
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
      sequence,
    },
    indexEnd: sequenceIndexEnd,
  };
};

const decodeOutputs = (rawTransaction: string, indexStart: number) => {
  const outputIndexStart = indexStart + 2;
  const outputCount = rawTransaction.slice(indexStart, outputIndexStart);
  const outputCountDecimal = parseInt(outputCount, 16);
  const outputsWithIndicesEnd = new Array(outputCountDecimal)
    .fill(null)
    .reduce<OutputWithIndexEnd[]>((outputs, _, i) => {
      const previousIndexEnd = outputs[i - 1]?.indexEnd || outputIndexStart;
      const outputWithIndexEnd = decodeOutput(rawTransaction, previousIndexEnd);
      return [...outputs, outputWithIndexEnd];
    }, []);
  const outputs = outputsWithIndicesEnd.map(
    (outputWithIndexEnd) => outputWithIndexEnd.output
  );
  const { indexEnd: outputsIndexEnd } =
    outputsWithIndicesEnd[outputsWithIndicesEnd.length - 1];
  return {
    outputs,
    outputsIndexEnd,
  };
};

const decodeOutput = (rawTransaction: string, indexStart: number) => {
  const valueIndexStart = indexStart;
  const valueIndexEnd = valueIndexStart + CHARS_OUTPUT_VALUE;
  const value = convertToLE(
    rawTransaction.slice(valueIndexStart, valueIndexEnd)
  ); // Amount is stored reversed
  const valueInBtc = parseInt(value, 16) / SATS_PER_BTC;

  const lockingScriptSizeIndexStart = valueIndexEnd;
  const lockingScriptSizeIndexEnd =
    lockingScriptSizeIndexStart + CHARS_OUTPUT_LOCKING_SCRIPT_SIZE;
  const lockingScriptSize = rawTransaction.slice(
    lockingScriptSizeIndexStart,
    lockingScriptSizeIndexEnd
  );
  const lockingScriptSizeBytes = parseInt(lockingScriptSize, 16);

  const lockingScriptIndexStart = lockingScriptSizeIndexEnd;
  const lockingScriptIndexEnd =
    lockingScriptIndexStart + lockingScriptSizeBytes * CHARS_PER_BYTE;
  const lockingScriptRaw = rawTransaction.slice(
    lockingScriptIndexStart,
    lockingScriptIndexEnd
  );
  const lockingScriptDecoded = decodeP2PKHLockingScript(lockingScriptRaw);
  return {
    output: {
      value: valueInBtc,
      scriptPubKey: lockingScriptDecoded,
    },
    indexEnd: lockingScriptIndexEnd,
  };
};

const convertToLE = (hex: string) => {
  const hexBytes = hex.match(/[\da-f][\da-f]/g);
  if (!hexBytes) {
    throw new Error(`${hex} is not a hex string`);
  }
  return hexBytes.reverse().join("");
};
