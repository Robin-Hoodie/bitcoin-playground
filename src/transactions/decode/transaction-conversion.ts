import { decodeInputs } from "@/transactions/input";
import { decodeOutputs } from "@/transactions/output";
import { convertToLE } from "@/utils";
import { HEX_CHARS_PER_BYTE } from "@/constants/constants";
import { Input, Output } from "@/types";

const CHARS_VERSION = 4 * HEX_CHARS_PER_BYTE;

interface TransactionSimple {
  version: number;
  inputs: Input[];
  outputs: Output[];
  lockTime: number;
}

const decodeVersion = (rawTransaction: string) => {
  const version = convertToLE(rawTransaction.slice(0, CHARS_VERSION));
  return {
    version: parseInt(version, 16),
    versionIndexEnd: CHARS_VERSION,
  };
};

const decodeLockTime = (rawTransaction: string, outputsIndexEnd: number) => {
  const lockTime = rawTransaction.slice(outputsIndexEnd);
  return parseInt(lockTime, 16);
};

export const decodeTransaction = (rawTransaction: string): TransactionSimple => {
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

export const encodeTransaction = (transaction: TransactionSimple) => {
  const inputs = "";
  const outputs = "";
  const lockTime = transaction.lockTime.toString().padStart(8, "0");
  return `${transaction.version}${inputs}${outputs}${lockTime}`;
};
