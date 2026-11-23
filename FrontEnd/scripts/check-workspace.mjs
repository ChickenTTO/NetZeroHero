import { test } from 'node:test'
import assert from 'node:assert/strict'
import { availability, transitionTrade } from '../src/workspace/transactions.js'
import { DEMO_ACCOUNTS, readStore, writeStore, signIn, signOut, getSession } from '../src/workspace/mockData.js'

function memoryStorage() {
  const entries = new Map()
  return { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) }
}
globalThis.localStorage = memoryStorage()
globalThis.sessionStorage = memoryStorage()
const buyer = DEMO_ACCOUNTS[0], seller = DEMO_ACCOUNTS[1]

test('login validates credentials, restores the role and signs out', () => {
  assert.equal(signIn(buyer.identifier, 'wrong'), null)
  assert.equal(signIn(` ${buyer.identifier} `, buyer.password).role, 'buyer')
  assert.equal(getSession().id, buyer.id)
  signOut()
  assert.equal(getSession(), null)
  assert.equal(signIn(seller.identifier, seller.password).role, 'seller')
  signOut()
})

test('storage persists changes and recovers corrupt data with an independent seed', () => {
  const data = readStore()
  data.listings[0].title = 'Changed'
  assert.equal(writeStore(data), true)
  assert.equal(readStore().listings[0].title, 'Changed')
  localStorage.setItem('gom.workspace.v1', '{broken')
  assert.equal(readStore().listings[0].title, 'Rơm cuộn khô sau thu hoạch')
})

test('seller accepts and hands over; buyer completes without double reserving inventory', () => {
  const original = readStore()
  const listing = original.listings.find(l => l.id === 'VL-2601')
  let data = transitionTrade(original, seller, 'GOM-1028', 'scheduled')
  assert.equal(availability(data, listing), 9)
  data = transitionTrade(data, seller, 'GOM-1028', 'collecting')
  assert.equal(availability(data, listing), 9)
  data = transitionTrade(data, buyer, 'GOM-1028', 'completed')
  assert.equal(data.listings.find(l => l.id === listing.id).quantity, 9)
  assert.equal(availability(data, data.listings.find(l => l.id === listing.id)), 9)
  assert.equal(original.listings.find(l => l.id === listing.id).quantity, 12)
  assert.equal(original.trades.find(t => t.id === 'GOM-1028').status, 'pending')
  assert.throws(() => transitionTrade(data, buyer, 'GOM-1028', 'completed'))
})

test('rejects wrong-role actions, skipping stages and actions on another organization', () => {
  const data = readStore()
  assert.throws(() => transitionTrade(data, buyer, 'GOM-1028', 'scheduled'))
  assert.throws(() => transitionTrade(data, seller, 'GOM-1028', 'completed'))
  assert.throws(() => transitionTrade(data, seller, 'GOM-1026', 'completed'))
  assert.throws(() => transitionTrade(data, buyer, 'missing', 'completed'))
})

test('prevents accepting more inventory than available, or a hidden listing', () => {
  const data = readStore()
  data.listings.find(l => l.id === 'VL-2601').quantity = 2
  assert.throws(() => transitionTrade(data, seller, 'GOM-1028', 'scheduled'), /khối lượng/)
  data.listings.find(l => l.id === 'VL-2601').quantity = 12
  data.listings.find(l => l.id === 'VL-2601').status = 'paused'
  assert.throws(() => transitionTrade(data, seller, 'GOM-1028', 'scheduled'))
})

test('declining an offer leaves inventory available', () => {
  const data = transitionTrade(readStore(), seller, 'GOM-1028', 'declined')
  assert.equal(availability(data, data.listings.find(l => l.id === 'VL-2601')), 12)
  assert.equal(data.trades.find(t => t.id === 'GOM-1028').status, 'declined')
})

test('new demo data uses the requested display name for every party', () => {
  const data = readStore()
  for (const profile of Object.values(data.profiles)) {
    assert.equal(profile.name, 'Nguyễn Thành Đạt')
    assert.equal(profile.shortName, 'Nguyễn Thành Đạt')
    assert.equal(profile.contact, 'Nguyễn Thành Đạt')
  }
  assert.ok(data.listings.every(listing => listing.seller === 'Nguyễn Thành Đạt'))
  assert.ok(data.trades.every(trade => trade.buyerName === 'Nguyễn Thành Đạt' && trade.sellerName === 'Nguyễn Thành Đạt'))
})

test('saved demo names migrate without resetting inventory, trades or later profile edits', () => {
  const data = readStore()
  delete data.nameRevision
  data.profiles.seller.name = 'Hợp tác xã Nông nghiệp An Hòa'
  data.profiles.seller.shortName = 'An Hòa'
  data.profiles.seller.contact = 'Trần Hoài An'
  data.listings[0].quantity = 7.5
  data.listings[0].title = 'Mùn cưa tại kho An Hòa'
  data.listings[0].seller = 'Hợp tác xã Nông nghiệp An Hòa'
  data.trades[0].status = 'completed'
  data.trades[0].buyerName = 'Công ty Tái chế An Phát'
  data.trades[0].sellerName = 'Hợp tác xã Nông nghiệp An Hòa'
  writeStore(data)
  const migrated = readStore()
  assert.equal(migrated.listings[0].quantity, 7.5)
  assert.equal(migrated.listings[0].title, 'Mùn cưa tại kho Nguyễn Thành Đạt')
  assert.equal(migrated.trades[0].status, 'completed')
  assert.equal(migrated.trades[0].buyerName, 'Nguyễn Thành Đạt')
  assert.equal(migrated.profiles.seller.contact, 'Nguyễn Thành Đạt')
  migrated.profiles.seller.shortName = 'Tên chỉnh sửa sau'
  writeStore(migrated)
  assert.equal(readStore().profiles.seller.shortName, 'Tên chỉnh sửa sau')
  localStorage.removeItem('gom.workspace.v1')
})
