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

module.exports = { OfferMakeWallet }
