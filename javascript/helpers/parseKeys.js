import { ethers } from "ethers";

const formatHex = (bytes) => (bytes.slice(0, 2) == "0x" ? bytes : "0x" + bytes);

export function parseKeys(payload) {
  const pkLength = parseInt("0x" + payload.slice(0, 2)) * 2;
  const pkRaw = payload.slice(2, pkLength + 2);

  const key = ethers.utils.keccak256(
    "0x" + ethers.utils.computePublicKey(formatHex(pkRaw)).slice(4)
  );

  return key;
}

export function keysToAddress(payload) {
  const pkLength = parseInt("0x" + payload.slice(0, 2)) * 2;
  const pkRaw = payload.slice(2, pkLength + 2);

  return ethers.utils.computeAddress("0x" + pkRaw);
  // return "0x" + parseKeys(payload).slice(26);     // remove 0x and first 12 bytes from computed public key
}
