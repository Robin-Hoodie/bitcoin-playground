import { generatePrivateKey } from "@/keys";
import { pointMultiply } from "@/math";
import { sign, verify } from "@/signature";
import { GENERATOR_POINT } from "@/constants";

describe("Signature", () => {
  it("should create a signature and verify it", () => {
    const privateKey = generatePrivateKey();
    const publicKey = pointMultiply(GENERATOR_POINT, privateKey);
    const message = generatePrivateKey();
    const signature = sign(privateKey, message);
    expect(verify(publicKey, message, signature)).toBe(true);
  });
});
