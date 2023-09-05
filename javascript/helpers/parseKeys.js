import { ethers } from "ethers";

const formatHex = (bytes) => (bytes.slice(0, 2) == "0x" ? bytes : "0x" + bytes);

export function parseKeys(payload) {
  const pkLength = parseInt("0x" + payload.slice(0, 2)) * 2;
  const pkRaw = payload.slice(2, pkLength + 2);

  const key = ethers.utils.keccak256(
    "0x" + ethers.utils.computePublicKey(formatHex(pkRaw)).slice(4)
  );
  console.log(key);
  return key;
}

export function keysToAddress(payload) {
  const pkLength = parseInt("0x" + payload.slice(0, 2)) * 2;
  const pkRaw = payload.slice(2, pkLength + 2);

  const publicKey = ethers.utils.computePublicKey(formatHex(pkRaw)).slice(4);
  console.log("0x" + publicKey);
  console.log(ethers.utils.computeAddress(ethers.utils.arrayify(publicKey)));
  return publicKey
}
