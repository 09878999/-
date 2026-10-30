import { afterEach, describe, expect, it, vi } from 'vitest';
import { enterSystemFullscreen, exitSystemFullscreen, getFullscreenElement } from '../lib/fullscreen';

describe('system fullscreen helpers', () => {
  afterEach(() => {
    Reflect.deleteProperty(document.documentElement, 'requestFullscreen');
    Reflect.deleteProperty(document.documentElement, 'webkitRequestFullscreen');
    Reflect.deleteProperty(document, 'exitFullscreen');
    Reflect.deleteProperty(document, 'webkitExitFullscreen');
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: null });
    Object.defineProperty(document, 'webkitFullscreenElement', { configurable: true, value: null });
  });

  it('requests fullscreen and returns true when the browser supports it', async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document.documentElement, 'requestFullscreen', { configurable: true, value: request });
    await expect(enterSystemFullscreen()).resolves.toBe(true);
    expect(request).toHaveBeenCalledOnce();
  });

  it('supports the prefixed iPad Safari fullscreen API', async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document.documentElement, 'webkitRequestFullscreen', { configurable: true, value: request });
    await expect(enterSystemFullscreen()).resolves.toBe(true);
    expect(request).toHaveBeenCalledOnce();
  });

  it('returns false when fullscreen is unavailable or rejected', async () => {
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      configurable: true,
      value: vi.fn().mockRejectedValue(new Error('unsupported')),
    });
    await expect(enterSystemFullscreen()).resolves.toBe(false);
  });

  it('exits only when the document is currently fullscreen', async () => {
    const exit = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document, 'exitFullscreen', { configurable: true, value: exit });
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: document.documentElement });
    expect(getFullscreenElement()).toBe(document.documentElement);
    await exitSystemFullscreen();
    expect(exit).toHaveBeenCalledOnce();
  });
});
