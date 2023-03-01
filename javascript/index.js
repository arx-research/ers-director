import { ethers } from "ethers";
import URL from "url-parse";
import { abi } from "./abi.json";
import parseKeys from "./helpers/parseKeys";

function fixUrl(url) {
  let u = url;
  const hasHttp = url.indexOf("http://") > -1;
  const hasHttps = url.indexOf("https://") > -1;

  if (!hasHttp && !hasHttps) {
    u = "https://" + u;
  }

  const urlObj = new URL(u);
  u.protocol = "https";

  return urlObj.toString();
}

// Canonical ENS registry and network.
const ENS_REGISTRY = "0xB26A49dAD928C6A045e23f00683e3ee9F65dEB23";
const ENS_NETWORK =
  "https://opt-mainnet.g.alchemy.com/v2/Mx_q-MkGapjZcN0E6Kh4dJVbZq84F3zG";

function makeStatic(pk1, pk2, pk3) {
  let out = "41" + pk1;

  if (pk2) {
    out += "41" + pk2;
  } else {
    out += "00".repeat(66);
  }

  if (pk2 && pk3) {
    out += "41" + pk3;
  } else {
    out += "00".repeat(66);
  }

  return out;
}

async function readContract() {
  // Create Provider.
  const provider = new ethers.providers.JsonRpcProvider(ENS_NETWORK);

  // Create contract instance.
  const contact = await new ethers.Contract(ENS_REGISTRY, abi, provider);

  // Run function.
  const url = new URL(window.location.href, true);
  const { pk1, pk2, pk3 } = url.query;

  // No params
  if (!url.query.static && !pk1) {
    window.location.href = "https://halo.vrfy.ch";
    return;
  } else {
    const statik = url.query.static || makeStatic(pk1, pk2, pk3);
    const chipId = parseKeys(statik);
    const exists = await contact.chipExists(chipId);
    const params = window.location.href.split("?")[1];

    if (exists) {
      const url = await contact.chipUri(chipId);
      const u = fixUrl(url);

      window.location.href = u + "?" + params;
    } else {
      window.location.href = "https://halo.vrfy.ch/" + "?" + params;
    }
  }
}

readContract();
