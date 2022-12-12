import { ethers } from "ethers";
import URL from "url-parse";
import { abi } from "./abi.json";
import parseKeys from "./helpers/parseKeys";

// Canonical ENS registry and network.
const ENS_REGISTRY = "0xB26A49dAD928C6A045e23f00683e3ee9F65dEB23";
const ENS_NETWORK =
  "https://opt-mainnet.g.alchemy.com/v2/Mx_q-MkGapjZcN0E6Kh4dJVbZq84F3zG";

async function readContract() {
  (async () => {
    const rawResponse = await fetch(ENS_NETWORK, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to: "0xB26A49dAD928C6A045e23f00683e3ee9F65dEB23",
            data: "0xfe44ba7fdf479c86c881d1fd945a5f34f14f8ba04670206c59d861c67e18195575415c3c",
          },
        ],
        id: 1,
      }),
    });

    const content = await rawResponse.json();

    console.log(content);
  })();

  // Create Provider.
  const provider = new ethers.providers.JsonRpcProvider(ENS_NETWORK);

  // Create contract instance.
  const contact = await new ethers.Contract(ENS_REGISTRY, abi, provider);

  // Run function.
  const url = new URL(window.location.href, true);

  if (!url.query.static) {
    // window.location.href = "https://halo.vrfy.ch";
    return;
  } else {
    const chipId = parseKeys(url.query.static);
    const exists = await contact.chipExists(chipId);
    const params = window.location.href.split("?")[1];

    // if (exists) {
    //   const url = await contact.chipUri(chipId);
    //   window.location.href = url + "?" + params;
    // } else {
    //   window.location.href = "https://halo.vrfy.ch/" + "?" + params;
    // }
  }
}

readContract();
