export type Bit = "0" | "1";
export interface Input {
  txid: string;
  vout: number;
  scriptSig: string;
  sequence: string;
}

export interface Output {
  value: number;
  scriptPubKey: string;
}

export interface InputWithIndexEnd {
  input: Input;
  indexEnd: number;
}

export interface OutputWithIndexEnd {
  output: Output;
  indexEnd: number;
}

export interface Transaction {
  version: string;
  inputs: Input[];
  outputs: Output[];
  lockTime: number;
}
