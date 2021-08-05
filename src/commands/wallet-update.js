/*
  Update the wallet balance, including BCH and tokens.
*/

'use strict'

// Public NPM libraries
const fs = require('fs')
const BCHJS = require('@psf/bch-js')

// Local libraries
const WalletUtil = require('../lib/wallet-util')
const WalletService = require('../lib/adapters/wallet-service')
const collect = require('collect.js')

const {Command, flags} = require('@oclif/command')

const SATS_PER_BCH = 100000000

class WalletUpdate extends Command {
  constructor(argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.bchjs = new BCHJS()
    this.fs = fs
    this.walletUtil = new WalletUtil()
    this.walletService = new WalletService()
    this.collect = collect
  }

  async run() {
    try {
      const {flags} = this.parse(WalletUpdate)

      // Validate input flags
      this.validateFlags(flags)

      const filename = `${__dirname.toString()}/../../.wallets/${
        flags.name
      }.json`

      return this.updateWallet(filename)
    } catch (err) {
      if (err.message) console.log(err.message)
      else console.log('Error in wallet-update.js/run(): ', err)

      return 0
    }
  }

  // Update the balances in the wallet.
  async updateWallet(filename) {
    try {
      // Load the wallet file.
      const walletData = require(filename)
      // console.log('walletData: ', walletData)

      // Query data on each address that has been generated by the wallet.
      const addressData = await this.getAllAddressData(walletData)
      // console.log(`addressData: ${JSON.stringify(addressData, null, 2)}`)

      // Collect macro balance for the wallet.
      walletData.balanceSats = this.getWalletBalance(addressData)
      walletData.balance = this.bchjs.Util.floor8(
        walletData.balanceSats / SATS_PER_BCH,
      )

      // Collect macro token information for the wallet.
      walletData.tokens = this.getTokenBalances(addressData)
      // console.log(`walletData: ${JSON.stringify(walletData, null, 2)}`)

      // Display wallet data.
      this.displayWalletData(walletData)

      // Save the wallet data to an external .json file.
      await this.walletUtil.saveWallet(filename, walletData)

      return true
    } catch (err) {
      console.error('Error in updateWallet(): ', err)
    }
  }

  // This function controls the display of the wallet data.
  displayWalletData(walletData) {
    try {
      console.log(`\n\nBCH Balance: ${walletData.balance} BCH\n`)

      console.log('Ticker - Qty - Token ID')
      for (let i = 0; i < walletData.tokens.length; i++) {
        const thisToken = walletData.tokens[i]
        console.log(
          `${thisToken.ticker} - ${thisToken.qty} - ${thisToken.tokenId}`,
        )
      }
      console.log(' ')
    } catch (err) {
      console.error('Error in displayWalletData()')
      throw err
    }
  }

  // Add up the token balances.
  // At the moment, minting batons, NFTs, and group tokens are not suported.
  getTokenBalances(addressData) {
    try {
      const tokens = []
      const tokenIds = []

      // Summarized token data into an array of token UTXOs.
      for (let i = 0; i < addressData.length; i++) {
        const thisAddr = addressData[i]

        if (thisAddr.utxos) {
          const slpTokens = thisAddr.utxos.slpUtxos.type1.tokens

          for (let j = 0; j < slpTokens.length; j++) {
            const thisToken = {
              ticker: slpTokens[j].tokenTicker,
              tokenId: slpTokens[j].tokenId,
              qty: parseFloat(slpTokens[j].tokenQty),
            }

            tokens.push(thisToken)

            tokenIds.push(slpTokens[j].tokenId)
          }
        }
      }

      // Create a unique collection of tokenIds
      const collection = collect(tokenIds)
      let unique = collection.unique()
      unique = unique.toArray()

      // Add up any duplicate entries.
      // The finalTokenData array contains unique objects, one for each token,
      // with a total quantity of tokens for the entire wallet.
      const finalTokenData = []
      for (let i = 0; i < unique.length; i++) {
        const thisTokenId = unique[i]

        const thisTokenData = {
          tokenId: thisTokenId,
          qty: 0,
        }

        // Add up the UTXO quantities for the current token ID.
        for (let j = 0; j < tokens.length; j++) {
          const thisToken = tokens[j]

          if (thisTokenId === thisToken.tokenId) {
            thisTokenData.ticker = thisToken.ticker
            thisTokenData.qty += thisToken.qty
          }
        }

        finalTokenData.push(thisTokenData)
      }

      return finalTokenData
    } catch (err) {
      console.error('Error in getTokenBalances()')
      throw err
    }
  }

  // Add up all the balances in all the addresses, to get a total BCH balance
  // for the wallet.
  getWalletBalance(addressData) {
    try {
      let balance = 0

      for (let i = 0; i < addressData.length; i++) {
        balance += addressData[i].balance.total
      }

      return balance
    } catch (err) {
      console.error('Error in getWalletBalance()')
      throw err
    }
  }

