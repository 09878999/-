// @vitest-environment node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function readPublic(filename) {
  return readFileSync(resolve(process.cwd(), 'public', filename));
}

function pngSize(filename) {
  const data = readPublic(filename);
  expect(data.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
  };
}

describe('app icon assets', () => {
  it('uses the selected scheme 3 image directly as the source icon', () => {
    expect(pngSize('app-icon.png')).toEqual({ width: 265, height: 265 });
    expect(createHash('sha256').update(readPublic('app-icon.png')).digest('hex')).toBe(
      'eda4664a9fb676445ffcb3dc0191f90590ed1ff456d217f5d4b4a76375e7e3b6',
    );
  });

  it('provides correctly sized app, iPad and browser icons', () => {
    expect(pngSize('icon-192.png')).toEqual({ width: 192, height: 192 });
    expect(pngSize('icon-512.png')).toEqual({ width: 512, height: 512 });
    expect(pngSize('apple-touch-icon.png')).toEqual({ width: 180, height: 180 });
    expect(pngSize('favicon.png')).toEqual({ width: 64, height: 64 });
  });
});
