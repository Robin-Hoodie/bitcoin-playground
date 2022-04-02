import { Input, Output } from "@/types";
import { decodeRawTransaction } from "./decode/decode-transaction";

export class Transaction {
  constructor(
    public version: string,
    public inputs: Input[],
    public outputs: Output[],
    public lockTime: number
  ) {}

  static fromRaw(rawTransaction: string) {
    const transaction = decodeRawTransaction(rawTransaction);
    return new Transaction(
      transaction.version,
      transaction.inputs,
      transaction.outputs,
      transaction.lockTime
    );
  }
}
