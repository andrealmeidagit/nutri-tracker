import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupTestEnvironment } from './helpers/test-setup';

describe('NutriFlow - Daily Meal & Food Logging', () => {
  let env;

  beforeEach(() => {
    env = setupTestEnvironment();
    // Dispatch DOMContentLoaded event to trigger bindings and set date
    env.dispatchDOMContentLoaded();
  });

  describe('Nutrition Recalculations and Portions Scaling', () => {
    it('scales standard food nutrition values correctly based on gram portion sizes (per 100g base)', () => {
      // 1. Arrange: Select chicken breast (165 kcal, 31g protein, 0g carbs, 3.6g fats per 100g)
      const foodItem = {
        id: "db_chicken_breast",
        name: "Chicken Breast (Cooked)",
        calories: 165,
        protein: 31.0,
        carbs: 0.0,
        fats: 3.6,
        defaultServing: 150,
        unit: "g"
      };
      env.window.state.selectedFoodItem = foodItem;
      
      // Inject inputs into DOM
      env.document.getElementById('input-serving-amount').value = '150';
      env.document.getElementById('select-serving-unit').value = 'g';

      // 2. Act: Recalculate
      env.window.recalculateSelectedFoodNutrition();

      // 3. Assert
      // Ratio = 150 / 100 = 1.5
      // Calories: 165 * 1.5 = 247.5 -> 248 kcal
      // Protein: 31.0 * 1.5 = 46.5g
      // Carbs: 0.0 * 1.5 = 0.0g
      // Fats: 3.6 * 1.5 = 5.4g
      expect(env.document.getElementById('config-sum-cals').innerText.toString()).toBe('248');
      expect(env.document.getElementById('config-sum-protein').innerText.toString()).toBe('46.5g');
      expect(env.document.getElementById('config-sum-carbs').innerText.toString()).toBe('0g');
      expect(env.document.getElementById('config-sum-fats').innerText.toString()).toBe('5.4g');
    });

    it('scales unit-based food nutrition values directly without 100g division', () => {
      // 1. Arrange: Select Whole Egg (Large) (143 kcal, 12.6g P, 0.7g C, 9.5g F per egg piece)
      const eggPiece = {
        id: "db_whole_egg",
        name: "Whole Egg (Large)",
        calories: 143,
        protein: 12.6,
        carbs: 0.7,
        fats: 9.5,
        defaultServing: 2,
        unit: "unit"
      };
      env.window.state.selectedFoodItem = eggPiece;
      
      env.document.getElementById('input-serving-amount').value = '2';
      env.document.getElementById('select-serving-unit').value = 'unit';

      // 2. Act
      env.window.recalculateSelectedFoodNutrition();

      // 3. Assert: 2 eggs = 2x multiplier directly
      // Calories: 143 * 2 = 286 kcal
      // Protein: 12.6 * 2 = 25.2g
      // Carbs: 0.7 * 2 = 1.4g
      // Fats: 9.5 * 2 = 19.0g
      expect(env.document.getElementById('config-sum-cals').innerText.toString()).toBe('286');
      expect(env.document.getElementById('config-sum-protein').innerText.toString()).toBe('25.2g');
      expect(env.document.getElementById('config-sum-carbs').innerText.toString()).toBe('1.4g');
      expect(env.document.getElementById('config-sum-fats').innerText.toString()).toBe('19g');
    });
  });

  describe('Adding Food Log Items', () => {
    it('successfully logs a selected food item to a meal list', () => {
      // 1. Arrange
      const foodItem = {
        id: "db_chicken_breast",
        name: "Chicken Breast (Cooked)",
        calories: 165,
        protein: 31.0,
        carbs: 0.0,
        fats: 3.6,
        defaultServing: 100,
        unit: "g"
      };
      env.window.state.selectedFoodItem = foodItem;
      
      env.document.getElementById('input-serving-amount').value = '200';
      env.document.getElementById('select-target-meal').value = 'lunch';

      // 2. Act: Log food
      env.window.renderFoodLogger();
      env.window.logSelectedFood();

      // 3. Assert: Check state log entry
      const activeDate = env.window.state.currentDate;
      const lunchLogs = env.window.state.foodLogs[activeDate].lunch;
      
      expect(lunchLogs.length).toBe(1);
      expect(lunchLogs[0].name).toBe("Chicken Breast (Cooked)");
      expect(lunchLogs[0].serving).toBe(200);
      expect(lunchLogs[0].calories).toBe(330); // 165 * 2.0
      expect(lunchLogs[0].protein).toBe(62.0); // 31.0 * 2.0
      expect(lunchLogs[0].carbs).toBe(0.0);
      expect(lunchLogs[0].fats).toBe(7.2); // 3.6 * 2.0
    });

    it('rejects logging food when serving input is zero or negative, triggering an alert', () => {
      const foodItem = { id: "db_chicken_breast", name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fats: 3 };
      env.window.state.selectedFoodItem = foodItem;
      
      // Zero serving
      env.document.getElementById('input-serving-amount').value = '0';
      env.window.logSelectedFood();
      expect(env.window.alert).toHaveBeenCalledWith("Please log a positive serving weight amount");
      
      // Negative serving
      env.document.getElementById('input-serving-amount').value = '-50';
      env.window.logSelectedFood();
      expect(env.window.alert).toHaveBeenCalledWith("Please log a positive serving weight amount");
    });
  });

  describe('Editing Logged Entries and Re-categorizations', () => {
    beforeEach(() => {
      // Pre-populate breakfast with a food entry for testing
      const activeDate = env.window.state.currentDate;
      env.window.state.foodLogs[activeDate] = {
        breakfast: [{
          id: 'log_testing_123',
          name: 'Classic Oats',
          serving: 100,
          unit: 'g',
          calories: 300,
          protein: 10.0,
          carbs: 50.0,
          fats: 5.0
        }],
        lunch: [],
        dinner: [],
        snacks: []
      };
    });

    it('opens edit modal and scales macros proportionally when serving size is typed', () => {
      // 1. Arrange: Open modal for breakfast[0]
      env.window.openEditFoodModal('breakfast', 0);
      
      // Change input serving in DOM
      env.document.getElementById('input-edit-food-serving').value = '200'; // Double the size

      // 2. Act: Trigger scaling handler
      env.window.handleEditServingChange();

      // 3. Assert: Modal input values should double proportionally
      expect(env.document.getElementById('input-edit-food-calories').value).toBe('600');
      expect(env.document.getElementById('input-edit-food-protein').value).toBe('20');
      expect(env.document.getElementById('input-edit-food-carbs').value).toBe('100');
      expect(env.document.getElementById('input-edit-food-fats').value).toBe('10');
    });

    it('saves changes in place for the edited entry', () => {
      // Open modal
      env.window.openEditFoodModal('breakfast', 0);
      
      // Input new values
      env.document.getElementById('input-edit-food-name').value = 'Oats with Honey';
      env.document.getElementById('input-edit-food-serving').value = '150';
      env.document.getElementById('input-edit-food-calories').value = '450';
      env.document.getElementById('input-edit-food-protein').value = '15';
      env.document.getElementById('input-edit-food-carbs').value = '75';
      env.document.getElementById('input-edit-food-fats').value = '7.5';
      env.document.getElementById('select-edit-food-meal').value = 'breakfast'; // Keep category

      // Act: Save
      env.window.saveEditFoodEntry();

      // Assert
      const activeDate = env.window.state.currentDate;
      const breakfastList = env.window.state.foodLogs[activeDate].breakfast;
      expect(breakfastList.length).toBe(1);
      expect(breakfastList[0].name).toBe('Oats with Honey');
      expect(breakfastList[0].serving).toBe(150);
      expect(breakfastList[0].calories).toBe(450);
      expect(breakfastList[0].protein).toBe(15);
    });

    it('relocates the food entry to a new category when meal slot is changed in edit modal', () => {
      // Open modal
      env.window.openEditFoodModal('breakfast', 0);
      
      // Switch meal slot from breakfast to dinner
      env.document.getElementById('select-edit-food-meal').value = 'dinner';

      // Act: Save
      env.window.saveEditFoodEntry();

      // Assert: Entry should be removed from breakfast and pushed to dinner list
      const activeDate = env.window.state.currentDate;
      expect(env.window.state.foodLogs[activeDate].breakfast.length).toBe(0);
      
      const dinnerList = env.window.state.foodLogs[activeDate].dinner;
      expect(dinnerList.length).toBe(1);
      expect(dinnerList[0].name).toBe('Classic Oats');
    });
  });

  describe('Quick Macro Addition', () => {
    it('calculates calories automatically based on protein, carb, fat counts in quick log dialog', () => {
      // 1. Arrange: input macros
      env.document.getElementById('quick-prot-input').value = '20'; // 20 * 4 = 80 kcal
      env.document.getElementById('quick-carb-input').value = '30'; // 30 * 4 = 120 kcal
      env.document.getElementById('quick-fat-input').value = '10';  // 10 * 9 = 90 kcal

      // 2. Act
      env.window.calculateQuickCalories();

      // 3. Assert: 80 + 120 + 90 = 290 kcal
      expect(env.document.getElementById('quick-cal-input').value).toBe('290');
    });

    it('successfully quick logs calories and macros, placing them under snacks by default', () => {
      // 1. Arrange
      env.document.getElementById('quick-cal-input').value = '300';
      env.document.getElementById('quick-prot-input').value = '25';
      env.document.getElementById('quick-carb-input').value = '10';
      env.document.getElementById('quick-fat-input').value = '15';

      // 2. Act: Log quick macros
      env.window.logQuickMacros();

      // 3. Assert: Verify it's added to snacks
      const activeDate = env.window.state.currentDate;
      const snacksLogs = env.window.state.foodLogs[activeDate].snacks;
      
      expect(snacksLogs.length).toBe(1);
      expect(snacksLogs[0].name).toBe("Quick Calorie Add");
      expect(snacksLogs[0].calories).toBe(300);
      expect(snacksLogs[0].protein).toBe(25);
      expect(snacksLogs[0].carbs).toBe(10);
      expect(snacksLogs[0].fats).toBe(15);
      
      // Fields must be wiped/reset
      expect(env.document.getElementById('quick-cal-input').value).toBe('');
      expect(env.document.getElementById('quick-prot-input').value).toBe('');
    });
  });
});
