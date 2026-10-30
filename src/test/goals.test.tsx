import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { db } from '../db';

describe('goal flow', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    localStorage.clear();
  });

  afterEach(async () => {
    await db.delete();
  });

  it('adds, completes, edits and deletes a manually entered goal', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole('button', { name: /开始专注/ });
    await user.click(screen.getByRole('button', { name: '目标' }));
    expect(await screen.findByText('还没有设置目标')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '添加目标' }));
    let dialog = await screen.findByRole('dialog', { name: '写下你的目标' });
    await user.type(within(dialog).getByLabelText('目标内容'), '雅思 7.0');
    await user.click(within(dialog).getByRole('button', { name: '添加目标' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText('雅思 7.0')).toBeInTheDocument();
    expect(await db.goals.count()).toBe(1);

    await user.click(screen.getByRole('button', { name: '标记为已完成' }));
    await waitFor(async () => expect((await db.goals.toArray())[0].completed).toBe(true));
    expect(await screen.findByRole('button', { name: '标记为未完成' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '编辑目标' }));
    dialog = await screen.findByRole('dialog', { name: '编辑目标' });
    const textarea = within(dialog).getByLabelText('目标内容');
    await user.clear(textarea);
    await user.type(textarea, '雅思 7.5');
    await user.click(within(dialog).getByRole('button', { name: '保存修改' }));
    expect(await screen.findByText('雅思 7.5')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '删除目标' }));
    const confirm = await screen.findByRole('dialog', { name: '删除这个目标？' });
    await user.click(within(confirm).getByRole('button', { name: '删除目标' }));

    await waitFor(async () => expect(await db.goals.count()).toBe(0));
    expect(await screen.findByText('还没有设置目标')).toBeInTheDocument();
  });
});
