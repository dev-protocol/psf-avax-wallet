/*
  Unit tests for the wallet-create command.
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')

const WalletCreate = require('../../../src/commands/wallet-create')

const filename = `${__dirname.toString()}/../../../.wallets/test123.json`

describe('wallet-create', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new WalletCreate()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#createWallet()', () => {
    it('should exit with error status if called without a filename.', async () => {
      try {
        await uut.createWallet(undefined, undefined)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(
          err.message,
          'filename required.',
          'Should throw expected error.'
        )
      }
    })

    it('Should exit with error status if called with a filename that already exists.', async () => {
      try {
        // Force the error for testing purposes.
        sandbox.stub(uut.walletUtil, 'walletExists').returns(true)

        await uut.createWallet(filename, 'testnet')

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(
          err.message,
          'filename already exist',
          'Should throw expected error.'
        )
      }
    })

    it('should create a mainnet wallet file with the given name', async () => {
      sandbox.stub(uut.walletUtil, 'saveWallet').returns(true)

      const walletData = await uut.createWallet(filename)

      assert.property(walletData, 'type')
      assert.property(walletData, 'mnemonic')
      assert.property(walletData, 'address')
      assert.property(walletData, 'privateKey')
      assert.property(walletData, 'publicKey')
      assert.property(walletData, 'avax')
      assert.property(walletData, 'description')
    })

    it('should create a testnet wallet file with the given name', async () => {
      sandbox.stub(uut.walletUtil, 'saveWallet').returns(true)

      const walletData = await uut.createWallet(filename, 'testnet', true)

      assert.property(walletData, 'type')
      assert.property(walletData, 'mnemonic')
      assert.property(walletData, 'address')
      assert.property(walletData, 'privateKey')
      assert.property(walletData, 'publicKey')
      assert.property(walletData, 'avax')
      assert.property(walletData, 'description')
      assert.equal(walletData.address.substring(0, 6), 'X-fuji')
    })
  })

  describe('#validateFlags()', () => {
    it('validateFlags() should return true if name is supplied.', () => {
      assert.equal(uut.validateFlags({ name: 'test' }), true, 'return true')
    })

    it('validateFlags() should return true if testnet is supplied.', () => {
      assert.equal(uut.validateFlags({ name: 'testnet', testnet: true }), true, 'return true')
    })

    it('validateFlags() should throw error if name is not supplied.', () => {
      try {
        uut.validateFlags({})
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a wallet with the -n flag',
          'Expected error message.'
        )
      }
    })
  })

  describe('#run()', () => {
    it('should run the run() function', async () => {
      sandbox.stub(uut.walletUtil, 'saveWallet').returns(true)

      const flags = { name: 'test123' }
      // Mock methods that will be tested elsewhere.
      sandbox.stub(uut, 'parse').returns({ flags: flags })

      const walletData = await uut.run()

      assert.property(walletData, 'type')
      assert.property(walletData, 'mnemonic')
      assert.property(walletData, 'address')
      assert.property(walletData, 'privateKey')
      assert.property(walletData, 'publicKey')
      assert.property(walletData, 'avax')
      assert.property(walletData, 'description')
    })

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

    it('should add a description when provided', async () => {
      sandbox.stub(uut.walletUtil, 'saveWallet').returns(true)

      const flags = {
        name: 'test123',
        description: 'test'
      }
      // Mock methods that will be tested elsewhere.
      sandbox.stub(uut, 'parse').returns({ flags: flags })

      const walletData = await uut.run()

      assert.property(walletData, 'type')
      assert.property(walletData, 'mnemonic')
      assert.property(walletData, 'address')
      assert.property(walletData, 'privateKey')
      assert.property(walletData, 'publicKey')
      assert.property(walletData, 'avax')
      assert.property(walletData, 'description')
      assert.equal(walletData.description, 'test')
    })
  })
})
