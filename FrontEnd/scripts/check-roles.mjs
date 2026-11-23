import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readStore, DEMO_ACCOUNTS, writeStore } from '../src/workspace/mockData.js'
import { transitionTrade, availability } from '../src/workspace/transactions.js'
import { saveDemand, toggleDemand, evaluateSupply, demandProgress, updateReadiness, handOver, recordReceipt, requestExchange, cancelExchange, exchangeBalance, READINESS, settledQuantity, tradeValue } from '../src/workspace/roleActions.js'

const [buyer, seller] = DEMO_ACCOUNTS
const values = { title: 'Kế hoạch sinh khối', material: 'agriculture', quantity: 20, maxPrice: 1200000, maxMoisture: 15, maxImpurity: 4, location: 'Hà Nội', deadline: '2099-12-31' }

test('only the buyer can create, edit or pause a demand, with valid inputs', () => {
  const original = readStore()
  const data = saveDemand(original, buyer, values)
  assert.equal(data.demands.length, original.demands.length + 1)
  assert.equal(data.demands[0].owner, buyer.id)
  assert.throws(() => saveDemand(original, seller, values))
  assert.throws(() => saveDemand(original, buyer, { ...values, title: '  ' }))
  assert.throws(() => saveDemand(original, buyer, { ...values, maxMoisture: 110 }))
  assert.equal(toggleDemand(data, buyer, data.demands[0].id).demands[0].status, 'paused')
  assert.throws(() => toggleDemand(data, seller, data.demands[0].id))
  assert.throws(() => saveDemand(data, buyer, { ...values, quantity: 1 }, 'NC-2602'))
})

test('matching checks declared quality, price, region, date and missing measurements', () => {
  const data = readStore(), listing = data.listings[0]
  assert.equal(evaluateSupply(data, listing, values).matches, true)
  assert.equal(evaluateSupply(data, { ...listing, moisture: 16 }, values).matches, false)
  assert.equal(evaluateSupply(data, { ...listing, moisture: undefined }, values).matches, false)
  assert.equal(evaluateSupply(data, { ...listing, price: 1300000 }, values).matches, false)
  assert.equal(evaluateSupply(data, { ...listing, location: 'Khác khu vực' }, values).matches, false)
  assert.equal(evaluateSupply(data, listing, { ...values, deadline: '2026-11-24' }).matches, false)
  assert.equal(evaluateSupply(data, listing, { ...values, material: 'battery' }).matches, false)
})

test('demand progress excludes pending and declined offers and prevents overbooking', () => {
  const data = readStore(), demand = data.demands.find(item => item.id === 'NC-2601')
  assert.equal(demandProgress(data, demand).confirmed, 13)
  assert.equal(demandProgress(data, demand).received, 8)
  demand.quantity = 14
  assert.throws(() => transitionTrade(data, seller, 'GOM-1028', 'scheduled'), /Nhu cầu/)
  data.demands[0].status = 'active'
  data.demands[0].quantity = demandProgress(data, data.demands[0]).confirmed + 2
  assert.throws(() => transitionTrade(data, seller, 'GOM-1028', 'scheduled'), /Nhu cầu/)
  demand.quantity = 24
  demand.status = 'paused'
// Reject paused demands.
  assert.throws(() => transitionTrade(data, seller, 'GOM-1028', 'scheduled'), /Nhu cầu/)
})

test('seller must complete the pickup checklist; buyer cannot tick it', () => {
  let data = readStore()
  assert.throws(() => handOver(data, seller, 'GOM-1027'), /checklist/)
  assert.throws(() => updateReadiness(data, buyer, 'GOM-1027', 'packed', true))
  for (const [key] of READINESS) data = updateReadiness(data, seller, 'GOM-1027', key, true)
  data = handOver(data, seller, 'GOM-1027')
  assert.equal(data.trades.find(item => item.id === 'GOM-1027').status, 'collecting')
  assert.throws(() => updateReadiness(data, seller, 'GOM-1027', 'packed', false))
})

test('buyer can hold for review, then accept actual weight; discrepancy needs a note', () => {
  const original = readStore()
  assert.throws(() => recordReceipt(original, seller, 'GOM-1026', { quantity: 24, decision: 'accepted' }))
  assert.throws(() => recordReceipt(original, buyer, 'GOM-1026', { quantity: 25, decision: 'accepted' }))
  assert.throws(() => recordReceipt(original, buyer, 'GOM-1026', { quantity: 23, decision: 'accepted' }))
  assert.throws(() => recordReceipt(original, buyer, 'GOM-1026', { quantity: 24, decision: 'hold' }))
  const held = recordReceipt(original, buyer, 'GOM-1026', { quantity: 23.5, decision: 'hold', note: 'Cần kiểm tra tạp chất.' })
  assert.equal(held.trades.find(item => item.id === 'GOM-1026').status, 'collecting')
  const accepted = recordReceipt(held, buyer, 'GOM-1026', { quantity: 23.5, decision: 'accepted', note: 'Ghi nhận thiếu 0,5 tấn để đối soát.' })
  const trade = accepted.trades.find(item => item.id === 'GOM-1026')
  assert.equal(trade.status, 'completed')
  assert.equal(settledQuantity(trade), 23.5)
  assert.equal(tradeValue(trade), 23.5 * trade.price)
  assert.equal(accepted.listings.find(item => item.id === 'VL-2602').quantity, 12)
  assert.equal(availability(accepted, accepted.listings.find(item => item.id === 'VL-2602')), 12)
  assert.equal(demandProgress(accepted, accepted.demands.find(item => item.id === 'NC-2602')).received, 55.5)
})

test('exchange reserves eligible value once and cancellation restores it', () => {
  const original = readStore()
  const start = exchangeBalance(original, seller, 'agriculture').available
  assert.equal(start, 12400000)
  const requested = requestExchange(original, seller, 'compost', 2)
  assert.equal(exchangeBalance(requested, seller, 'agriculture').available, start - 700000)
  assert.throws(() => requestExchange(original, buyer, 'compost', 1))
  assert.throws(() => requestExchange(original, seller, 'compost', 0))
  assert.throws(() => requestExchange(original, seller, 'compost', 1.5))
  assert.throws(() => requestExchange(original, seller, 'compost', 1000))
  assert.throws(() => requestExchange(original, seller, 'brick', 1))
  const cancelled = cancelExchange(requested, seller, requested.exchanges[0].id)
  assert.equal(exchangeBalance(cancelled, seller, 'agriculture').available, start)
  assert.throws(() => cancelExchange(cancelled, seller, requested.exchanges[0].id))
})

test('legacy data gains role features without dropping previous listings or trades', () => {
  const data = readStore()
  delete data.roleFeaturesVersion
  delete data.demands
  delete data.exchanges
  data.listings[0].quantity = 7
  const entries = new Map()
  globalThis.localStorage = { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) }
  writeStore(data)
  const migrated = readStore()
  assert.equal(migrated.listings[0].quantity, 7)
  assert.equal(migrated.trades.length, data.trades.length)
  assert.equal(migrated.demands.length, 2)
  assert.deepEqual(migrated.exchanges, [])
  migrated.demands[0].title = 'Nhu cầu đã chỉnh sửa'
  writeStore(migrated)
  assert.equal(readStore().demands[0].title, 'Nhu cầu đã chỉnh sửa')
})
