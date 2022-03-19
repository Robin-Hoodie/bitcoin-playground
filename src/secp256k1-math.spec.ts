import {
  pointAdd as pointAddTinySecp256k1,
  pointMultiply as pointMultiplyWithScalarTinySecp256k1,
} from "tiny-secp256k1";
import { generatePrivateKey } from "./keys";
import { pointDouble, pointAdd, pointMultiply } from "./secp256k1-math";
import { bufferToBigInt } from "./utils";

/**
 *  We're using the tiny-secp256k1 library to test against our expectations
 **/

// 8 * G
const pointOneUncompressed = Buffer.from(
  "042f01e5e15cca351daff3843fb70f3c2f0a1bdd05e5af888a67784ef3e10a2a015c4da8a741539949293d082a132d13b4c2e213d6ba5b7617b5da2cb76cbde904",
  "hex"
);
const pointOneCompressed = Buffer.from(
  "022f01e5e15cca351daff3843fb70f3c2f0a1bdd05e5af888a67784ef3e10a2a015",
  "hex"
);

// 2 * G
const pointTwoUnCompressed = Buffer.from(
  "04c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee51ae168fea63dc339a3c58419466ceaeef7f632653266d0e1236431a950cfe52a",
  "hex"
);
const pointTwoCompressed = Buffer.from(
  "02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5",
  "hex"
);

