import { test, expect } from 'bun:test';
import { parseGravity, focalCrop } from '../src/gravity.js';
import { parseOptions } from '../src/options.js';

test('parseGravity: keywords, sides and coordinates', () => {
  expect(parseGravity('auto')).toBe('auto');
  expect(parseGravity('face')).toBe('face');
  expect(parseGravity('left')).toEqual({ x: 0, y: 0.5 });
  expect(parseGravity('bottom')).toEqual({ x: 0.5, y: 1 });
  expect(parseGravity('0x1')).toEqual({ x: 0, y: 1 }); // left + bottom (Cloudflare doc)
  expect(parseGravity('0.5x0.33')).toEqual({ x: 0.5, y: 0.33 });
  expect(parseGravity('2x-1')).toBeUndefined(); // not a valid pair
  expect(parseGravity('nonsense')).toBeUndefined();
  expect(parseGravity('constructor')).toBeUndefined();
});

test('g is an alias of gravity', () => {
  expect(parseOptions('w=300,h=300,fit=cover,g=left').options.gravity).toEqual({ x: 0, y: 0.5 });
  expect(parseOptions('gravity=nope').options.gravity).toBeUndefined();
});

test('focalCrop: focus is respected and clamped to the edges', () => {
  const base = { srcW: 1600, srcH: 1000, width: 400, height: 400, enlarge: true };
  // scaled to 640x400, box 400x400
  expect(focalCrop({ ...base, focus: { x: 0.5, y: 0.5 } }).extract).toEqual({ left: 120, top: 0, width: 400, height: 400 });
  expect(focalCrop({ ...base, focus: { x: 0, y: 0.5 } }).extract.left).toBe(0);
  expect(focalCrop({ ...base, focus: { x: 1, y: 0.5 } }).extract.left).toBe(240);
  expect(focalCrop({ ...base, focus: { x: 0.9, y: 0.5 } }).extract.left).toBe(240); // clamped
});

test('focalCrop: fit=crop never enlarges', () => {
  const r = focalCrop({ srcW: 300, srcH: 200, width: 400, height: 400, focus: { x: 0.5, y: 0.5 }, enlarge: false });
  expect(r.resize).toEqual({ width: 300, height: 200 });
  expect(r.extract).toEqual({ left: 0, top: 0, width: 300, height: 200 });
});
