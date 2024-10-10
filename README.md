# ERS Director

ERS Director is an entrypoint [ERS](https://docs.ers.to/) that is deployed at `https://*.vrfy.ch`. It conducts a chip lookup based its public key and derived `chipId` and will resolve to the desired `contentApp` in the [ERS registry](https://github.com/arx-research/ers-contracts). When redirecting a chip, all query paramaters will included, for example an Arx chip might look like this:

```
?av=&A02.01.000090.9BFF4326v=01.C5.000005.20F240F4&flags=00&pk1=0428C896E83F6B51C838ADD8C537BD1F2CD45AB152B75436C2BCFBFEAE2905C09D8F03F3071E609CFCE6B3A5E1397484B5EFE2F054C1093F05825999442E8688FE&pk2=040523464ACA95D50C5945A40FF62F36E2227A9123AFBED627ED3E11207B593C24FFC78E17B28039F30E572B90C4496AB42AA12755092270FEBCCA2BA7DF0139FF&latch2=0101010101010101010101010101010101010101010101010101010101010101&rnd=000000507A27899EC02BF491F5B469D48CC45BE4C045E206903E3865BA96D382&rndsig=304502202FB534B05B6B36B5DCB73D180BF3BC001F1EC06D8B9DC7DAC3036C910B2A5BFF022100C89E36BA52647F3AC89175A6D3D7436F550FB02977DF89E4D0DDA27F11FAC66E04&cmd=0101&res=304402201A2093A9440620536C0F929B608D775948397BB6EAB0605A685B8130C7A407AC02202326F45A3F8566B5F1D3D083E80B76C5A1AA0A9036E3772197D92F60994B80B4
```

If the `chipId` or associated `contentApp` cannot be located, then the user will be redirected to the bootloader app for the chip. Typically this is `boot.arx.org` for Arx HaLo chips.

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