describe("Secp256k1 Mathematics", () => {
  it("should return the result of doubling an uncompressed point as an uncompressed point", () => {
    const pointDoubledActual = pointDouble(pointOneUncompressed, {
      compressed: false,
    });
    const pointDoubledExpected = pointAddTinySecp256k1(
      pointOneUncompressed,
      pointOneUncompressed,
      false
    )!;
    expect(pointDoubledActual.toString("hex")).toBe(
      Buffer.from(pointDoubledExpected).toString("hex")
    );
  });

  it("should return the result of doubling an uncompressed point as a compressed point", () => {
    const pointDoubledActual = pointDouble(pointOneUncompressed, {
      compressed: true,
    });
    const pointDoubledExpected = pointAddTinySecp256k1(
      pointOneUncompressed,
      pointOneUncompressed,
      true
    )!;
    expect(pointDoubledActual.toString("hex")).toBe(
      Buffer.from(pointDoubledExpected).toString("hex")
    );
  });

  it("should return the result of doubling an compressed point as an uncompressed point", () => {
    const pointDoubledActual = pointDouble(pointOneCompressed, {
      compressed: false,
    });
    const pointDoubledExpected = pointAddTinySecp256k1(
      pointOneCompressed,
      pointOneCompressed,
      false
    )!;
    expect(pointDoubledActual.toString("hex")).toBe(
      Buffer.from(pointDoubledExpected).toString("hex")
    );
  });

  it("should return the result of doubling a compressed point as a compressed point", () => {
    const pointDoubledActual = pointDouble(pointOneCompressed, {
      compressed: true,
    });
    const pointDoubledExpected = pointAddTinySecp256k1(
      pointOneCompressed,
      pointOneCompressed,
      true
    )!;
    expect(pointDoubledActual.toString("hex")).toBe(
      Buffer.from(pointDoubledExpected).toString("hex")
    );
  });

  it("should return the sum of 2 uncompressed points as an uncompressed point", () => {
    const pointSumActual = pointAdd(
      pointOneUncompressed,
      pointTwoUnCompressed,
      { compressed: false }
    );
    const pointSumExpected = pointAddTinySecp256k1(
      pointOneUncompressed,
      pointTwoUnCompressed,
      false
    )!;
    expect(pointSumActual.toString("hex")).toBe(
      Buffer.from(pointSumExpected).toString("hex")
    );
  });

  it("should return the sum of 2 uncompressed points as a compressed point", () => {
    const pointSumActual = pointAdd(
      pointOneUncompressed,
      pointTwoUnCompressed,
      { compressed: true }
    );
    const pointSumExpected = pointAddTinySecp256k1(
      pointOneUncompressed,
      pointTwoUnCompressed,
      true
    )!;
    expect(pointSumActual.toString("hex")).toBe(
      Buffer.from(pointSumExpected).toString("hex")
    );
  });

  it("should return the sum of 2 compressed points as an uncompressed point", () => {
    const pointSumActual = pointAdd(pointOneCompressed, pointTwoCompressed, {
      compressed: false,
    });
    const pointSumExpected = pointAddTinySecp256k1(
      pointOneCompressed,
      pointTwoCompressed,
      false
    )!;
    expect(pointSumActual.toString("hex")).toBe(
      Buffer.from(pointSumExpected).toString("hex")
    );
  });

  it("should return the sum of 2 compressed points as a compressed point", () => {
    const pointSumActual = pointAdd(pointOneCompressed, pointTwoCompressed, {
      compressed: true,
    });
    const pointSumExpected = pointAddTinySecp256k1(
      pointOneCompressed,
      pointTwoCompressed,
      true
    )!;
    expect(pointSumActual.toString("hex")).toBe(
      Buffer.from(pointSumExpected).toString("hex")
    );
  });

  it("should return the product of an uncompressed point and a random number as an uncompressed point", () => {
    const randomNumber = generatePrivateKey();
    const pointProductActual = pointMultiply(
      pointOneUncompressed,
      bufferToBigInt(randomNumber),
      {
        compressed: false,
      }
    );
    const pointProductExpected = pointMultiplyWithScalarTinySecp256k1(
      pointOneUncompressed,
      randomNumber,
      false
    )!;
    expect(pointProductActual.toString("hex")).toBe(
      Buffer.from(pointProductExpected).toString("hex")
    );
  });

  it("should return the product of a compressed point and a random number as an uncompressed point", () => {
    const randomNumber = generatePrivateKey();
    const pointProductActual = pointMultiply(
      pointOneCompressed,
      bufferToBigInt(randomNumber),
      {
        compressed: false,
      }
    );
    const pointProductExpected = pointMultiplyWithScalarTinySecp256k1(
      pointOneCompressed,
      randomNumber,
      false
    )!;
    expect(pointProductActual.toString("hex")).toBe(
      Buffer.from(pointProductExpected).toString("hex")
    );
  });

  it("should return the product of an uncompressed point and a random number as a compressed point", () => {
    const randomNumber = generatePrivateKey();
    const pointProductActual = pointMultiply(
      pointOneUncompressed,
      bufferToBigInt(randomNumber),
      {
        compressed: true,
      }
    );
    const pointProductExpected = pointMultiplyWithScalarTinySecp256k1(
      pointOneUncompressed,
      randomNumber,
      true
    )!;
    expect(pointProductActual.toString("hex")).toBe(
      Buffer.from(pointProductExpected).toString("hex")
    );
  });

  it("should return the product of a compressed point and a random number as a compressed point", () => {
    const randomNumber = generatePrivateKey();
    const pointProductActual = pointMultiply(
      pointOneCompressed,
      bufferToBigInt(randomNumber),
      {
        compressed: true,
      }
    );
    const pointProductExpected = pointMultiplyWithScalarTinySecp256k1(
      pointOneCompressed,
      randomNumber,
      true
    )!;
    expect(pointProductActual.toString("hex")).toBe(
      Buffer.from(pointProductExpected).toString("hex")
    );
  });

  it("should return the product of a compressed point and a random number as a Buffer as a compressed point", () => {
    const randomNumber = generatePrivateKey();
    const pointProductActual = pointMultiply(pointOneCompressed, randomNumber, {
      compressed: true,
    });
    const pointProductExpected = pointMultiplyWithScalarTinySecp256k1(
      pointOneCompressed,
      randomNumber,
      true
    )!;
    expect(pointProductActual.toString("hex")).toBe(
      Buffer.from(pointProductExpected).toString("hex")
    );
  });
});
