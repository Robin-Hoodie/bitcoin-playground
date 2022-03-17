export type Bit = "0" | "1";
interface Input {
  txid: string;
  vout: number;
  scriptSig: string;
  sequence: string;
}

export interface InputWithIndexEnd {
  input: Input;
  indexEnd: number;
}

interface Output {
  value: number;
  scriptPubKey: string;
}

export interface OutputWithIndexEnd {
  output: Output;
  indexEnd: number;
}

export interface Transaction {
  version: number;
  inputs: Input[];
  outputs: Output[];
  lockTime: number;
}
