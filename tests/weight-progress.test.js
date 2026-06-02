import { describe, it, expect, beforeEach } from 'vitest';
import { setupTestEnvironment } from './helpers/test-setup';

describe('NutriFlow - Weight Progress Timeline & Recalculation', () => {
  let env;

  beforeEach(() => {
    env = setupTestEnvironment();
    env.dispatchDOMContentLoaded();
  });

  it('adds a new weight entry or updates an existing date entry successfully', () => {
    const activeDate = env.window.state.currentDate;
    
    // Act: Save weight of 85kg on activeDate via weight modal values
    env.document.getElementById('input-modal-weight').value = '85.0';
    env.document.getElementById('select-modal-weight-unit').value = 'kg';
    env.document.getElementById('input-modal-weight-date').value = activeDate;

    env.window.saveWeightEntry();

    // Assert: Check history
    expect(env.window.state.weightHistory.length).toBe(1);
    expect(env.window.state.weightHistory[0].date).toBe(activeDate);
    expect(env.window.state.weightHistory[0].weight).toBe(85.0);
    expect(env.window.state.userProfile.weight).toBe(85.0);

    // Act: Update weight to 84.5kg on same activeDate
    env.document.getElementById('input-modal-weight').value = '84.5';
    env.window.saveWeightEntry();

    // Assert: Entry should be updated in-place (not duplicated)
    expect(env.window.state.weightHistory.length).toBe(1);
    expect(env.window.state.weightHistory[0].weight).toBe(84.5);
    expect(env.window.state.userProfile.weight).toBe(84.5);
  });

  it('deletes a weight log entry successfully', () => {
    // Seed weight history
    env.window.state.weightHistory = [
      { date: '2026-05-28', weight: 81.0 },
      { date: '2026-05-29', weight: 80.5 }
    ];

    // Act: Delete entry for 2026-05-28
    env.window.deleteWeightEntry('2026-05-28');

    // Assert: Verify removal
    expect(env.window.state.weightHistory.length).toBe(1);
    expect(env.window.state.weightHistory[0].date).toBe('2026-05-29');
    expect(env.window.state.weightHistory[0].weight).toBe(80.5);
  });

  it('triggers dynamic TDEE and daily targets recalculation automatically when new weight is saved', () => {
    const activeDate = env.window.state.currentDate;
    
    // 1. Arrange: Establish standard base profile
    const profile = env.window.state.userProfile;
    profile.gender = 'male';
    profile.age = 28;
    profile.weight = 80.0;
    profile.height = 180;
    profile.activityLevel = 'moderate';
    profile.goal = 'maintain';
    profile.macroRatio = 'balanced';

    env.window.calculateTDEETargets();
    const caloriesAt80kg = profile.targets.calories; // 2775 kcal

    // 2. Act: Increase weight to 90kg via saveWeightEntry
    env.document.getElementById('input-modal-weight').value = '90.0';
    env.document.getElementById('select-modal-weight-unit').value = 'kg';
    env.document.getElementById('input-modal-weight-date').value = activeDate;
    
    env.window.saveWeightEntry();

    // 3. Assert: Targets must be updated (increased weight = higher TDEE calorie requirements)
    const caloriesAt90kg = profile.targets.calories;
    expect(caloriesAt90kg).toBeGreaterThan(caloriesAt80kg);
    
    // Math checks for 90kg:
    // BMR = 10 * 90 + 6.25 * 180 - 5 * 28 + 5 = 900 + 1125 - 140 + 5 = 1890 kcal
    // Moderate: 1890 * 1.55 = 2929.5 -> 2930 kcal
    expect(caloriesAt90kg).toBe(2930);
  });
});
