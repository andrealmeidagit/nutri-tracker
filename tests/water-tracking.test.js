import { describe, it, expect, beforeEach } from 'vitest';
import { setupTestEnvironment } from './helpers/test-setup';

describe('NutriFlow - Water Tracking counter', () => {
  let env;

  beforeEach(() => {
    env = setupTestEnvironment();
    env.dispatchDOMContentLoaded();
  });

  it('increments logged water volume correctly using quick addition buttons (250ml, 500ml)', () => {
    const activeDate = env.window.state.currentDate;
    expect(env.window.state.waterLogs[activeDate]).toBeUndefined();

    // Act: Add 250ml
    env.window.addWater(250);
    expect(env.window.state.waterLogs[activeDate]).toBe(250);
    expect(env.document.getElementById('water-curr-val').innerText).toBe('250 ml');

    // Act: Add 500ml
    env.window.addWater(500);
    expect(env.window.state.waterLogs[activeDate]).toBe(750);
    expect(env.document.getElementById('water-curr-val').innerText).toBe('750 ml');
  });

  it('toggles edit inputs and successfully saves manual inline water entries', () => {
    const activeDate = env.window.state.currentDate;
    env.window.state.waterLogs[activeDate] = 1250;
    
    // Act: open inline water edit input
    env.window.toggleWaterEdit(true);

    const inputEl = env.document.getElementById('water-edit-input');
    const textEl = env.document.getElementById('water-curr-val');

    expect(inputEl.style.display).toBe('inline-block');
    expect(inputEl.value).toBe('1250');
    expect(textEl.style.display).toBe('none');

    // Modify manual input value in DOM and save
    inputEl.value = '2500';
    env.window.saveWaterEdit();

    // Assert: Check saved value in state and re-rendered DOM text label
    expect(env.window.state.waterLogs[activeDate]).toBe(2500);
    expect(textEl.style.display).toBe('inline-block');
    expect(textEl.innerText).toBe('2500 ml');
    expect(inputEl.style.display).toBe('none');
  });

  it('calculates the liquid fill height percentage correctly capped at 100%', () => {
    const activeDate = env.window.state.currentDate;
    const fillEl = env.document.getElementById('water-liquid-fill');

    // 0 ml -> 0% height
    env.window.state.waterLogs[activeDate] = 0;
    env.window.renderDashboard();
    expect(fillEl.style.height).toBe('0%');

    // 1500 ml -> 50% height (Goal is 3000 ml)
    env.window.state.waterLogs[activeDate] = 1500;
    env.window.renderDashboard();
    expect(fillEl.style.height).toBe('50%');

    // 3000 ml -> 100% height
    env.window.state.waterLogs[activeDate] = 3000;
    env.window.renderDashboard();
    expect(fillEl.style.height).toBe('100%');

    // 5000 ml -> capped at 100% height to prevent overflow issues
    env.window.state.waterLogs[activeDate] = 5000;
    env.window.renderDashboard();
    expect(fillEl.style.height).toBe('100%');
  });
});
