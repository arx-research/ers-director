import { ethers } from "ethers";
import URL from "url-parse";
import { abi } from "./abi.json";
import { abi as ersAbi } from "./chipRegistryAbi.json";
import { parseKeys, keysToAddress } from "./helpers/parseKeys";

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

const CHIP_REGISTRY = "0x369Ae94A0868a27154b2eB11B6dEb14B2cf0b7f0";
const ERS_NETWORK = "https://goerli.infura.io/v3/a2fdbec687924872818c9d3cfeb67c9f";

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

// window.location.href = "https://halo.vrfy.ch/" + "?" + params;

async function checkLegacy(url) {
  const { pk1, pk2, pk3 } = url.query;

  // Create Provider.
  const provider = new ethers.providers.JsonRpcProvider(ENS_NETWORK);

  // Create contract instance.
  const contract = await new ethers.Contract(ENS_REGISTRY, abi, provider);

  const statik = url.query.static || makeStatic(pk1, pk2, pk3);
  const chipId = parseKeys(statik);
  const exists = await contract.chipExists(chipId);
  const params = window.location.href.split("?")[1];

  if (exists) {
    const url = await contract.chipUri(chipId);
    const u = fixUrl(url);

    return { exists, "redirectUrl": u + "?" + params };
  } else {
    return { exists, "redirectUrl": "" };
  }
}

function parseRecordsForContentApp(data) {
  let arrayOfRecords;
  const encoder = new ethers.utils.AbiCoder();
  try{
    arrayOfRecords = (encoder.decode(["tuple(bytes32,bytes)[]"], data))[0];
  } catch (error){
    throw new Error(`Something went wrong. Check the gateway's response. Call returned: ${data}`);
  }
  // Convert the bytes from each record in the array to a string and remove null characters
  const formattedArrayOfRecords = arrayOfRecords.map((recordArray) => {return {recordType: ethers.utils.toUtf8String(recordArray[0]).replace(/\u0000/g, ''), content: ethers.utils.toUtf8String(recordArray[1]).replace(/\u0000/g, '')}; });
  formattedArrayOfRecords.filter((record) => record.recordType === "contentApp");

  const contentAddress = formattedArrayOfRecords[0].content;

  if (contentAddress.split(":")[0] == "ipfs") {
    return `https://nftstorage.link/ipfs/${contentAddress.split("//")[1]}`;
  } else {
    return contentAddress;
  }
}

async function checkERS(url) {
  console.log("Using Goerli deploy...");
  const { pk1, pk2, pk3 } = url.query;

  // Create Provider.
  const provider = new ethers.providers.JsonRpcProvider(ERS_NETWORK);

  // Create contract instance.
  const chipRegistry = await new ethers.Contract(CHIP_REGISTRY, ersAbi, provider);

  const statik = url.query.static || makeStatic(pk1, pk2, pk3);
  const chipId = keysToAddress(statik);

  try {
    let blockTag = "latest";
    const data = await provider.call({
      to: chipRegistry.address,
      ccipReadEnabled: true,
      data: chipRegistry.interface.encodeFunctionData("resolveChipId", [chipId]),
    }, blockTag);

    return parseRecordsForContentApp(data);
  } catch(e) {
    throw e;
  }
}

async function readContract() {
  // Run function.
  const url = new URL(window.location.href, true);

  const { pk1} = url.query;
  
  // No params
  if (!url.query.static && !pk1) {
    window.location.href = "https://halo.vrfy.ch";
    return;
  } else {
    const legacy = await checkLegacy(url);

    if (legacy.exists) {
      window.location.href = legacy.redirectUrl;
      return;
    } else {
      try {
        const contentApp = await checkERS(url);
        window.location.href = contentApp;
        return;
      } catch(e) {
        window.location.href = "https://halo.vrfy.ch";
        return;
      }
    }
  }
}

readContract();
