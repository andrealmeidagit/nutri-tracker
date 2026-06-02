import { describe, it, expect, beforeEach } from 'vitest';
import { setupTestEnvironment } from './helpers/test-setup';

describe('NutriFlow - TDEE & Caloric Calculations', () => {
  let env;
  
  beforeEach(() => {
    // Reset test environment with a clean JSDOM window, DOMContentLoaded not fired yet
    env = setupTestEnvironment();
  });

  describe('Mifflin-St Jeor Formula', () => {
    it('calculates BMR and TDEE correctly for a standard Male profile', () => {
      // 1. Arrange
      const profile = env.window.state.userProfile;
      profile.gender = 'male';
      profile.age = 28;
      profile.weight = 80.0;
      profile.weightUnit = 'kg';
      profile.height = 180;
      profile.heightUnit = 'cm';
      profile.activityLevel = 'moderate'; // 1.55 multiplier
      profile.goal = 'maintain';

      // 2. Act
      env.window.calculateTDEETargets();

      // 3. Assert
      // Mifflin-St Jeor Male BMR: 10 * W + 6.25 * H - 5 * Age + 5
      // BMR = 10 * 80 + 6.25 * 180 - 5 * 28 + 5 = 800 + 1125 - 140 + 5 = 1790 kcal
      // Moderate TDEE = BMR * 1.55 = 1790 * 1.55 = 2774.5 -> Round to 2775 kcal
      expect(profile.targets.calories).toBe(2775);
    });

    it('calculates BMR and TDEE correctly for a standard Female profile', () => {
      // 1. Arrange
      const profile = env.window.state.userProfile;
      profile.gender = 'female';
      profile.age = 32;
      profile.weight = 65.0;
      profile.weightUnit = 'kg';
      profile.height = 165;
      profile.heightUnit = 'cm';
      profile.activityLevel = 'light'; // 1.375 multiplier
      profile.goal = 'maintain';

      // 2. Act
      env.window.calculateTDEETargets();

      // 3. Assert
      // Mifflin-St Jeor Female BMR: 10 * W + 6.25 * H - 5 * Age - 161
      // BMR = 10 * 65 + 6.25 * 165 - 5 * 32 - 161 = 650 + 1031.25 - 160 - 161 = 1360.25 kcal
      // Light TDEE = 1360.25 * 1.375 = 1870.34 -> Round to 1870 kcal
      expect(profile.targets.calories).toBe(1870);
    });
  });

  describe('Activity Level Multipliers', () => {
    const testCases = [
      { level: 'sedentary', multiplier: 1.2, expected: 2148 },
      { level: 'light', multiplier: 1.375, expected: 2461 },
      { level: 'moderate', multiplier: 1.55, expected: 2775 },
      { level: 'active', multiplier: 1.725, expected: 3088 },
      { level: 'athlete', multiplier: 1.9, expected: 3401 }
    ];

    testCases.forEach(({ level, expected }) => {
      it(`scales TDEE correctly for activity level: ${level}`, () => {
        const profile = env.window.state.userProfile;
        profile.gender = 'male';
        profile.age = 28;
        profile.weight = 80.0;
        profile.height = 180;
        profile.activityLevel = level;
        profile.goal = 'maintain';

        env.window.calculateTDEETargets();

        expect(profile.targets.calories).toBe(expected);
      });
    });
  });

  describe('Fitness Strategy Deficit & Surplus Adjustments', () => {
    it('applies a safe caloric deficit of 500 kcal for Fat Loss goal', () => {
      const profile = env.window.state.userProfile;
      profile.gender = 'male';
      profile.age = 28;
      profile.weight = 80.0;
      profile.height = 180;
      profile.activityLevel = 'moderate'; // 2775 maintenance
      profile.goal = 'lose'; // Fat Loss strategy

      env.window.calculateTDEETargets();

      // Expected: 2775 - 500 = 2275 kcal
      expect(profile.targets.calories).toBe(2275);
    });

    it('applies a safe caloric surplus of 300 kcal for Muscle Gain goal', () => {
      const profile = env.window.state.userProfile;
      profile.gender = 'male';
      profile.age = 28;
      profile.weight = 80.0;
      profile.height = 180;
      profile.activityLevel = 'moderate'; // 2775 maintenance
      profile.goal = 'gain'; // Muscle Gain strategy

      env.window.calculateTDEETargets();

      // Expected: 2775 + 300 = 3075 kcal
      expect(profile.targets.calories).toBe(3075);
    });
  });

  describe('Health Safety Threshold Bounds', () => {
    it('bounds male daily targets to a minimum of 1500 kcal regardless of deficit parameters', () => {
      const profile = env.window.state.userProfile;
      profile.gender = 'male';
      profile.age = 65;
      profile.weight = 55.0; // Low weight
      profile.height = 160;
      profile.activityLevel = 'sedentary'; // Low activity (1.2 multiplier)
      profile.goal = 'lose'; // Aggressive deficit

      // Act
      env.window.calculateTDEETargets();

      // Math: BMR = 10*55 + 6.25*160 - 5*65 + 5 = 550 + 1000 - 325 + 5 = 1230 kcal
      // Sedentary TDEE = 1230 * 1.2 = 1476 kcal
      // Deficit target = 1476 - 500 = 976 kcal
      // Must bound to male minimum limit: 1500 kcal
      expect(profile.targets.calories).toBe(1500);
    });

    it('bounds female daily targets to a minimum of 1200 kcal regardless of deficit parameters', () => {
      const profile = env.window.state.userProfile;
      profile.gender = 'female';
      profile.age = 60;
      profile.weight = 45.0; // Low weight
      profile.height = 150;
      profile.activityLevel = 'sedentary'; // 1.2 multiplier
      profile.goal = 'lose'; // Deficit strategy

      // Act
      env.window.calculateTDEETargets();

      // Math BMR: 10*45 + 6.25*150 - 5*60 - 161 = 450 + 937.5 - 300 - 161 = 926.5 kcal
      // TDEE = 926.5 * 1.2 = 1111.8 -> 1112 kcal
      // Deficit: 1112 - 500 = 612 kcal
      // Must bound to female minimum limit: 1200 kcal
      expect(profile.targets.calories).toBe(1200);
    });
  });

  describe('Macronutrient Grams Distribution Calculations', () => {
    // Math: 1g Protein = 4 kcal, 1g Carbs = 4 kcal, 1g Fats = 9 kcal
    // Standard Male profile defaults to 2775 kcal target
    it('distributes macros correctly under the Balanced Fitness ratio option (40% C, 30% P, 30% F)', () => {
      const profile = env.window.state.userProfile;
      profile.macroRatio = 'balanced';

      env.window.calculateTDEETargets();

      // Targets (total calories = 2775):
      // Protein: 30% of 2775 = 832.5 kcal -> 832.5 / 4 = 208.1g -> Round to 208g
      // Carbs: 40% of 2775 = 1110 kcal -> 1110 / 4 = 278g
      // Fats: 30% of 2775 = 832.5 kcal -> 832.5 / 9 = 92.5 -> Round to 93g
      expect(profile.targets.protein).toBe(208);
      expect(profile.targets.carbs).toBe(278);
      expect(profile.targets.fats).toBe(93);
    });

    it('distributes macros correctly under the High Protein ratio option (35% C, 45% P, 20% F)', () => {
      const profile = env.window.state.userProfile;
      profile.macroRatio = 'high-protein';

      env.window.calculateTDEETargets();

      // Targets (total calories = 2775):
      // Protein: 45% of 2775 = 1248.75 kcal -> 1248.75 / 4 = 312.2g -> Round to 312g
      // Carbs: 35% of 2775 = 971.25 kcal -> 971.25 / 4 = 242.8g -> Round to 243g
      // Fats: 20% of 2775 = 555 kcal -> 555 / 9 = 61.67g -> Round to 62g
      expect(profile.targets.protein).toBe(312);
      expect(profile.targets.carbs).toBe(243);
      expect(profile.targets.fats).toBe(62);
    });

    it('distributes macros correctly under the Keto ratio option (20% C, 40% P, 40% F)', () => {
      const profile = env.window.state.userProfile;
      profile.macroRatio = 'keto';

      env.window.calculateTDEETargets();

      // Targets (total calories = 2775):
      // Protein: 40% of 2775 = 1110 kcal -> 1110 / 4 = 278g
      // Carbs: 20% of 2775 = 555 kcal -> 555 / 4 = 138.8 -> Round to 139g
      // Fats: 40% of 2775 = 1110 kcal -> 1110 / 9 = 123.3g -> Round to 123g
      expect(profile.targets.protein).toBe(278);
      expect(profile.targets.carbs).toBe(139);
      expect(profile.targets.fats).toBe(123);
    });

    it('distributes macros correctly under custom ratios', () => {
      const profile = env.window.state.userProfile;
      profile.macroRatio = 'custom';
      profile.customMacros = { protein: 50, carbs: 20, fats: 30 }; // Custom sum = 100%

      env.window.calculateTDEETargets();

      // Targets (total calories = 2775):
      // Protein: 50% of 2775 = 1387.5 kcal -> 1387.5 / 4 = 346.9g -> Round to 347g
      // Carbs: 20% of 2775 = 555 kcal -> 555 / 4 = 139g
      // Fats: 30% of 2775 = 832.5 kcal -> 832.5 / 9 = 93g
      expect(profile.targets.protein).toBe(347);
      expect(profile.targets.carbs).toBe(139);
      expect(profile.targets.fats).toBe(93);
    });
  });
});
