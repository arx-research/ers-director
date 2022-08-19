import { keccak256 } from "@ethersproject/keccak256";

const formatHex = (bytes) => (bytes.slice(0, 2) == "0x" ? bytes : "0x" + bytes);

export default function parseKeys(payload) {
  const pkLength = parseInt("0x" + payload.slice(0, 2)) * 2;
  const pkRaw = payload.slice(2, pkLength + 2);

  const key = keccak256(
    "0x" + utils.computePublicKey(formatHex(pkRaw)).slice(4)
  );

  return key;
}
