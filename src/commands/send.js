/*
  Sends a quantity of avax or any ANT.
*/

'use strict'

// Public NPM libraries
const AvaxWallet = require('minimal-avax-wallet/index')

// Local libraries
const WalletUtil = require('../lib/wallet-util')
const WalletBalances = require('./wallet-balances')

const { Command, flags } = require('@oclif/command')

class SendAsset extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.walletUtil = new WalletUtil()
    this.AvaxWallet = AvaxWallet
    this.walletBalances = new WalletBalances()
  }

  async run () {
    try {
      const { flags } = this.parse(SendAsset)

      // Validate input flags
      this.validateFlags(flags)

      const filename = `${__dirname.toString()}/../../.wallets/${flags.name}.json`

      const txid = await this.sendAsset(filename, flags)

      return txid
    } catch (err) {
      console.log('Error in send.js/sendAsset(): ', err.message)

      return 0
    }
  }

  // Send an asset from the wallet implied by filename, and with the settings saved
  // in the flags object.
  async sendAsset (filename, flags) {
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

      const asset = walletData.utxos.assets.find(item => {
        return (!flags.assetId && item.assetID === 'AVAX') || item.assetID === flags.assetId
      })

      if (!asset) {
        throw new Error(
          `Insufficient funds. You are trying to send ${flags.amount} ${flags.assetId}, but the wallet doesn't have any`
        )
      }

      // parse it from base0 to the whole number (the equivalent of sats in BCH)
      const amount = parseFloat(flags.amount) * Math.pow(10, asset.denomination)

      const outputs = [{
        address: flags.sendAddr,
        amount,
        assetID: flags.assetId
      }]

      const txid = await walletData.send(outputs)
      return txid
    } catch (err) {
      console.error('Error in sendAsset()')
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
        'You must specify the asset quantity with the -q flag.'
      )
    }

    const sendAddr = flags.sendAddr
    if (!sendAddr || sendAddr === '') {
      throw new Error('You must specify a send-to address with the -a flag.')
    }

    return true
  }
}

SendAsset.description = 'Send avalanche native assets and avax'

SendAsset.flags = {
  name: flags.string({ char: 'n', description: 'Name of wallet' }),
  amount: flags.string({ char: 'q', description: 'asset quantity to send' }),
  sendAddr: flags.string({ char: 'a', description: 'XChain address to send to' }),
  assetId: flags.string({
    char: 't',
    description: 'AssetID (default is avax)',
    default: ''
  })
}

module.exports = SendAsset
