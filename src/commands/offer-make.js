/*
  This command is the first of three commands to interact with the DEX.
  offer-make creates a new offer in the open market to sell a token for AVAX.

  At present, this command is used to help with debugging the avax-dex:
  https://github.com/Permissionless-Software-Foundation/avax-dex

  Example:
  Alice offers 1 token for sale at 0.002 AVAX.
  ./bin/run offer-make -n alice -a 0.002 -q 1 -t 2aK8oMc5izZbmSsBiNzb6kPNjXeiQGPLUy1sFqoF3d9QEzi9si

  This command generates an JSON object that contains two properties:
  - txHex - is the transaction hex of a partial transaction. It contains the
    following:
    - Input 1: Alice's token UTXO being offered for sale (unsigned).
    - Output 1: The AVAX sent to Alice.
    - Output 2: The change for the unsold tokens, going back to Alice
  - addrReferences - Contains additional information about the UTXO for sale
    that gets lost when compiling the partial transaction to hex:
    - key1 - TXID of the UTXO for sale.
    - value1 - The address controlling the UTXO.

  Example output:
  Offer made: {
    "txHex": "00000001ed5f38341e436e5d46e2bb00b45d62ae97d1b050c64bc634ae10626739e35c4b0000000221e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff0000000700000000001e8480000000000000000000000001000000015d72133454d4351d6ba784b22183c947ef153d0dcf56299d91d7a12b83650ed5ffaacaac3d03a0f1ee1aca8193e76423e49265a8000000070000000000000384000000000000000000000001000000015d72133454d4351d6ba784b22183c947ef153d0d000000018f60207cf0073e9cab6fb39a9553585fc923d328e0f67d73d973c4c4731962c200000001cf56299d91d7a12b83650ed5ffaacaac3d03a0f1ee1aca8193e76423e49265a80000000500000000000003e8000000010000000000000022547820637265617465642066726f6d206f66666572206d616b6520636f6d6d616e64",
    "addrReferences": "{\"269LQd4Jjdp41j35bavWWGfSud2FuenEDQWP8nwq7LZ69HUy8L\":\"X-avax1t4epxdz56s6366a8sjezrq7fglh320gd2n7wh3\"}"
  }

  Dev Notes:
  - CT 11/29/21: not sure if you can do a 'buy' order with this code)
  - See this Issue for background info:
    https://github.com/Permissionless-Software-Foundation/psf-avax-wallet/issues/4
*/

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

      // parse it from base-10 to the whole number (the equivalent of sats in BCH)
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

OfferMake.description = `
Create an offer to 'sell' tokens in exchange for a given amount of AVAX

This command generates an JSON object that contains two properties:
- txHex - is the transaction hex of a partial transaction. It contains the
  following:
  - Input 1: The token UTXO being offered for sale.
  - Output 1: The AVAX sent to the seller of the token.
  - Output 2: The change for the unsold tokens, going to the seller.
- addrReferences - Contains additional information about the UTXO for sale
  that gets lost when compiling the partial transaction to hex:
  - key - TXID of the UTXO for sale.
  - value - The address controlling the UTXO.
`

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
