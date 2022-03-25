/*
  A mock file for minimal-avax-wallet
*/

class AvalancheWallet {
  constructor () {
    this.walletInfoPromise = true

    this.walletInfo = {
      type: 'mnemonic',
      mnemonic: 'stove off mirror shallow rigid language stairs rate mirror other cup aerobic arch brief tower click hand icon parent employ treat animal debate core',
      address: 'X-avax192g35v4jmnarjzczpdqxzvwlx44cfg4p0yk4qd',
      privateKey: 'PrivateKey-8NFb6YinvHtjtfHW3JRm3qoDdQceXEuTRcLRvj3BAxNg3dX7y',
      publicKey: '5iwDpFGJdZXwhNjhC8VinAHT3T7ny3HiYLN2mdJUqK9Z2gorQj',
      avax: 0,
      description: ''
    }

    // Environment variable is used by wallet-balance.unit.js to force an error.
    if (process.env.NO_UTXO) {
      this.utxos = {}
    } else {
      this.utxos = {
        utxoStore: [
          {
            txid: '3LxJXtS6FYkSpcRLPu1EeGZDdFBY41J4YxH1Nwohxs2evUo1U',
            outputIdx: '00000001',
            amount: 1,
            assetID: '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5',
            typeID: 6
          },
          {
            txid: 'Fy3NFR7DrriWWNBpogrsgXoAmZpdYcoRHz6n7uW17nRHBVcm3',
            outputIdx: '00000001',
            amount: 380,
            assetID: '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5',
            typeID: 7
          },

          {
            txid: 'Fy3NFR7DrriWWNBpogrsgXoAmZpdYcoRHz6n7uW17nRHBVcm3',
            outputIdx: '00000000',
            amount: 18000000,
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
            amount: 18000000
          },
          {
            assetID: '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5',
            name: 'Arepa Token',
            symbol: 'ARP',
            denomination: 2,
            amount: 380
          },
          {
            isNFT: true,
            assetID: 'CuTnDJAVFSea6VzEj8UXieWmdrANzyFfL3Cge7XyHbT5RsXn1',
            name: 'Bikes',
            symbol: 'BYK',
            denomination: 0,
            amount: 1
          }
        ]
      }
    }
  }

  async getUtxos () {
    if (process.env.NO_UPDATE) {
      return []
    }

    this.utxos = {
      utxoStore: [
        {
          txid: 'Fy3NFR7DrriWWNBpogrsgXoAmZpdYcoRHz6n7uW17nRHBVcm3',
          outputIdx: '00000000',
          amount: 18000000,
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
          amount: 18000000
        }
      ]
    }
    return []
  }

  async send (outputs) {
    return 'someid'
  }

  async sendNFT (outputs) {
    return 'nfttxid'
  }

  async burnTokens (amount, assetID) {
    // just for the sake of tests
    this.outputs = [{ amount, assetID }]
    return 'someburnid'
  }

  async listAssets () {
    return [
      {
        assetID: 'Avax',
        name: 'Avalanche',
        symbol: 'AVAX',
        denomination: 9,
        amount: 18000000
      },
      {
        assetID: '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5',
        name: 'Arepa Token',
        symbol: 'ARP',
        denomination: 2,
        amount: 380
      }
    ]
  }
}

module.exports = AvalancheWallet
