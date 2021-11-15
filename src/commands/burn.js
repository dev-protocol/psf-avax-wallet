/*
  Burn a quantity of an asset
*/

'use strict'

// Public NPM libraries
const AvaxWallet = require('minimal-avax-wallet/index')

// Local libraries
const WalletUtil = require('../lib/wallet-util')
const WalletBalances = require('./wallet-balances')

const { Command, flags } = require('@oclif/command')

class BurnAsset extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.walletUtil = new WalletUtil()
    this.AvaxWallet = AvaxWallet
    this.walletBalances = new WalletBalances()
  }

  async run () {
    try {
      const { flags } = this.parse(BurnAsset)

      // Validate input flags
      this.validateFlags(flags)

      const filename = `${__dirname.toString()}/../../.wallets/${flags.name}.json`

      const txid = await this.burnAsset(filename, flags)

      return txid
    } catch (err) {
      console.log('Error in burn.js/run(): ', err)

      return 0
    }
  }

  // Burn a quantity of assets.
  async burnAsset (filename, flags) {
    try {
      // Input validation
      if (!filename || typeof filename !== 'string') {
        throw new Error('filename required.')
      }

      const exists = await this.walletUtil.walletExists(filename)
      if (!exists) {
        throw new Error('Wallet doesnt exists')
      }

      const walletData = await this.walletBalances.getBalances(filename)
      const asset = walletData.utxos.assets.find(item => item.assetID === flags.assetID)

      if (!asset) {
        throw new Error(
          `Insufficient funds. You are trying to burn ${flags.amount} ${flags.assetID}, but the wallet doesn't have any`
        )
      }

      // parse it from base0 to the whole number (the equivalent of sats in BCH)
      const amount = parseFloat(flags.amount) * Math.pow(10, asset.denomination)

      const txid = await walletData.burnTokens(
        amount,
        flags.assetID
      )

      return txid
    } catch (err) {
      console.error('Error in burnAsset()')
      throw err
    }
  }

  // Validate the proper flags are passed in.
  validateFlags (flags) {
    // Exit if wallet not specified.
    const name = flags.name
    if (!name || name === '') {
      throw new Error('You must specify a wallet with the -n flag.')
    }

    const amount = flags.amount
    if (isNaN(Number(amount))) {
      throw new TypeError(
        'You must specify a asset amount with the -q flag.'
      )
    }

    const assetID = flags.assetID
    if (!assetID || assetID === '') {
      throw new Error('You must specify an asset Id with the -t flag.')
    }

    return true
  }
}

BurnAsset.description = 'Burn a specific quantity of ANT or avax'

BurnAsset.flags = {
  name: flags.string({ char: 'n', description: 'Name of wallet' }),
  amount: flags.string({ char: 'q', description: 'Quantity of ANT to burn' }),
  assetID: flags.string({ char: 't', description: 'assetID of ANT to burn' })
}

module.exports = BurnAsset
