import { generatePrivateKey } from "@/keys";
import { pointMultiply } from "@/math";
import { sign, verify } from "@/transactions/signature/signature";
import { GENERATOR_POINT } from "@/constants/constants";

describe("Signature", () => {
  it("should create a signature and verify it", () => {
    const privateKey = generatePrivateKey();
    const publicKey = pointMultiply(GENERATOR_POINT, privateKey);
    const message = generatePrivateKey();
    const signature = sign(message, privateKey);
    expect(verify(message, publicKey, Buffer.from(signature))).toBe(true);
  });
});
