# HaLo Director

Direct a chip based on the `chipId` and the desired URI in the ENS registry. If the chip or URI cannot be located then the user will be redirected to `halo.vrfy.ch`.

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