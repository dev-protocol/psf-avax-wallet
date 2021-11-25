'use strict'

// Local libraries
const WalletBalances = require('./wallet-balances')

const { Command, flags } = require('@oclif/command')
const WalletUtil = require('../lib/wallet-util')

class OfferAccept extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.walletUtil = new WalletUtil()
    this.walletBalances = new WalletBalances()
  }

  async run () {
    try {
      const { flags } = this.parse(OfferAccept)

      // Validate input flags
      this.validateFlags(flags)

      const filename = `${__dirname.toString()}/../../.wallets/${flags.name}.json`
      const referece = flags.referece
      const txHex = flags.txHex

      // Get the wallet with updated UTXO data.
      const txInfo = await this.offerAccept(filename, txHex, referece)
      this.log(`Offer made: ${JSON.stringify(txInfo, null, 2)}`)
      return true
    } catch (err) {
      this.log('Error in run(): ', err)

      return false
    }
  }

  async offerAccept (filename, txHex, addrReferences) {
    try {
      const walletData = await this.walletBalances.getBalances(filename)

      addrReferences = JSON.parse(addrReferences)

      // Parse the partially signed transaction
      const halfSignedTx = new walletData.utxos.avm.Tx()
      const txBuffer = Buffer.from(txHex, 'hex')
      halfSignedTx.fromBuffer(txBuffer)

      const credentials = halfSignedTx.getCredentials()
      const partialTx = halfSignedTx.getUnsignedTx()

      // Partially sign the tx
      const keyChain = walletData.tokens.xchain.keyChain()
      keyChain.importKey(walletData.walletInfo.privateKey)

      const signed = this.walletUtil.partialySignTx(
        walletData,
        partialTx,
        keyChain,
        addrReferences,
        credentials
      )

      // check the trasaction was signed
      const newCredentials = signed.getCredentials()
      const hasAllSignatures = newCredentials.every(cred => Boolean(cred.sigArray.length))

      if (!hasAllSignatures) {
        throw new Error('The transaction is not fully signed')
      }

      // const txid = await walletData.sendAvax.ar.issueTx(signed)
      return { txid: 'as' }
    } catch (err) {
      this.log('Error in make-offer.js/accept()', err)
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

    const txHex = flags.txHex
    if (typeof txHex !== 'string' || !txHex.length) {
      throw new Error('You must specify transaction hex with the -h flag')
    }

    let referece = flags.referece
    if (typeof referece !== 'string' || !referece.length) {
      throw new Error('You must specify the utxos address reference with the -r flag')
    }

    referece = JSON.parse(referece)

    return true
  }
}

OfferAccept.description = 'Accept the offer as a partially signed transaction, signs the remaining UTXOS and broadcast it'

OfferAccept.flags = {
  name: flags.string({ char: 'n', description: 'Name of wallet' }),
  referece: flags.string({
    char: 'r',
    description: 'the address reference as JSON'
  }),
  txHex: flags.string({
    char: 'h',
    description: 'the previous partial transaction encoded as hex'
  })
}

module.exports = OfferAccept