  // Retrieves data for every address generated by the wallet.
  // Returns an array of address data for every address generated by the wallet.
  async getAllAddressData(walletData) {
    try {
      let addressData = [] // Accumulates address data.
      // let slpUtxoData = [] // Accumulates SLP token UTXOs.
      // let bchUtxoData = [] // Accumulates BCH (non-SLP) UTXOs.
      let currentIndex = 0 // tracks the current HD index.
      let batchHasBalance = true // Flag to signal when last address found.

      // const thisDataBatch = await this.getAddressData(
      //   walletData,
      //   currentIndex,
      //   20,
      // )
      // console.log(`thisDataBatch: ${JSON.stringify(thisDataBatch, null, 2)}`)

      // Scan the derivation path of addresses until a block of 20 is found that
      // contains no balance. This follows the standard BIP45 specification.
      while (batchHasBalance || currentIndex < walletData.nextAddress) {
        // while (batchHasBalance || currentIndex < 60) {
        // Get a 20-address batch of data.
        const thisDataBatch = await this.getAddressData(
          walletData,
          currentIndex,
          20,
        )
        // console.log(`thisDataBatch: ${util.inspect(thisDataBatch)}`)
        // console.log(`thisDataBatch: ${JSON.stringify(thisDataBatch, null, 2)}`)

        // Increment the index by 20 (addresses).
        currentIndex += 20

        // console.log(
        //   `thisDataBatch.balances: ${JSON.stringify(
        //     thisDataBatch.balances,
        //     null,
        //     2
        //   )}`
        // )

        // Check if data has no balance. no balance == last address.
        batchHasBalance = this.detectBalance(thisDataBatch)
        // console.log(`batchHasBalance: ${batchHasBalance}`)

        // Add data to the array, unless this last batch has no balances.
        if (batchHasBalance) {
          addressData = addressData.concat(thisDataBatch)
          // slpUtxoData = slpUtxoData.concat(thisDataBatch.slpUtxos)
          // bchUtxoData = bchUtxoData.concat(thisDataBatch.bchUtxos)
        }
        // console.log(`addressData: ${util.inspect(addressData)}`)
        // console.log(`slpUtxoData: ${JSON.stringify(slpUtxoData, null, 2)}`)

        // Protect against run-away while loop.
        if (currentIndex > 1000) break
      }

      // Add the HD index to the SLP UTXO data, so the wallet knows which HD
      // address the SLP UTXO belongs to.
      // slpUtxoData = this.addSLPIndex(addressData, slpUtxoData)

      return addressData
    } catch (err) {
      console.log('Error in update-balances.js/getAllAddressData()')
      throw err
    }
  }

  // Returns true if any of the address data has a balance.
  // dataBatch is expected to be an array of address data.
  detectBalance(dataBatch) {
    try {
      // Loop through the address data in the dataBatch array.
      for (let i = 0; i < dataBatch.length; i++) {
        const thisAddr = dataBatch[i]

        if (thisAddr.balance.total > 0) return true
      }

      // If the loop completes without finding a balance, return false.
      return false
    } catch (err) {
      console.log('Error in wallet-update.js/detectBalance()')
      throw err
    }
  }

  // Retrieves data on addresses in an HD wallet.
  // A max of 20 addresses can be retrieved at a time.
  // Addresses start at the 'index' and the number of address data retrieved is
  // set by the 'limit' (up to 20). Data is returned as an object with balance
  // and hydrated utxo data.
  async getAddressData(walletData, index, limit) {
    try {
      // Input validation.
      if (isNaN(index)) throw new Error('index must be supplied as a number.')

      if (!limit || isNaN(limit)) {
        throw new Error('limit must be supplied as a non-zero number.')
      }

      if (limit > 20) throw new Error('limit must be 20 or less.')

      console.log(
        `Getting address data at index ${index} up to index ${index + limit}`,
      )

      // Get the list of addresses.
      const addresses = await this.walletUtil.generateAddress(
        walletData,
        index,
        limit,
      )
      // console.log(`addresses: ${util.inspect(addresses)}`)

      // get BCH balance and details for each address.
      // const balances = await this.bchjs.Electrumx.balance(addresses)
      const balances = await this.walletService.getBalances(addresses)
      // console.log(`balances: ${JSON.stringify(balances, null, 2)}`)

      // Add the HD Index and UTXO data to each address.
      for (let i = 0; i < balances.balances.length; i++) {
        const thisAddr = balances.balances[i]

        // Add the HD index.
        const hdIndex = index + i
        thisAddr.hdIndex = hdIndex

        // Sum the confirmed and unconfirmed balances.
        const total = thisAddr.balance.confirmed + thisAddr.balance.unconfirmed
        thisAddr.balance.total = total

        // If the address has a balance, Add UTXO information.
        // Dev Note: The UTXOs call is a very 'heavy' call that requires a lot
        // of computation and API calls. It's important for performance to avoid
        // making the call if possible. If the address has no BCH balance, then
        // there is no reason to make the UTXO call.
        if (total > 0) {
          const utxos = await this.walletService.getUtxos(thisAddr.address)
          // console.log(`utxos: ${JSON.stringify(utxos, null, 2)}`)

          thisAddr.utxos = utxos[0]
        }
      }
      // console.log(`balances: ${JSON.stringify(balances, null, 2)}`)

      return balances.balances
    } catch (err) {
      // console.log('Error: ', err)
      console.log('Error in wallet-update.js/getAddressData()')
      throw err
    }
  }

  // Validate the proper flags are passed in.
  validateFlags(flags) {
    // Exit if wallet not specified.
    const name = flags.name
    if (!name || name === '') {
      throw new Error('You must specify a wallet with the -n flag.')
    }

    return true
  }
}

WalletUpdate.description = 'Generate a new HD Wallet.'

WalletUpdate.flags = {
  name: flags.string({char: 'n', description: 'Name of wallet'}),
}

module.exports = WalletUpdate
