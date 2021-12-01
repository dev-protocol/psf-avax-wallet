/*
  A mock file for minimal-avax-wallet
*/

class AvalancheWallet {
  constructor () {
    this.walletInfoPromise = true

    this.walletInfo = {
      type: 'mnemonic',
      mnemonic: 'trouble puzzle swift police embark insect ensure reduce believe move domain grant tooth vivid melt goddess chunk tail toward where cloud wise trend cat',
      address: 'X-fuji15f8s5pr2rvvqxw8lc98r9wuuxew03kwg8qyhsp',
      privateKey: 'PrivateKey-2i2Vp5AXaH2hpx9CdpHRPA2uCSXB4K5bVuKDLmkXHczeZy7bAn',
      publicKey: '4xAfsqLXUUkG3eQS42NKAcxad1UojVugxgakJzEQa8DyCdYLoy',
      avax: 0,
      description: '',
      networkID: 5
    }

    // Environment variable is used by wallet-balance.unit.js to force an error.
    if (process.env.NO_UTXO) {
      this.utxos = {}
    } else {
      this.utxos = {
        utxoStore: [
          {
            txid: 'LdXPbv63oWGdjpw69oM9i6GeEDEGinshN22pLX8rBf5vafx2s',
            outputIdx: '00000001',
            amount: 1000000000,
            assetID: 'U8iRqJoiJm8xZHAacmvYyZVwqQx6uDNtQeP3CQ6fcgQk3JqnK',
            typeID: 7
          },
          {
            txid: 'cCQFJLc5DrruiKNP8rCKsuwpNqRdpfDNEwb1obCi3Nk9p8pSD',
            outputIdx: '00000000',
            amount: 999000000,
            assetID: 'U8iRqJoiJm8xZHAacmvYyZVwqQx6uDNtQeP3CQ6fcgQk3JqnK',
            typeID: 7
          },
          {
            txid: '2BzhiiZcaqcQnfJnwhmodBJm9J6w56FSsoRRCrsH8ApXq9DP3v',
            outputIdx: '00000002',
            amount: 1,
            assetID: '2F9HnDDhWz5kZCmNiYLkcaBB6JdA9mYHoUqeQa9B4G669cuk5F',
            typeID: 11
          }
        ],
        assets: [
          {
            assetID: 'U8iRqJoiJm8xZHAacmvYyZVwqQx6uDNtQeP3CQ6fcgQk3JqnK',
            name: 'Avalanche',
            symbol: 'AVAX',
            denomination: 9,
            amount: 1999000000
          },
          {
            assetID: '2F9HnDDhWz5kZCmNiYLkcaBB6JdA9mYHoUqeQa9B4G669cuk5F',
            name: 'Non-Fungible Token (NFT)',
            symbol: 'TEST',
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
          txid: 'LdXPbv63oWGdjpw69oM9i6GeEDEGinshN22pLX8rBf5vafx2s',
          outputIdx: '00000001',
          amount: 1000000000,
          assetID: 'U8iRqJoiJm8xZHAacmvYyZVwqQx6uDNtQeP3CQ6fcgQk3JqnK',
          typeID: 7
        }
      ],
      assets: [
        {
          assetID: 'U8iRqJoiJm8xZHAacmvYyZVwqQx6uDNtQeP3CQ6fcgQk3JqnK',
          name: 'Avalanche',
          symbol: 'AVAX',
          denomination: 9,
          amount: 1000000000
        }
      ]
    }
    return []
  }

  async send (outputs) {
    // just for the sake of tests
    this.outputs = outputs
    return 'someid'
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
        amount: 1000000000
      },
      {
        assetID: '2F9HnDDhWz5kZCmNiYLkcaBB6JdA9mYHoUqeQa9B4G669cuk5F',
        name: 'Non-Fungible Token (NFT)',
        symbol: 'TEST',
        denomination: 0,
        amount: 1
      }
    ]
  }
}

module.exports = AvalancheWallet
