export type Bit = "0" | "1";

export interface InputUnsigned {
  txid: string;
  vout: number;
  sequence: number;
}

export interface Input extends InputUnsigned {
  scriptSig: string;
}

export interface Output {
  value: number;
  scriptPubKey: string;
}

export interface Transaction {
  version: number;
  inputs: Input[];
  outputs: Output[];
  lockTime: number;
}
