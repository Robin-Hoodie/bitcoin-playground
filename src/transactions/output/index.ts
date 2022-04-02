import { Output } from "@/types";
import { convertToLE } from "@/utils";
import { HEX_CHARS_PER_BYTE } from "@/constants/constants";
import { decodeLockingScriptP2PKH } from "@/transactions/output/locking-script";

interface OutputWithIndexEnd {
  output: Output;
  indexEnd: number;
}

const CHARS_OUTPUT_VALUE = 8 * HEX_CHARS_PER_BYTE;
const CHARS_OUTPUT_LOCKING_SCRIPT_SIZE = 1 * HEX_CHARS_PER_BYTE; // This is actually 2-18
const SATS_PER_BTC = 100000000;


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
    lockingScriptIndexStart + lockingScriptSizeBytes * HEX_CHARS_PER_BYTE;
  const lockingScriptRaw = rawTransaction.slice(
    lockingScriptIndexStart,
    lockingScriptIndexEnd
  );
  const lockingScriptDecoded = decodeLockingScriptP2PKH(lockingScriptRaw);
  return {
    output: {
      value: valueInBtc,
      scriptPubKey: lockingScriptDecoded,
    },
    indexEnd: lockingScriptIndexEnd,
  };
};

export const decodeOutputs = (rawTransaction: string, indexStart: number) => {
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