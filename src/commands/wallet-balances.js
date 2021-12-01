'use strict'

// Public NPM libraries
const AvaxWallet = require('minimal-avax-wallet/index')
const Table = require('cli-table')

// Local libraries
const fs = require('fs')
const networks = require('../lib/networks')
const WalletUtil = require('../lib/wallet-util')

const { Command, flags } = require('@oclif/command')

class WalletBalances extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.fs = fs
    this.walletUtil = new WalletUtil()
    this.AvaxWallet = AvaxWallet
  }

  async run () {
    try {
      const { flags } = this.parse(WalletBalances)

      // Validate input flags
      this.validateFlags(flags)

      const filename = `${__dirname.toString()}/../../.wallets/${flags.name}.json`

      // Get the wallet with updated UTXO data.
      const walletData = await this.getBalances(filename)

      // Display wallet balances on the screen.
      this.displayBalance(walletData, flags)

      return true
    } catch (err) {
      console.log('Error in run(): ', err)

      return false
    }
  }

  async getBalances (filename) {
    try {
      // Load the wallet file.
      const walletJSON = await this.walletUtil.openWallet(filename)
      const walletData = walletJSON.wallet

      // Configure the minimal-avax-wallet library.
      const advancedConfig = {
        interface: 'rest-api'
        // interface: 'json-rpc', commented out for now
      }
      // fuji API fixed
      if (walletData.networkID === networks.fuji.networkID) {
        advancedConfig.host = networks.fuji.host
        advancedConfig.port = networks.fuji.post
        advancedConfig.networkID = networks.fuji.networkID
      }

      const privKey = walletData.mnemonic || walletData.privateKey
      this.avaxWallet = new this.AvaxWallet(privKey, advancedConfig)
      // Wait for the wallet to initialize and retrieve UTXO data
      await this.avaxWallet.walletInfoPromise

      // If UTXOs fail to update, try one more time.
      if (!this.avaxWallet.utxos.utxoStore) {
        await this.avaxWallet.getUtxos()

        // Throw an error if UTXOs are still not updated.
        if (!this.avaxWallet.utxos.utxoStore) {
          throw new Error('UTXOs failed to update. Try again.')
        }
      }

      // fetch balance of assets as well
      const assets = await this.avaxWallet.listAssets()
      this.avaxWallet.utxos.assets = assets

      return this.avaxWallet
    } catch (err) {
      console.log('Error in getBalances()', err.message)
      throw err
    }
  }

  // Take the updated wallet data and display it on the screen.
  displayBalance (walletData, flags = {}) {
    try {
      const table = new Table({ head: ['ID', 'Name', 'Quantity', 'Denomination'] })

      console.log(`\nWallet: ${walletData.walletInfo.address}`)
      console.log('\nAssets:')
      const assets = walletData.utxos.assets
      for (const asset of assets) {
        const amount = asset.amount * Math.pow(10, -(+asset.denomination))
        table.push([
          asset.assetID,
          asset.name,
          amount.toFixed(asset.denomination),
          asset.denomination
        ])
      }

      if (flags.verbose) {
        console.log(
          `\nUTXO information:\n${JSON.stringify(
            walletData.utxos.utxoStore,
            null,
            2
          )}`
        )
      }

      this.log(table.toString())

      return true
    } catch (err) {
      console.error('Error in displayBalance()')
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

    return true
  }
}

WalletBalances.description = 'Display the balances of the wallet'

WalletBalances.flags = {
  name: flags.string({ char: 'n', description: 'Name of wallet' }),
  verbose: flags.boolean({
    char: 'v',
    description: 'Show verbose UTXO information'
  })
}

module.exports = WalletBalances
