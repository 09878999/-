import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { db } from '../db';
import { TIMER_ANIMATION_STORAGE_KEY } from '../lib/preferences';

describe('focus display experience', () => {
  const requestFullscreen = vi.fn();

  beforeEach(async () => {
    requestFullscreen.mockReset();
    requestFullscreen.mockResolvedValue(undefined);
    Object.defineProperty(document.documentElement, 'requestFullscreen', { configurable: true, value: requestFullscreen });
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: null });
    await db.delete();
    await db.open();
    localStorage.clear();
  });

  afterEach(async () => {
    Reflect.deleteProperty(document.documentElement, 'requestFullscreen');
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: null });
    await db.delete();
  });

  it('offers the reference-style flip clock as a selectable display', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole('button', { name: /开始专注/ });
    await user.click(screen.getByRole('button', { name: '设置' }));
    await user.click(await screen.findByRole('radio', { name: /翻页钟/ }));
    await user.click(screen.getByRole('button', { name: '关闭' }));
    await user.click(screen.getByRole('button', { name: /开始专注/ }));
    expect(requestFullscreen).toHaveBeenCalledOnce();

    const immersive = await screen.findByTestId('immersive-focus');
    expect(within(immersive).getByRole('timer', { name: /已专注/ })).toHaveAttribute('data-animation', 'flipclock');
    expect(within(immersive).getAllByRole('timer')).toHaveLength(1);
  });
  it('starts with only the timer visible and reveals controls on tap', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole('button', { name: /开始专注/ });
    await user.click(screen.getByRole('button', { name: '设置' }));
    await user.click(await screen.findByRole('radio', { name: /滑入/ }));

    expect(localStorage.getItem(TIMER_ANIMATION_STORAGE_KEY)).toBe('sweep');
    await user.click(screen.getByRole('button', { name: '关闭' }));
    await user.click(screen.getByRole('button', { name: /开始专注/ }));
    expect(requestFullscreen).toHaveBeenCalledOnce();

    const immersive = await screen.findByTestId('immersive-focus');
    expect(within(immersive).getByLabelText(/已专注/)).toHaveAttribute('data-animation', 'sweep');
    expect(within(immersive).queryByRole('button', { name: '暂停' })).not.toBeInTheDocument();

    await user.click(within(immersive).getByRole('button', { name: '显示全屏控制' }));
    expect(within(immersive).getByText('正在专注')).toBeInTheDocument();
    await user.click(within(immersive).getByRole('button', { name: '暂停' }));
    expect(within(immersive).getByRole('button', { name: '继续' })).toBeInTheDocument();
    await user.click(within(immersive).getByRole('button', { name: '退出全屏，继续计时' }));
    expect(screen.queryByTestId('immersive-focus')).not.toBeInTheDocument();
  });
});
