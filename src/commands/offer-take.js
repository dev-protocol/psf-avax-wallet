/*
  This command is the second of three commands to interact with the DEX.
  offer-take completes the partial transaction created by offer-make. It
  produces a fully-formed (but partially-signed) transaction. The tx is then
  sent back to the first party, to review and complete the transaction.

  At present, this command is used to help with debugging the avax-dex:
  https://github.com/Permissionless-Software-Foundation/avax-dex

  Example:
  This command takes the output of offer-make as its input.
  Bob accepts Alice's offer:
  ./bin/run offer-take -n test01 -h "00000001ed5f38341e436e5d46e2bb00b45d62ae97d1b050c64bc634ae10626739e35c4b0000000221e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff0000000700000000001e8480000000000000000000000001000000015d72133454d4351d6ba784b22183c947ef153d0dcf56299d91d7a12b83650ed5ffaacaac3d03a0f1ee1aca8193e76423e49265a8000000070000000000000384000000000000000000000001000000015d72133454d4351d6ba784b22183c947ef153d0d000000018f60207cf0073e9cab6fb39a9553585fc923d328e0f67d73d973c4c4731962c200000001cf56299d91d7a12b83650ed5ffaacaac3d03a0f1ee1aca8193e76423e49265a80000000500000000000003e8000000010000000000000022547820637265617465642066726f6d206f66666572206d616b6520636f6d6d616e64" -r "{\"269LQd4Jjdp41j35bavWWGfSud2FuenEDQWP8nwq7LZ69HUy8L\":\"X-avax1t4epxdz56s6366a8sjezrq7fglh320gd2n7wh3\"}"

  This command will add Bob's AVAX UTXO as input to pay Alice and the
  transaction fee. It will also add Bob's address as the output for the tokens.

  This command generates an JSON object that contains two properties:
  - txHex - is the transaction hex of a partially-signed transaction. It
    contains the following:
    - Input 1: Alice's token UTXO being offered for sale (unsigned).
    - Input 2: Bob's AVAX to pay Alice + transaction fee (signed).
    - Output 1: The tokens-for-sale sent to Bob.
    - Output 2: The AVAX sent to the Alice, to pay for the tokens.
    - Output 3: The token-change for the unsold tokens, going back to Alice.
    - Output 4: Bob's AVAX-change.
    - Output (implied): Bob's paying the transactoin fee.
  - addrReferences - Contains additional information about the UTXO for sale
    that gets lost when compiling the partial transaction to hex:
    - key1 - TXID of the token UTXO offered for sale (from Alice)
    - value1 - Alices address.
    - key2 - TXID of Bob's AVAX UTXO paying for the sale.
    - value2 - Bob's address.

  Example output:

  input 0: Skipping, address is not in the keychain, ( 269LQd4Jjdp41j35bavWWGfSud2FuenEDQWP8nwq7LZ69HUy8L )

  input 1: Successfully signed, ( 2PWRtLCU8rVqxLKsQGqSgemjmANAF7Q11SLTNA7L7LqbjFWvVD signed with X-avax1e3eqqmvh9uu564xtqgva87m3k63alawqpugqce )

  Offer made: {
    "txHex": "00000000000000000001ed5f38341e436e5d46e2bb00b45d62ae97d1b050c64bc634ae10626739e35c4b0000000421e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff0000000700000000000f424000000000000000000000000100000001cc72006d972f394d54cb0219d3fb71b6a3dff5c021e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff0000000700000000001e8480000000000000000000000001000000015d72133454d4351d6ba784b22183c947ef153d0dcf56299d91d7a12b83650ed5ffaacaac3d03a0f1ee1aca8193e76423e49265a800000007000000000000006400000000000000000000000100000001cc72006d972f394d54cb0219d3fb71b6a3dff5c0cf56299d91d7a12b83650ed5ffaacaac3d03a0f1ee1aca8193e76423e49265a8000000070000000000000384000000000000000000000001000000015d72133454d4351d6ba784b22183c947ef153d0d000000028f60207cf0073e9cab6fb39a9553585fc923d328e0f67d73d973c4c4731962c200000001cf56299d91d7a12b83650ed5ffaacaac3d03a0f1ee1aca8193e76423e49265a80000000500000000000003e80000000100000000b6cd48f7470cf0b508b70ae8af3bb40ab07c0e2ab30ea5e0b402ca0a97bce2c30000000021e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff0000000500000000003d0900000000010000000000000022547820637265617465642066726f6d206f666665722074616b6520636f6d6d616e640000000200000009000000000000000900000001183d8b71f882e427d3837b4f2f8532cfbf4c6764bb68151b8a3d9c6682ad91f75f8b68ce66e8cd425cdf62b3abbd33da24d1dc060a628be22883c4df5d911f1401",
    "addrReferences": "{\"269LQd4Jjdp41j35bavWWGfSud2FuenEDQWP8nwq7LZ69HUy8L\":\"X-avax1t4epxdz56s6366a8sjezrq7fglh320gd2n7wh3\",\"2PWRtLCU8rVqxLKsQGqSgemjmANAF7Q11SLTNA7L7LqbjFWvVD\":\"X-avax1e3eqqmvh9uu564xtqgva87m3k63alawqpugqce\"}"
  }
*/

'use strict'

// Local libraries
const WalletBalances = require('./wallet-balances')

const { Command, flags } = require('@oclif/command')
const WalletUtil = require('../lib/wallet-util')

