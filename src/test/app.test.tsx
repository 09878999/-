import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { db } from '../db';

describe('app flow', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    localStorage.clear();
  });

  afterEach(async () => {
    await db.delete();
  });

  it('adds a manual study record and shows it in records', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole('button', { name: /开始专注/ })).toBeInTheDocument();
    expect(document.querySelector('.brand img.brand-mark')).toHaveAttribute('src', './app-icon.png');
    await user.click(screen.getByRole('button', { name: '记录' }));
    await user.click(await screen.findByRole('button', { name: /补记一笔/ }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: '编程' }));
    const durationInput = screen.getByLabelText('学习时长');
    await user.clear(durationInput);
    await user.type(durationInput, '45');
    await user.click(screen.getByRole('button', { name: '添加记录' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText('编程')).toBeInTheDocument();
    expect(await screen.findAllByText('45 分钟')).not.toHaveLength(0);
    expect(await db.sessions.count()).toBe(1);
  });
});
