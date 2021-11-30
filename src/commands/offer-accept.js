/*
  This command is the third of three commands to interact with the DEX.
  This command is used by Alice to accept Bob's counter-offer. It checks
  the partially signed transaction for correctness, then signs Alice's input,
  and broadcasts the finalized transaction.

  At present, this command is used to help with debugging the avax-dex:
  https://github.com/Permissionless-Software-Foundation/avax-dex

  Example:
  This command takes the output of offer-take as its input.
  Alice accepts Bob's counteroffer:
  ./bin/run offer-accept -n alice -h "00000000000000000001ed5f38341e436e5d46e2bb00b45d62ae97d1b050c64bc634ae10626739e35c4b0000000421e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff0000000700000000000f424000000000000000000000000100000001cc72006d972f394d54cb0219d3fb71b6a3dff5c021e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff0000000700000000001e8480000000000000000000000001000000015d72133454d4351d6ba784b22183c947ef153d0dcf56299d91d7a12b83650ed5ffaacaac3d03a0f1ee1aca8193e76423e49265a800000007000000000000006400000000000000000000000100000001cc72006d972f394d54cb0219d3fb71b6a3dff5c0cf56299d91d7a12b83650ed5ffaacaac3d03a0f1ee1aca8193e76423e49265a8000000070000000000000384000000000000000000000001000000015d72133454d4351d6ba784b22183c947ef153d0d000000028f60207cf0073e9cab6fb39a9553585fc923d328e0f67d73d973c4c4731962c200000001cf56299d91d7a12b83650ed5ffaacaac3d03a0f1ee1aca8193e76423e49265a80000000500000000000003e80000000100000000b6cd48f7470cf0b508b70ae8af3bb40ab07c0e2ab30ea5e0b402ca0a97bce2c30000000021e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff0000000500000000003d0900000000010000000000000022547820637265617465642066726f6d206f666665722074616b6520636f6d6d616e640000000200000009000000000000000900000001183d8b71f882e427d3837b4f2f8532cfbf4c6764bb68151b8a3d9c6682ad91f75f8b68ce66e8cd425cdf62b3abbd33da24d1dc060a628be22883c4df5d911f1401" -r "{\"269LQd4Jjdp41j35bavWWGfSud2FuenEDQWP8nwq7LZ69HUy8L\":\"X-avax1t4epxdz56s6366a8sjezrq7fglh320gd2n7wh3\",\"2PWRtLCU8rVqxLKsQGqSgemjmANAF7Q11SLTNA7L7LqbjFWvVD\":\"X-avax1e3eqqmvh9uu564xtqgva87m3k63alawqpugqce\"}"

*/

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

      const filename = `${__dirname.toString()}/../../.wallets/${
        flags.name
      }.json`
      const referece = flags.referece
      const txHex = flags.txHex

      // Get the wallet with updated UTXO data.
      const txInfo = await this.offerAccept(filename, txHex, referece)
      this.log(`\nOffer made: ${JSON.stringify(txInfo, null, 2)}`)
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

      // Sign Alice's input.
      const keyChain = walletData.tokens.xchain.keyChain()
      keyChain.importKey(walletData.walletInfo.privateKey)

      const signed = this.walletUtil.partialySignTx(
        walletData,
        partialTx,
        keyChain,
        addrReferences,
        credentials
      )

      // Check that the transaction is fully-signed.
      const newCredentials = signed.getCredentials()
      const hasAllSignatures = newCredentials.every((cred) =>
        Boolean(cred.sigArray.length)
      )

      if (!hasAllSignatures) {
        throw new Error('The transaction is not fully signed')
      }

      // Broadcast the transaction.
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
      throw new Error(
        'You must specify the utxos address reference with the -r flag'
      )
    }

    referece = JSON.parse(referece)

    return true
  }
}

OfferAccept.description = `
This command is the third of three commands to interact with the DEX.
This command is used by Alice to accept Bob's counter-offer. It checks
the partially signed transaction for correctness, then signs Alice's input,
and broadcasts the finalized transaction.
`

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
