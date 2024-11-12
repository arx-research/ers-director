import { ethers } from "ethers";
import URL from "url-parse";
import { chipTableAbi } from "./chipTableAbi.json";
import { chipRegistryAbi } from "./chipRegistryAbi.json";
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
const CHIP_TABLE = "0xB26A49dAD928C6A045e23f00683e3ee9F65dEB23";
const OP_NETWORK = "https://optimism-mainnet.infura.io/v3/b544d9fcdee84377af9b70f5402a1542";

const CHIP_REGISTRY = "0xbbB1c125A8eA6feabD6524953cB4b8CD876345ED";
const BASE_NETWORK = "https://base-mainnet.infura.io/v3/b544d9fcdee84377af9b70f5402a1542";

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
  const provider = new ethers.providers.JsonRpcProvider(OP_NETWORK);

  // Create contract instance.
  const contract = await new ethers.Contract(CHIP_TABLE, chipTableAbi, provider);

  const staticParam = url.query.static || makeStatic(pk1, pk2, pk3);
  console.log(`staticParam: ${staticParam}`);
  const chipId = parseKeys(staticParam);
  console.log(`chipId: ${chipId}`);
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
  const { pk1, pk2, pk3 } = url.query;

  // Create Provider.
  const provider = new ethers.providers.JsonRpcProvider(BASE_NETWORK);

  // Create contract instance.
  const chipRegistry = await new ethers.Contract(CHIP_REGISTRY, chipRegistryAbi, provider);

  const staticParam = url.query.static || makeStatic(pk1, pk2, pk3);
  const chipId = keysToAddress(staticParam);
  try {
    let blockTag = "latest";
    console.log(chipId);
    const data = await provider.call({
      to: chipRegistry.address,
      data: chipRegistry.interface.encodeFunctionData("resolveChip", [chipId]),
    }, blockTag);
    console.log(data);
    return parseRecordsForContentApp(data);
  } catch(e) {
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
    console.log("checking legacy");
    const legacy = await checkLegacy(url);

    if (legacy.exists) {
      console.log(`redirecting to ${legacy.redirectUrl}`);
      // window.location.href = legacy.redirectUrl;
      return;
    } else {
      try {
        const contentApp = await checkERS(url);
        window.location.href = contentApp;
        return;
      } catch(e) {
        const params = window.location.href.split("?")[1];
        window.location.href = "https://boot.arx.org?" + params;
        return;
      }
    }
  }
}

readContract();
