/*
  List the addresses for the selected wallet
*/

'use strict'

const shelljs = require('shelljs')

const { Command, flags } = require('@oclif/command')

// Local libraries
const WalletUtil = require('../lib/wallet-util')

class WalletAddrs extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.shelljs = shelljs
    this.walletUtil = new WalletUtil()
  }

  async run () {
    try {
      const { flags } = this.parse(WalletAddrs)

      // Validate input flags
      this.validateFlags(flags)

      const filename = `${__dirname.toString()}/../../.wallets/${flags.name}.json`

      return this.getAddrs(filename)
    } catch (err) {
      console.log(err)
      return 0
    }
  }

  async getAddrs (filename) {
    try {
      const walletJSON = await this.walletUtil.openWallet(filename)
      const walletData = walletJSON.wallet

      this.log(' ')
      this.log(`XChain Address: ${walletData.address}`)
      this.log(' ')
      return walletData
    } catch (err) {
      console.error('Error in getAddrs()')
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

WalletAddrs.description = 'List the XChain address for a wallet.'

WalletAddrs.flags = {
  name: flags.string({ char: 'n', description: 'Name of wallet' })
}

module.exports = WalletAddrs
