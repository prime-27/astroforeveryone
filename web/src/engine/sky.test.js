// Run: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { HYDERABAD, moonPath, phaseName, skyReport } from './sky.js'

test('phase names', () => {
  assert.equal(phaseName(0), 'New Moon')
  assert.equal(phaseName(90), 'First Quarter')
  assert.equal(phaseName(180), 'Full Moon')
  assert.equal(phaseName(270), 'Last Quarter')
  assert.equal(phaseName(359), 'New Moon')
})

test('moon path lights the correct side', () => {
  assert.match(moonPath(45, 10), /0 0 1 0,10 A[\d.]+,10 0 0 0 0,-10/) // waxing crescent: right limb, terminator bulges right
  assert.match(moonPath(135, 10), /0 0 1 0,10 A[\d.]+,10 0 0 1 0,-10/) // waxing gibbous: terminator bulges left
  assert.match(moonPath(315, 10), /0 0 0 0,10 A[\d.]+,10 0 0 1 0,-10/) // waning crescent: left limb
})

test('known date: 2025-09-07 total lunar eclipse seen from Hyderabad', () => {
  const r = skyReport(HYDERABAD, new Date('2025-09-01T12:00:00Z'))
  assert.equal(r.lunar.kind, 'total')
  assert.equal(r.lunar.date.toISOString().slice(0, 10), '2025-09-07')
  assert.ok(r.sunset < r.sunrise)
  assert.equal(r.planets.length, 5)
})
