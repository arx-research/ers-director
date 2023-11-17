# HaLo Director

Direct a chip based its public key and derviced `chipId` and the desired `contentApp` in the [ERS registry](https://github.com/arx-research/ers-contracts). 

If the `chipId` or associated `contentApp` cannot be located then the user will be redirected to the bootloader app for the chip, typically `boot.arx.org` for Arx HaLo chips.

See [ERS scripts](https://github.com/arx-research/ers-scripts) to enroll chips in ERS.

## Commands

### Install

```
npm install
```

### Develop

```
npm run dev
```

### Build

```
npm run build
```

## TODOs

- [ ] Minify JavaScript.
- [ ] Remove `ethers` in favor of direct RPC call.
- [ ] Timeout in the event of an RPC failure.
- [ ] Add fallback RPC nodes.