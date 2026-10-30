import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnimatedTimer } from '../components/AnimatedTimer';

describe('flip clock timer', () => {
  it('renders three clock cards and flips only the changed unit', async () => {
    const { rerender } = render(<AnimatedTimer elapsedMs={0} animation="flipclock" />);

    expect(document.querySelectorAll('.flip-unit')).toHaveLength(3);
    expect(document.querySelectorAll('.flip-label')).toHaveLength(3);
    expect(document.querySelector('[data-unit="second"] .flip-half.is-bottom:not(.flip-new-bottom) span')?.textContent).toBe('00');

    rerender(<AnimatedTimer elapsedMs={1000} animation="flipclock" />);

    await waitFor(() => {
      expect(document.querySelectorAll('.flip-unit.is-flipping')).toHaveLength(1);
      expect(document.querySelector('.flip-old-top')).not.toBeNull();
      expect(document.querySelector('.flip-new-bottom')).not.toBeNull();
      expect(document.querySelector('.flip-old-bottom')).toBeNull();
      expect(document.querySelector('[data-unit="second"] .flip-half.is-bottom:not(.flip-new-bottom) span')?.textContent).toBe('00');
    });

    await waitFor(() => {
      expect(document.querySelectorAll('.flip-unit.is-flipping')).toHaveLength(0);
      expect(document.querySelector('[data-unit="second"] .flip-half.is-bottom:not(.flip-new-bottom) span')?.textContent).toBe('01');
    }, { timeout: 1200 });
  });
});
