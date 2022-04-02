import { decodeInputs } from "@/transactions/input";
import { decodeOutputs } from "@/transactions/output";
import type { Transaction } from "@/transactions";
import { convertToLE } from "@/utils";
import { HEX_CHARS_PER_BYTE } from "@/constants/constants";

const CHARS_VERSION = 4 * HEX_CHARS_PER_BYTE;

const decodeVersion = (rawTransaction: string) => {
  const version = convertToLE(rawTransaction.slice(0, CHARS_VERSION));
  return {
    version,
    versionIndexEnd: CHARS_VERSION,
  };
};

const decodeLockTime = (rawTransaction: string, outputsIndexEnd: number) => {
  const lockTime = rawTransaction.slice(outputsIndexEnd);
  return parseInt(lockTime, 16);
};

export const decodeRawTransaction = (rawTransaction: string): Transaction => {
  const { version, versionIndexEnd } = decodeVersion(rawTransaction);
  const { inputs, inputsIndexEnd } = decodeInputs(
    rawTransaction,
    versionIndexEnd
  );
  const { outputs, outputsIndexEnd } = decodeOutputs(
    rawTransaction,
    inputsIndexEnd
  );
  const lockTime = decodeLockTime(rawTransaction, outputsIndexEnd);
  return {
    version,
    inputs,
    outputs,
    lockTime,
  };
};
