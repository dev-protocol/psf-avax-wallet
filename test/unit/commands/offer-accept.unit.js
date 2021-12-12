/*
  Unit tests for the offer-take command.
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const fs = require('fs').promises

const OfferAccept = require('../../../src/commands/offer-accept')
const { AliceWallet, OfferTakeTx } = require('../../mocks/avax-offer-mock')
const WalletCreate = require('../../../src/commands/wallet-create')
const walletCreate = new WalletCreate()

const filename = `${__dirname.toString()}/../../../.wallets/test123.json`

describe('offer-accept', () => {
  let uut
  let sandbox

  before(async () => {
    await walletCreate.createWallet(filename)
  })
  beforeEach(async () => {
    sandbox = sinon.createSandbox()
    uut = new OfferAccept()
    sandbox.stub(uut, 'log').returns(true)
  })
  afterEach(() => {
    sandbox.restore()
  })
  after(async () => {
    await fs.rm(filename)
  })

  describe('#offerAccept()', () => {
    it('should return the transaction if after broadcasting it', async () => {
      try {
        // set up Alice wallet
        const aliceWallet = await AliceWallet()

        sandbox
          .stub(uut.walletBalances, 'getBalances')
          .resolves(aliceWallet)
        sandbox
          .stub(aliceWallet.sendAvax.ar, 'issueTx')
          .resolves('sometxid')

        const res = await uut.offerAccept(filename, OfferTakeTx.txHex, OfferTakeTx.addrReferences)

        assert.hasAllKeys(res, ['txid'])
        assert.isString(res.txid)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })

    it('should throw an error if the tx is not fully signed', async () => {
      try {
        // the reference is missing the first utxo address
        const wrongReference = {}

        const aliceWallet = await AliceWallet()

        sandbox
          .stub(uut.walletBalances, 'getBalances')
          .resolves(aliceWallet)

        await uut.offerAccept(filename, OfferTakeTx.txHex, JSON.stringify(wrongReference))
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'The transaction is not fully signed',
          'Expected error message'
        )
      }
    })
  })

  describe('#validateFlags()', () => {
    it('should return true', () => {
      const flags = {
        name: 'test123',
        txHex: OfferTakeTx.txHex,
        referece: OfferTakeTx.addrReferences
      }
      assert.equal(uut.validateFlags(flags), true, 'return true')
    })
    it('should throw error if name is not supplied', () => {
      try {
        const flags = {}
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a wallet with the -n flag',
          'Expected error message'
        )
      }
    })
    it('should throw error if the txHex is not supplied', () => {
      try {
        const flags = {
          name: 'test123'
        }
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify transaction hex with the -h flag',
          'Expected error message'
        )
      }
    })
    it('should throw error if the address referece is not supplied', () => {
      try {
        const flags = {
          name: 'test123',
          txHex: 'someHEx'
        }
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify the utxos address reference with the -r flag',
          'Expected error message'
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

    it('should return 0, if the offerTake method fails', async () => {
      const flags = {
        name: 'test123',
        txHex: OfferTakeTx.txHex,
        referece: OfferTakeTx.addrReferences
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
      const aliceWallet = await AliceWallet()

      sandbox
        .stub(aliceWallet.sendAvax.ar, 'issueTx')
        .resolves('sometxid')

      const flags = {
        name: 'test123',
        txHex: OfferTakeTx.txHex,
        referece: OfferTakeTx.addrReferences
      }

      // Mock methods that will be tested else where.
      sandbox
        .stub(uut.walletBalances, 'getBalances')
        .resolves(aliceWallet)

      sandbox.stub(uut, 'parse').returns({ flags: flags })

      const result = await uut.run()

      assert.isTrue(result)
    })
  })
})
