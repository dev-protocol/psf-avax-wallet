/*
  A mock file for minimal-avax-wallet
*/
const OfferMakeWallet = {
  walletInfo: {
    type: 'mnemonic',
    mnemonic: '',
    address: 'X-avax1x47tu0zj4ss3lf4kvmvyk0hk4gwp07t7jhh0kn',
    privateKey: 'PrivateKey-NK4XCMig9t7WY3XTqArj7wByiE3rTgDohnPZTfjs1F3Ldjsgj',
    publicKey: '6TtGQaz7RJj6t946NndC5jhQdwW1enhPbhyjiC7EP7U2WAjsAF',
    avax: 0,
    description: ''
  },
  utxos: [
    {
      txid: '2ns8XVRdy8TRVJJaa9BTNTu2AvpdGweQ3vXfq3WnJVzApbXCH2',
      outputIdx: '00000001',
      amount: 100,
      assetID: '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5',
      typeID: 7
    },
    {
      txid: 'owo8dq5JHEjJQrj9jfTeTvz1T8BoV22G1asHBjCG2L528XQ5C',
      outputIdx: '00000004',
      amount: 7000,
      assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
      typeID: 7
    }
  ],
  assets: [
    {
      assetID: '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5',
      name: 'SOME TOKEN',
      symbol: 'ARP',
      denomination: 2,
      amount: 100
    },
    {
      assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
      name: 'Bridge Test Token',
      symbol: 'BTT',
      denomination: 2,
      amount: 7000
    }
  ]
}

const OfferTakeWallet = {
  walletInfo: {
    type: 'mnemonic',
    mnemonic: 'salt page glide weather bone join leaf maid suit effort inquiry shrug box hockey kidney belt pony say legal half exit brush original cigar',
    address: 'X-avax1kddkql0gskpdqa58c3paa9kdkp92wuma4w6zj6',
    privateKey: 'PrivateKey-oBkPi2XJ7Nuzgjc3qGSosnPwMiH8A5FnjoQ12YNtT2n6DBXq8',
    publicKey: '4xoQHp5QMUe2N5Eg9StvA8TSYAQUp7WyBRnrNTAV3FeUSHog6Y',
    avax: 0,
    description: ''
  },
  utxos: [
    {
      txid: 'qRTFJsBdBBk5PZatmbXMwKvDGUQAxqLi8jRGXVwqVe8dCqTbW',
      outputIdx: '00000002',
      amount: 30000000,
      assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
      typeID: 7
    },
    {
      txid: 'qRTFJsBdBBk5PZatmbXMwKvDGUQAxqLi8jRGXVwqVe8dCqTbW',
      outputIdx: '00000000',
      amount: 22000000,
      assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
      typeID: 7
    },
    {
      txid: 'qRTFJsBdBBk5PZatmbXMwKvDGUQAxqLi8jRGXVwqVe8dCqTbW',
      outputIdx: '00000003',
      amount: 30000000,
      assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
      typeID: 7
    },
    {
      txid: 'qRTFJsBdBBk5PZatmbXMwKvDGUQAxqLi8jRGXVwqVe8dCqTbW',
      outputIdx: '00000001',
      amount: 1000000,
      assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
      typeID: 7
    }
  ],
  assets: [
    {
      assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
      name: 'Avalanche',
      symbol: 'AVAX',
      denomination: 9,
      amount: 85000000
    }
  ]
}

const offerMade = {
  txHex: '00000001ed5f38341e436e5d46e2bb00b45d62ae97d1b050c64bc634ae10626739e35c' +
    '4b0000000221e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a8' +
    '7dff000000070000000001312d0000000000000000000000000100000001639779b615' +
    'd3d9052915ba105bb26627383225c2f808d594b0360d20f7b4214bdb51a773d0f5eb34' +
    'c5157eea285fefa5a86f5e16000000070000000000001b580000000000000000000000' +
    '0100000001639779b615d3d9052915ba105bb26627383225c2000000026a9802ce0e67' +
    '81104c752ab0e597b33d10d398a170479390fc5364f7ec2024d100000004f808d594b0' +
    '360d20f7b4214bdb51a773d0f5eb34c5157eea285fefa5a86f5e160000000500000000' +
    '00001b580000000100000000ebd62c45493b7414ff03147d59d5a8c61521fc784a942f' +
    '772beb64c6c6a9c58400000001e49b53ab21c6f7b10bf8efb3e3bc0059954989b3d481' +
    'a9cb862f4b0b7d57c64500000005000000000000006400000001000000000000002254' +
    '7820637265617465642066726f6d206f66666572206d616b6520636f6d6d616e64',
  addrReferences: '{"2ns8XVRdy8TRVJJaa9BTNTu2AvpdGweQ3vXfq3WnJVzAn2Qp9E":"X-avax1x47tu0zj4ss3lf4kvmvyk0hk4gwp07t7jhh0kn"}'
}

module.exports = {
  OfferMakeWallet,
  OfferTakeWallet,
  offerMade
}
