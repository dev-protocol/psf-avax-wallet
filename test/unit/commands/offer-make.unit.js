/*
  Unit tests for the offer-make command.
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const fs = require('fs').promises

const OfferMake = require('../../../src/commands/offer-make')
const AvaxWallet = require('minimal-avax-wallet')
const { OfferMakeWallet } = require('../../mocks/avax-offer-mock')
const WalletCreate = require('../../../src/commands/wallet-create')
const walletCreate = new WalletCreate()

const filename = `${__dirname.toString()}/../../../.wallets/test123.json`

describe('offer-make', () => {
  let uut
  let sandbox

  before(async () => {
    await walletCreate.createWallet(filename)
  })
  beforeEach(async () => {
    sandbox = sinon.createSandbox()
    uut = new OfferMake()
  })

  afterEach(() => {
    sandbox.restore()
  })
  after(async () => {
    await fs.rm(filename)
  })

  describe('#offerMake()', () => {
    it('should exit with error status if the wallet doesnt hold the asset', async () => {
      try {
        const mockWallet = new AvaxWallet(undefined, { noUpdate: true })
        await mockWallet.walletInfoPromise

        const assetID = '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5'

        sandbox
          .stub(uut.walletBalances, 'getBalances')
          .resolves(mockWallet)

        await uut.offerMake(filename, assetID, 1, 0.02)
        assert.fail('Unexpected result')
      } catch (err) {
        console.log(err)
        assert.include(
          err.message,
          'Insufficient funds.',
          'Expected error message'
        )
      }
    })

    it('should exit with error status if the wallet doesnt have enough assets to send', async () => {
      try {
        const mockWallet = new AvaxWallet(undefined, { noUpdate: true })
        await mockWallet.walletInfoPromise

        const assetID = '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5'

        mockWallet.walletInfo = OfferMakeWallet.walletInfo
        mockWallet.utxos.utxoStore = OfferMakeWallet.utxos
        mockWallet.utxos.assets = OfferMakeWallet.assets

        sandbox
          .stub(uut.walletBalances, 'getBalances')
          .resolves(mockWallet)

        await uut.offerMake(filename, assetID, 1.1, 0.02)
        assert.fail('Unexpected result')
      } catch (err) {
        console.log(err)
        assert.include(
          err.message,
          'Not enough asset',
          'Expected error message'
        )
      }
    })

    it('should return the transaction hex and the address reference object', async () => {
      try {
        const mockWallet = new AvaxWallet(undefined, { noUpdate: true })
        await mockWallet.walletInfoPromise

        const assetID = '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5'

        mockWallet.walletInfo = OfferMakeWallet.walletInfo
        mockWallet.utxos.utxoStore = OfferMakeWallet.utxos
        mockWallet.utxos.assets = OfferMakeWallet.assets

        sandbox
          .stub(uut.walletBalances, 'getBalances')
          .resolves(mockWallet)

        const res = await uut.offerMake(filename, assetID, 1, 0.02)

        assert.hasAllKeys(res, ['txHex', 'addrReferences'])
        const references = JSON.parse(res.addrReferences)
        const [address] = Object.values(references)
        assert.equal(address, mockWallet.walletInfo.address)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })
  })

  describe('#validateFlags()', () => {
    it('validateFlags() should return true.', () => {
      const flags = {
        name: 'test123',
        amount: '1',
        avax: '0.02',
        assetID: '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5'
      }
      assert.equal(uut.validateFlags(flags), true, 'return true')
    })
    it('validateFlags() should throw error if name is not supplied.', () => {
      try {
        const flags = {}
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a wallet with the -n flag.',
          'Expected error message.'
        )
      }
    })
    it('validateFlags() should throw error if amount is not supplied.', () => {
      try {
        const flags = {
          name: 'test123'
        }
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify the asset quantity with the -q flag',
          'Expected error message.'
        )
      }
    })
    it('validateFlags() should throw error if the avax amount is not supplied.', () => {
      try {
        const flags = {
          name: 'test123',
          amount: 1
        }
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify an avax quantity with the -a flag',
          'Expected error message.'
        )
      }
    })
    it('validateFlags() should throw error if the assetID is not supplied', () => {
      try {
        const flags = {
          name: 'test123',
          amount: '1',
          avax: '0.02'
        }
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'ou must specifiy the assetID ID with the -t flag',
          'Expected error message.'
        )
      }
    })
  })

  describe('#run()', () => {
    it('should return 0 and display error.message on empty flags', async () => {
      sandbox.stub(uut, 'parse').returns({ flags: {} })

      const result = await uut.run()

      assert.equal(result, 0)
    })

    it('should handle an error without a message', async () => {
      sandbox.stub(uut, 'parse').throws({})

      const result = await uut.run()

      assert.equal(result, 0)
    })

    it('should return 0, if the offerMake method fails', async () => {
      const flags = {
        name: 'test123',
        amount: '1',
        avax: '0.02',
        assetID: '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5'
      }

      // Mock methods that will be tested else where.
      sandbox
        .stub(uut.walletBalances, 'getBalances')
        .rejects(new Error('Something went terribly wrong'))
      sandbox.stub(uut, 'parse').returns({ flags: flags })

      const result = await uut.run()

      assert.equal(result, 0)
    })

    it('should run the run() function', async () => {
      const mockWallet = new AvaxWallet(undefined, { noUpdate: true })
      await mockWallet.walletInfoPromise

      mockWallet.walletInfo = OfferMakeWallet.walletInfo
      mockWallet.utxos.utxoStore = OfferMakeWallet.utxos
      mockWallet.utxos.assets = OfferMakeWallet.assets

      const flags = {
        name: 'test123',
        amount: '0.8',
        avax: '0.02',
        assetID: '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5'
      }

      // Mock methods that will be tested else where.
      sandbox
        .stub(uut.walletBalances, 'getBalances')
        .resolves(mockWallet)
      sandbox.stub(uut, 'parse').returns({ flags: flags })

      const result = await uut.run()

      assert.isTrue(result)
    })
  })
})
