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

// Canonical ERS Alpha registry and network.
const ERS_ALPHA_REGISTRY = "0xB26A49dAD928C6A045e23f00683e3ee9F65dEB23";
const ERS_ALPHA_NETWORK = "https://optimism-mainnet.infura.io/v3/a2fdbec687924872818c9d3cfeb67c9f";

const CHIP_REGISTRY = "0xd1aB0240621Aa7C89b60f6D71013Bc62a43448FD";
const ERS_NETWORK = "https://sepolia.infura.io/v3/a2fdbec687924872818c9d3cfeb67c9f";

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
  const provider = new ethers.providers.JsonRpcProvider(ERS_ALPHA_NETWORK);

  // Create contract instance.
  const contract = await new ethers.Contract(ERS_ALPHA_REGISTRY, abi, provider);

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
    const params = window.location.href.split("?")[1];
    return contentAddress + "?" + params;
  }
}

async function checkERS(url) {
  console.log("Checking ERS");
  const { pk1, pk2, pk3 } = url.query;

  // Create Provider.
  const provider = new ethers.providers.JsonRpcProvider(ERS_NETWORK);

  // Create contract instance.
  const chipRegistry = await new ethers.Contract(CHIP_REGISTRY, ersAbi, provider);

  const statik = url.query.static || makeStatic(pk1, pk2, pk3);
  const chipId = keysToAddress(statik);
  try {
    let blockTag = "latest";
    console.log(chipId);
    const data = await provider.call({
      to: chipRegistry.address,
      ccipReadEnabled: true,
      data: chipRegistry.interface.encodeFunctionData("resolveChipId", [chipId]),
    }, blockTag);
    console.log(data);
    return parseRecordsForContentApp(data);
  } catch(e) {
    console.log(e);
    throw e;
  }
}

async function readContract() {
  // Run function.
  const url = new URL(window.location.href, true);

  const { pk1 } = url.query;
  
  // No params
  if (!url.query.static && !pk1) {
    window.location.href = "https:///boot.arx.org";
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
        console.log(e);
        // const params = window.location.href.split("?")[1];
        // window.location.href = "https://boot.arx.org?" + params;
        return;
      }
    }
  }
}

readContract();
