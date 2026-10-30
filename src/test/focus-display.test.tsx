import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { db } from '../db';
import { TIMER_ANIMATION_STORAGE_KEY } from '../lib/preferences';

describe('focus display experience', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    localStorage.clear();
  });

  afterEach(async () => {
    await db.delete();
  });

  it('starts in immersive mode and uses the selected digit animation', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole('button', { name: /开始专注/ });
    await user.click(screen.getByRole('button', { name: '设置' }));
    await user.click(await screen.findByRole('radio', { name: /翻页/ }));

    expect(localStorage.getItem(TIMER_ANIMATION_STORAGE_KEY)).toBe('flip');
    await user.click(screen.getByRole('button', { name: '关闭' }));
    await user.click(screen.getByRole('button', { name: /开始专注/ }));

    const immersive = await screen.findByTestId('immersive-focus');
    expect(within(immersive).getByLabelText(/已专注/)).toHaveAttribute('data-animation', 'flip');
    expect(within(immersive).getByText('正在专注')).toBeInTheDocument();

    await user.click(within(immersive).getByRole('button', { name: '暂停' }));
    expect(within(immersive).getByRole('button', { name: '继续' })).toBeInTheDocument();
    await user.click(within(immersive).getByRole('button', { name: '退出全屏，继续计时' }));
    expect(screen.queryByTestId('immersive-focus')).not.toBeInTheDocument();
  });
});
