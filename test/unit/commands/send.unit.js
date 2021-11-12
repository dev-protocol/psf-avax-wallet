/*
  Unit tests for the send-bch command.
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const fs = require('fs').promises

const SendAsset = require('../../../src/commands/send')
// const sendAssetMock = require('../../mocks/send-bch-mock')
const AvalancheWallet = require('../../mocks/avax-mock')
const WalletCreate = require('../../../src/commands/wallet-create')
const walletCreate = new WalletCreate()

const filename = `${__dirname.toString()}/../../../.wallets/test123.json`

describe('send', () => {
  let uut
  let sandbox

  before(async () => {
    await walletCreate.createWallet(filename)
  })
  beforeEach(async () => {
    sandbox = sinon.createSandbox()
    uut = new SendAsset()
  })

  afterEach(() => {
    sandbox.restore()
  })
  after(async () => {
    await fs.rm(filename)
  })

  describe('#sendAsset()', () => {
    it('should exit with error status if called without a filename.', async () => {
      try {
        await uut.sendAsset(undefined, undefined)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(
          err.message,
          'filename required.',
          'Should throw expected error.'
        )
      }
    })

    it('should exit with error status if the given wallet doesnt exist', async () => {
      try {
        await uut.sendAsset(`${__dirname.toString()}/../../../.wallets/test567.json`)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(
          err.message,
          'Wallet doesnt exists',
          'Should throw expected error.'
        )
      }
    })

    it('should exit with error status if the wallet doesnt hold the asset', async () => {
      try {
        const mockWallet = new AvalancheWallet()

        const flags = {
          name: 'test123',
          amount: 3,
          assetId: '3LxJXtS6FYkSpcRLPu1EeGZDdFBY41J4YxH1Nwohxs2evUo1U',
          sendAddr: mockWallet.walletInfo.address
        }

        // Mock methods that will be tested elsewhere.
        sandbox
          .stub(uut.walletBalances, 'getBalances')
          .resolves(mockWallet)

        await uut.sendAsset(filename, flags)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Insufficient funds',
          'Should throw expected error.'
        )
      }
    })

    it('should send the asset to the given address and return the txid.', async () => {
      const mockWallet = new AvalancheWallet()

      const flags = {
        name: 'test123',
        amount: 3,
        assetId: '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5',
        sendAddr: mockWallet.walletInfo.address
      }

      // Mock methods that will be tested elsewhere.
      sandbox
        .stub(uut.walletBalances, 'getBalances')
        .resolves(mockWallet)

      const result = await uut.sendAsset(filename, flags)

      assert.isString(result)
      assert.equal(result, 'someid')
      assert.property(mockWallet, 'outputs')
      assert.equal(mockWallet.outputs[0].address, mockWallet.walletInfo.address)
      assert.equal(mockWallet.outputs[0].amount, 300)
      assert.equal(mockWallet.outputs[0].assetID, '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5')
    })

    it('should send Avax if the assetId is not especified', async () => {
      const mockWallet = new AvalancheWallet()

      const flags = {
        name: 'test123',
        amount: 0.1,
        sendAddr: mockWallet.walletInfo.address
      }

      // Mock methods that will be tested elsewhere.
      sandbox
        .stub(uut.walletBalances, 'getBalances')
        .resolves(mockWallet)

      const result = await uut.sendAsset(filename, flags)

      assert.isString(result)
      assert.equal(result, 'someid')
      assert.property(mockWallet, 'outputs')
      assert.equal(mockWallet.outputs[0].address, mockWallet.walletInfo.address)
      assert.equal(mockWallet.outputs[0].amount, 100000000)
      assert.equal(mockWallet.outputs[0].assetID, undefined)
    })
  })

  describe('#validateFlags()', () => {
    it('validateFlags() should return true .', () => {
      const flags = {
        name: 'test123',
        amount: 1,
        sendAddr: 'X-avax192g35v4jmnarjzczpdqxzvwlx44cfg4p0yk4qd'
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
    it('validateFlags() should throw error if sendAddr is not supplied.', () => {
      try {
        const flags = {
          name: 'test123',
          amount: 1
        }
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a send-to address with the -a flag.',
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
    it('should return 0 , if the sendAsset fails', async () => {
      const flags = {
        name: 'test123',
        amount: 3,
        assetId: '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5',
        sendAddr: 'X-avax192g35v4jmnarjzczpdqxzvwlx44cfg4p0yk4qd'
      }

      // Mock methods that will be tested elsewhere.
      sandbox
        .stub(uut.walletBalances, 'getBalances')
        .rejects(new Error('Something went terribly wrong'))

      // Mock methods that will be tested elsewhere.
      sandbox.stub(uut, 'parse').returns({ flags: flags })

      const result = await uut.run()

      assert.equal(result, 0)
    })
    it('should run the run() function', async () => {
      const mockWallet = new AvalancheWallet()

      const flags = {
        name: 'test123',
        amount: 3,
        assetId: '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5',
        sendAddr: mockWallet.walletInfo.address
      }

      // Mock methods that will be tested elsewhere.
      sandbox
        .stub(uut.walletBalances, 'getBalances')
        .resolves(mockWallet)

      // Mock methods that will be tested elsewhere.
      sandbox.stub(uut, 'parse').returns({ flags: flags })

      const result = await uut.run()

      assert.isString(result)
    })
  })
})
