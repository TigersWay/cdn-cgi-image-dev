import { test, expect } from 'bun:test';
import { parseOptions, pickFormat } from '../src/options.js';

test('parses width, quality and format', () => {
  const { options, ignored } = parseOptions('width=640,quality=70,format=avif');
  expect(options).toEqual({ width: 640, quality: 70, format: 'avif' });
  expect(ignored).toEqual([]);
});

test('accepts short forms', () => {
  expect(parseOptions('w=640,h=480,q=70,f=webp').options).toEqual({ width: 640, height: 480, quality: 70, format: 'webp' });
});

test('clamps dimensions to maxDimension', () => {
  const { options } = parseOptions('width=100000', { maxDimension: 2000 });
  expect(options.width).toBe(2000);
});

test('dpr multiplies the requested width', () => {
  expect(parseOptions('width=300,dpr=2').options.width).toBe(600);
});

test('reports unsupported options', () => {
  expect(parseOptions('width=300,blur=5').ignored).toEqual(['blur']);
});

test('format=auto negotiates through Accept', () => {
  expect(pickFormat('auto', 'image/avif,image/webp,*/*')).toBe('avif');
  expect(pickFormat('auto', 'image/webp,*/*')).toBe('webp');
  expect(pickFormat('auto', '*/*')).toBe(null);
  expect(pickFormat('png', 'image/avif')).toBe('png');
});
