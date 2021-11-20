'use strict'

// Local libraries
const WalletBalances = require('./wallet-balances')

const { Command, flags } = require('@oclif/command')
const WalletUtil = require('../lib/wallet-util')

class OfferMake extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.walletUtil = new WalletUtil()
    this.walletBalances = new WalletBalances()
    this.avaxID = 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z'
  }

  async run () {
    try {
      const { flags } = this.parse(OfferMake)

      // Validate input flags
      this.validateFlags(flags)

      const filename = `${__dirname.toString()}/../../.wallets/${
        flags.name
      }.json`
      const amount = flags.amount
      const avax = flags.avax
      const assetID = flags.assetID

      // Get the wallet with updated UTXO data.
      const txInfo = await this.offerMake(filename, assetID, amount, avax)
      this.log(`Offer made: ${JSON.stringify(txInfo, null, 2)}`)
      return true
    } catch (err) {
      console.log('Error in offer-make.js/run(): ', err.message)

      return 0
    }
  }

  async offerMake (filename, assetID, assetAmount, avaxAmount) {
    try {
      const walletData = await this.walletBalances.getBalances(filename)

      const asset = walletData.utxos.assets.find(
        (item) => item.assetID === assetID
      )

      if (!asset) {
        throw new Error(
          `Insufficient funds. You are trying to send ${assetAmount} ${assetID}, but the wallet doesn't have any`
        )
      }

      // parse it from base0 to the whole number (the equivalent of sats in BCH)
      assetAmount = parseFloat(assetAmount) * Math.pow(10, asset.denomination)
      avaxAmount = parseFloat(avaxAmount) * Math.pow(10, 9) // 1 AVAX = 1x10^9 nAVAX

      if (asset.amount < assetAmount) {
        throw new Error(`Not enough assets (${asset.name}) to be sent`)
      }

      const address = walletData.walletInfo.address

      // arrange the inputs
      const addrReferences = {}
      const inputs = []
      for (const item of walletData.utxos.utxoStore) {
        if (item.assetID !== assetID) {
          continue
        }
        const utxo = walletData.utxos.encodeUtxo(item, address)
        const utxoID = utxo.getUTXOID()

        addrReferences[utxoID] = address
        inputs.push(utxo)
      }

      // get the desired asset outputs for the transaction
      const avaxOutput = walletData.utxos.formatOutput({
        amount: avaxAmount,
        address,
        assetID: this.avaxID
      })
      const outputs = [avaxOutput]

      const remainder = asset.amount - assetAmount
      if (remainder > 0) {
        const remainderOut = walletData.utxos.formatOutput({
          amount: remainder,
          address,
          assetID
        })
        outputs.push(remainderOut)
      }

      // Build the transcation
      const partialTx = new walletData.utxos.avm.BaseTx(
        walletData.ava.getNetworkID(),
        walletData.bintools.cb58Decode(
          walletData.tokens.xchain.getBlockchainID()
        ),
        outputs,
        inputs,
        Buffer.from('Tx created from offer make command')
      )

      const hexString = partialTx.toBuffer().toString('hex')

      return {
        txHex: hexString,
        addrReferences: JSON.stringify(addrReferences)
      }
    } catch (err) {
      console.log('Error in offer-make.js/offerMake()', err)
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
      throw new Error('You must specify the asset quantity with the -q flag')
    }

    const avax = flags.avax
    if (isNaN(Number(avax))) {
      throw new Error('You must specify an avax quantity with the -a flag')
    }

    const assetID = flags.assetID
    if (typeof assetID !== 'string' || !assetID.length) {
      throw new Error('You must specifiy the assetID ID with the -t flag')
    }

    return true
  }
}

OfferMake.description = 'Create an offer to \'sell\' tokens in exchange for a given amount of AVAX'

OfferMake.flags = {
  name: flags.string({ char: 'n', description: 'Name of wallet' }),
  assetID: flags.string({ char: 't', description: 'Asset ID' }),
  amount: flags.string({
    char: 'q',
    description: 'Quantity of assets to send'
  }),
  avax: flags.string({ char: 'a', description: 'Quantity of avax to request' })
}

module.exports = OfferMake