class OfferTake extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.walletUtil = new WalletUtil()
    this.walletBalances = new WalletBalances()
    this.avaxID = 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z'
  }

  async run () {
    try {
      const { flags } = this.parse(OfferTake)

      // Validate input flags
      this.validateFlags(flags)

      const filename = `${__dirname.toString()}/../../.wallets/${
        flags.name
      }.json`
      const referece = flags.referece
      const txHex = flags.txHex

      // Get the wallet with updated UTXO data.
      const txInfo = await this.offerTake(filename, txHex, referece)
      this.log(`\nOffer made: ${JSON.stringify(txInfo, null, 2)}`)
      return true
    } catch (err) {
      this.log('Error in run(): ', err)

      return false
    }
  }

  async offerTake (filename, txHex, addrReferences) {
    try {
      const walletData = await this.walletBalances.getBalances(filename)

      const asset = walletData.utxos.assets.find(
        (item) => item.assetID === this.avaxID
      )

      if (!asset) {
        throw new Error(
          "Insufficient funds. You are trying to send AVAX, but the wallet doesn't have any"
        )
      }

      const avaxID = walletData.bintools.cb58Decode(this.avaxID)
      addrReferences = JSON.parse(addrReferences)

      // Parse the old transaction
      const baseTx = new walletData.utxos.avm.BaseTx()
      const txBuffer = Buffer.from(txHex, 'hex')
      baseTx.fromBuffer(txBuffer)

      // Get the AVAX output that Bob needs to pay.
      // handle avax input with optimal avax UTXO
      const outputs = baseTx.getOuts()
      const avaxOut = outputs.find((item) => {
        return item.getAssetID().toString('hex') === avaxID.toString('hex')
      })

      const fee = walletData.tokens.xchain.getTxFee()

      // Get a UTXO from Bob's wallet that is big enough to pay Alice + the
      // transaction fee.
      const avaxRequired = avaxOut.getOutput().getAmount().add(fee)
      const avaxUtxo = this.selectUTXO(
        avaxRequired.toNumber(),
        walletData.utxos.utxoStore
      )

      if (!avaxUtxo.amount) {
        this.log('Could not find a UTXO big enough for this transaction')
        throw new Error('Not enough avax in the selected utxo')
      }

      // Add Bob's UTXO to the address reference object. This is data that gets
      // lost when compiling a partially signed transaction, and must be passed
      // separately.
      const address = walletData.walletInfo.address
      const avaxInput = walletData.utxos.encodeUtxo(avaxUtxo, address)
      const utxoID = avaxInput.getUTXOID()
      addrReferences[utxoID] = address

      // Get the input and token ID for token being offered by Alice.
      // Assumption: first input in the TX always represents a token UTXO for
      // sale. There can be more than one token UTXO, but the first one is a
      // token UTXO.
      const inputs = baseTx.getIns()
      const [tokenInput] = inputs
      const assetID = tokenInput.getAssetID()

      // Get the output for the token remainder/change being sent back to Alice.
      const tokenRemainderOut = outputs.find((item) => {
        return item.getAssetID().toString('hex') !== avaxID.toString('hex')
      })
      let tokenRemainder = new walletData.BN(0)
      let tokenAmount = new walletData.BN(0)
      if (tokenRemainderOut) {
        tokenRemainder = tokenRemainderOut.getOutput().getAmount()
      }

      // Add up all the token inputs
      for (const input of inputs) {
        if (input.getAssetID().toString('hex') !== assetID.toString('hex')) {
          continue
        }

        tokenAmount = tokenAmount.add(input.getInput().getAmount())
      }
      tokenAmount = tokenAmount.sub(tokenRemainder)

      // Send the token to Bob as the first output.
      const tokenOutput = walletData.utxos.formatOutput({
        amount: tokenAmount.toNumber(),
        address,
        assetID: walletData.bintools.cb58Encode(assetID)
      })

      inputs.push(avaxInput)
      outputs.push(tokenOutput)

      // send back the remainding avax if any, to Bob.
      const remainder = new walletData.BN(avaxUtxo.amount).sub(avaxRequired)
      if (remainder.gt(new walletData.BN(0))) {
        const remainderOut = walletData.utxos.formatOutput({
          amount: remainder,
          address,
          assetID: this.avaxID
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
        Buffer.from('Tx created from offer take command')
      )

      // Partially sign the tx
      const keyChain = walletData.tokens.xchain.keyChain()
      keyChain.importKey(walletData.walletInfo.privateKey)

      const unsigned = new walletData.utxos.avm.UnsignedTx(partialTx)

      // Bob signs his input.
      const signed = this.walletUtil.partialySignTx(
        walletData,
        unsigned,
        keyChain,
        addrReferences
      )
      const hexString = signed.toBuffer().toString('hex')

      return {
        txHex: hexString,
        addrReferences: JSON.stringify(addrReferences)
      }
    } catch (err) {
      this.log('Error in offer-make.js/offerTake()', err)
      throw err
    }
  }

  selectUTXO (amount, utxos) {
    let candidateUTXO = {}

    const total = amount
    // if it's a new wallet
    if (!utxos) {
      utxos = []
    }

    // Loop through each utxo.
    for (let i = 0; i < utxos.length; i++) {
      const thisUTXO = utxos[i]

      if (thisUTXO.amount < total) {
        continue
      }
      // Automatically assign if the candidateUTXO is an empty object.
      if (!candidateUTXO.amount) {
        candidateUTXO = thisUTXO
        continue
      }

      // Replace the candidate if the current UTXO is closer to the send amount.
      if (candidateUTXO.amount > thisUTXO.amount) {
        candidateUTXO = thisUTXO
      }
    }

    return candidateUTXO
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

OfferTake.description = "Take an existing offer to 'buy' the token with AVAX"

OfferTake.flags = {
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

module.exports = OfferTake
