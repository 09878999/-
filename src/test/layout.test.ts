import styles from '../styles.css?raw';
import { describe, expect, it } from 'vitest';

describe('focus layout contracts', () => {
  it('sizes the timer from the timer card container instead of the viewport', () => {
    expect(styles).toMatch(/\.timer-card\s*\{[^}]*container-type:\s*inline-size/s);
    expect(styles).toMatch(/\.timer-display\s*\{[^}]*font-size:\s*clamp\(48px,\s*20cqi,\s*136px\)/s);
    expect(styles).not.toContain('.timer-display { font-size: clamp(60px, 15vw, 100px); }');
  });

  it('adds comfortable horizontal space around the colon dots', () => {
    expect(styles).toMatch(/\.timer-glyph\.is-colon\s*\{[^}]*width:\s*0\.46em/s);
  });

  it('keeps the compact heading and subject pills usable at iPad landscape widths', () => {
    expect(styles).toMatch(/@media \(max-width: 1180px\)[\s\S]*\.compact-heading\s*\{[^}]*flex-direction:\s*column/s);
    expect(styles).toMatch(/@media \(max-width: 1180px\)[\s\S]*\.subject-pill\s*\{[^}]*min-height:\s*35px/s);
  });

  it('scales normal flip-clock cards from their container width', () => {
    expect(styles).toMatch(/\.flip-clock\s*\{[^}]*--flip-font:\s*clamp\(36px,\s*20cqi,\s*116px\)/s);
  });
});
