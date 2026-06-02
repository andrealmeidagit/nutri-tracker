import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupTestEnvironment } from './helpers/test-setup';

describe('NutriFlow - Storage & Encryption Security', () => {
  let env;

  beforeEach(() => {
    env = setupTestEnvironment();
  });

  describe('Data Obfuscation / Ciphering Functions', () => {
    it('encrypts data in Base64 correctly (obfuscation layer)', () => {
      const sampleText = '{"name":"Alex","weight":80}';
      
      // Act
      const cipherText = env.window.encryptData(sampleText);
      
      // Assert: Verify it's encrypted and not plain text
      expect(cipherText).not.toBe(sampleText);
      // Base64 of '{"name":"Alex","weight":80}' is 'eyJuYW1lIjoiQWxleCIsIndlaWdodCI6ODB9'
      expect(cipherText).toBe('eyJuYW1lIjoiQWxleCIsIndlaWdodCI6ODB9');
    });

    it('decrypts encrypted cipher texts back to original state strings', () => {
      const plainText = '{"age":28,"gender":"male"}';
      const cipherText = env.window.encryptData(plainText);

      // Act
      const decrypted = env.window.decryptData(cipherText);

      // Assert
      expect(decrypted).toBe(plainText);
    });

    it('safely handles empty, null or undefined values in decryptData without crash', () => {
      expect(env.window.decryptData(null)).toBeNull();
      expect(env.window.decryptData(undefined)).toBeNull();
      expect(env.window.decryptData('')).toBeNull();
    });

    it('recovers gracefully from corrupt cipher string failures without crashing', () => {
      const consoleErrorSpy = vi.spyOn(env.window.console, 'error').mockImplementation(() => {});
      const corruptCipher = '!!!InvalidBase64!!!';

      const result = env.window.decryptData(corruptCipher);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Backward Compatibility Checks', () => {
    it('loads raw legacy unencrypted JSON strings beginning with brackets/braces successfully', () => {
      const legacyRawJSON = '{"username":"Alex Fitness Legacy","age":30}';
      
      // Act
      const decrypted = env.window.decryptData(legacyRawJSON);

      // Assert: Raw string is bypassed safely and returned as-is, preventing crashes for old users
      expect(decrypted).toBe(legacyRawJSON);
    });
    
    it('loads legacy unencrypted JSON arrays successfully', () => {
      const legacyRawArray = '[{"date":"2026-05-30","weight":82.5}]';
      
      // Act
      const decrypted = env.window.decryptData(legacyRawArray);

      // Assert
      expect(decrypted).toBe(legacyRawArray);
    });
  });

  describe('LocalStorage Persistence Life Cycle Sync', () => {
    it('saves user profile state to localStorage in encrypted format', () => {
      const profile = env.window.state.userProfile;
      profile.username = 'Testing Persist';
      profile.age = 25;

      // Act: Trigger save operation
      env.window.saveToLocalStorage('nutriflow_user_profile', profile);

      // Assert: Verify value is stored in encrypted format in the mock storage
      const rawStored = env.window.localStorage.getItem('nutriflow_user_profile');
      expect(rawStored).not.toBeNull();
      expect(rawStored).not.toContain('Testing Persist'); // Not stored as plain text
      
      const decrypted = env.window.decryptData(rawStored);
      const parsed = JSON.parse(decrypted);
      expect(parsed.username).toBe('Testing Persist');
      expect(parsed.age).toBe(25);
    });

    it('loads user profile successfully when encrypted data is present in localStorage', () => {
      const testProfile = {
        username: 'Encrypted Loading User',
        age: 40,
        gender: 'female',
        targets: { calories: 1800, protein: 120, carbs: 180, fats: 50 }
      };
      
      // Seed storage with encrypted profile
      const encryptedProfile = env.window.encryptData(JSON.stringify(testProfile));
      env.window.localStorage.setItem('nutriflow_user_profile', encryptedProfile);

      // Act: Load data
      env.window.loadDataFromLocalStorage();

      // Assert: State must be successfully populated
      expect(env.window.state.userProfile.username).toBe('Encrypted Loading User');
      expect(env.window.state.userProfile.age).toBe(40);
      expect(env.window.state.userProfile.gender).toBe('female');
      expect(env.window.state.userProfile.targets.calories).toBe(1800);
    });

    it('loads food logs, weight history, and hydration logs accurately from encrypted localStorage', () => {
      // 1. Arrange: Define sample logs
      const sampleFoodLogs = {
        "2026-06-01": { breakfast: [{ name: "Oatmeal", calories: 250, protein: 10, carbs: 45, fats: 4, serving: 60, unit: "g" }], lunch: [], dinner: [], snacks: [] }
      };
      const sampleWeightLogs = [{ date: "2026-06-01", weight: 79.5 }];
      const sampleWaterLogs = { "2026-06-01": 2000 };

      // Encrypt and store them
      env.window.localStorage.setItem('nutriflow_food_logs', env.window.encryptData(JSON.stringify(sampleFoodLogs)));
      env.window.localStorage.setItem('nutriflow_weight_history', env.window.encryptData(JSON.stringify(sampleWeightLogs)));
      env.window.localStorage.setItem('nutriflow_water_logs', env.window.encryptData(JSON.stringify(sampleWaterLogs)));

      // 2. Act
      env.window.loadDataFromLocalStorage();

      // 3. Assert: Verify parsed states
      expect(env.window.state.foodLogs["2026-06-01"].breakfast[0].name).toBe("Oatmeal");
      expect(env.window.state.weightHistory[0].weight).toBe(79.5);
      expect(env.window.state.waterLogs["2026-06-01"]).toBe(2000);
    });
  });
});
