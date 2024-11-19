import crypto from "crypto";

const CHECKSUM_KEY: string | undefined = process.env.CHECKSUM_KEY;

function createSignature(data: any) {
  const sortedKeys = Object.keys(data).sort();
  const sortedData = sortedKeys.map((key) => `${key}=${data[key]}`).join("&");
  if (!CHECKSUM_KEY) {
    throw new Error("CHECKSUM_KEY must be defined");
  }
  console.log(CHECKSUM_KEY)
  return crypto
    .createHmac("sha256", CHECKSUM_KEY)
    .update(sortedData)
    .digest("hex");
}

function generateRandomNumber(length: number) {
  const digits = "0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomByte = crypto.randomBytes(1)[0];
    result += digits[randomByte % 10];
  }
  return parseInt(result, 10);
}

function uuid() {
  return crypto.randomUUID();
}
export default { createSignature, generateRandomNumber, uuid };

