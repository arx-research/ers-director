import { ethers } from "ethers";
import URL from "url-parse";
import { abi } from "./abi.json";
import parseKeys from "./helpers/parseKeys";

async function readContract() {
  // Create Provider
  const provider = new ethers.providers.JsonRpcProvider(
    "https://kovan.optimism.io"
  );

  // Create contract instance
  const contact = await new ethers.Contract(
    "0x58228adF88fe48E421A8220Ede6CCFE70AB2A785",
    abi,
    provider
  );

  // Run function
  const url = new URL(window.location.href, true);

  if (!url.query.static) {
    window.location.href = "https://eth.vrfy.ch";
    return;
  } else {
    const chipId = parseKeys(url.query.static);
    const exists = await contact.chipExists(chipId);
    const params = window.location.href.split("?")[1];

    if (exists) {
      const url = await contact.chipUri(chipId);

      window.location.href = url + "?" + params;
    } else {
      window.location.href = "https://eth.vrfy.ch/" + "?" + params;
    }
  }
}

readContract();
