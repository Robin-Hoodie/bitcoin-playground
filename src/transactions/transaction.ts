import { Input, InputUnsigned, Output } from "@/types";
import { decodeTransaction, encodeTransaction } from "./decode/transaction-conversion";
import RpcClient from "bitcoind-rpc";

export class Transaction {
  private constructor(
    public version: number,
    public inputs: Input[],
    public outputs: Output[],
    public lockTime: number
  ) {}

  static fromRaw(rawTransaction: string) {
    const transaction = decodeTransaction(rawTransaction);
    return new Transaction(
      transaction.version,
      transaction.inputs,
      transaction.outputs,
      transaction.lockTime
    );
  }
}
