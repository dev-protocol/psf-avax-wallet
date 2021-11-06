/*
  Unit tests for the wallet-balances command.
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const fs = require('fs').promises

const WalletBalances = require('../../../src/commands/wallet-balances')
const AvalancheWallet = require('../../mocks/avax-mock')
const WalletCreate = require('../../../src/commands/wallet-create')
const walletCreate = new WalletCreate()

const filename = `${__dirname.toString()}/../../../.wallets/test123.json`

describe('wallet-balances', () => {
  let uut
  let sandbox

  before(async () => {
    await walletCreate.createWallet(filename)
  })

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new WalletBalances()
  })

  afterEach(() => {
    sandbox.restore()
  })

  after(async () => {
    await fs.rm(filename)
  })

  describe('#displayBalance', () => {
    it('should display wallet balances', () => {
      const mockWallet = new AvalancheWallet()

      const result = uut.displayBalance(mockWallet)
      assert.equal(result, true)
    })

    it('should display verbose UTXO data when flag is set', () => {
      const mockWallet = new AvalancheWallet()

      const flags = { verbose: true }

      const result = uut.displayBalance(mockWallet, flags)
      assert.equal(result, true)
    })

    it('should catch and throw errors', () => {
      try {
        uut.displayBalance()

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'Cannot read property')
      }
    })
  })

  describe('#getBalances', () => {
    it('should return wallet instance with updated UTXOs and assets', async () => {
      // Mock dependencies
      uut.AvaxWallet = AvalancheWallet
      const result = await uut.getBalances(filename)

      assert.property(result, 'walletInfo')
      assert.property(result, 'utxos')
      assert.property(result.utxos, 'utxoStore')
      assert.property(result.utxos, 'assets')
    })

    // Dev Note: Because this test manipulates environment variables that effect
    // the mock data, this test should come last.
    it('should throw an error on network error', async () => {
      try {
        // Mock dependencies
        uut.AvaxWallet = AvalancheWallet
        process.env.NO_UTXO = true

        await uut.getBalances(filename)

        process.env.NO_UTXO = false

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'UTXOs failed to update. Try again.')
      }
    })
  })

  describe('#validateFlags()', () => {
    it('validateFlags() should return true if name is supplied.', () => {
      assert.equal(uut.validateFlags({ name: 'test' }), true, 'return true')
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

  describe('#run', () => {
    it('should execute the run function', async () => {
      // Mock methods that will be tested elsewhere.
      sandbox.stub(uut, 'getBalances').resolves({})
      sandbox.stub(uut, 'displayBalance').resolves({})

      const flags = {
        name: 'test123'
      }

      sandbox.stub(uut, 'parse').returns({ flags: flags })

      const result = await uut.run()

      assert.equal(result, true)
    })

    it('should handle an error without a message', async () => {
      sandbox.stub(uut, 'parse').throws({})

      const result = await uut.run()

      assert.equal(result, 0)
    })
  })
})
