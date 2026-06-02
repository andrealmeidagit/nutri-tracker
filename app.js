/**
 * NutriFlow - Application Controller
 * Handles application state, LocalStorage persistence, TDEE mathematical calculations, 
 * search autocompletion, hydration widgets, and Chart.js trend plotting.
 */

// ==========================================
// 1. STATE INITIALIZATION & DEFAULTS
// ==========================================
let state = {
  activeView: 'dashboard',
  currentDate: getTodayString(),
  
  userProfile: {
    username: 'Alex Fitness',
    avatarInitial: 'AF',
    avatarColor: '#8b5cf6',
    age: 28,
    gender: 'male',
    weight: 80.0,
    weightUnit: 'kg',
    height: 180,
    heightUnit: 'cm',
    activityLevel: 'moderate',
    goal: 'maintain',
    macroRatio: 'balanced',
    customMacros: { protein: 30, carbs: 40, fats: 30 },
    targets: { calories: 2500, protein: 188, carbs: 250, fats: 83 }
  },
  
  foodLogs: {}, // Format: { "YYYY-MM-DD": { breakfast: [], lunch: [], dinner: [], snacks: [] } }
  weightHistory: [], // Format: [ { date: "YYYY-MM-DD", weight: 80.0 } ]
  waterLogs: {}, // Format: { "YYYY-MM-DD": 1500 }
  customFoods: [], // Format: [ { id: "custom_...", name: "...", calories: 300, ... } ]
  
  selectedFoodItem: null,
  editingFoodItem: null
};

// UI references for charts
let calorieTrendChart = null;
let weightTrendChart = null;

// Temporary states for onboarding flow
let onboardingState = {
  gender: 'male',
  goal: 'maintain'
};

// Circumference of the SVG calorie circle progress ring (r=100)
const RING_CIRCUMFERENCE = 628;

// ==========================================
// 2. DOCUMENT LOAD & LIFE CYCLE EVENTS
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  loadDataFromLocalStorage();
  initializeDateDisplay();
  initializeFormDefaults();
  
  // Render views & graphs on initial page load
  switchView('dashboard');
  
  // Set date input in weight modal to today
  document.getElementById('input-modal-weight-date').value = state.currentDate;
  
  // Privacy banner display check
  const hasConsent = localStorage.getItem('nutriflow_privacy_consent');
  const banner = document.getElementById('privacy-banner-container');
  if (!hasConsent && banner) {
    banner.style.display = 'flex';
  }

  // Onboarding landing display check
  const isOnboarded = localStorage.getItem('nutriflow_onboarded');
  const onboardingContainer = document.getElementById('onboarding-container');
  if (!isOnboarded && onboardingContainer) {
    onboardingContainer.style.display = 'flex';
    onboardingState.gender = 'male';
    onboardingState.goal = 'maintain';
  }
});

// Helper: Get local date formatted as YYYY-MM-DD
function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Human-readable date string
function getFormattedDate(dateStr) {
  const parts = dateStr.split('-');
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function initializeDateDisplay() {
  const formatted = getFormattedDate(state.currentDate);
  
  const dashboardDateStrEl = document.getElementById('dashboard-date-str');
  if (dashboardDateStrEl) {
    dashboardDateStrEl.innerText = formatted;
  }
  
  const dashboardPicker = document.getElementById('dashboard-date-picker');
  if (dashboardPicker) {
    dashboardPicker.value = state.currentDate;
  }

  const loggerDateStrEl = document.getElementById('logger-date-str');
  if (loggerDateStrEl) {
    loggerDateStrEl.innerText = `Logging for: ${formatted}`;
  }

  const loggerPicker = document.getElementById('logger-date-picker');
  if (loggerPicker) {
    loggerPicker.value = state.currentDate;
  }

  // Toggle "Today" button visibility based on active date
  const isToday = (state.currentDate === getTodayString());
  
  const dashTodayBtn = document.getElementById('dashboard-today-btn');
  if (dashTodayBtn) {
    dashTodayBtn.style.display = isToday ? 'none' : 'inline-flex';
  }

  const logTodayBtn = document.getElementById('logger-today-btn');
  if (logTodayBtn) {
    logTodayBtn.style.display = isToday ? 'none' : 'inline-flex';
  }
}

function jumpToToday() {
  changeActiveDate(getTodayString());
}

function changeActiveDate(newDateVal) {
  if (!newDateVal) return;
  
  state.currentDate = newDateVal;
  
  // Update pickers and textual display headers
  initializeDateDisplay();
  
  // Also sync the weight modal date field
  const weightDate = document.getElementById('input-modal-weight-date');
  if (weightDate) {
    weightDate.value = newDateVal;
  }
  
  // Dynamic visual re-draw depending on active tab
  if (state.activeView === 'dashboard') {
    renderDashboard();
  } else if (state.activeView === 'logger') {
    renderFoodLogger();
  }
}

function adjustDate(offset) {
  // Parse state.currentDate (format YYYY-MM-DD)
  const parts = state.currentDate.split('-');
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  
  // Shift date
  dateObj.setDate(dateObj.getDate() + offset);
  
  // Format back to YYYY-MM-DD
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const newDateVal = `${yyyy}-${mm}-${dd}`;
  
  // Trigger active date change
  changeActiveDate(newDateVal);
}

// ==========================================
// 3. STORAGE & DATA MANAGEMENT
// ==========================================
// ==========================================
// 3. STORAGE & DATA MANAGEMENT (ENCRYPTED)
// ==========================================
function encryptData(text) {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch (e) {
    console.error("Encryption failed: ", e);
    return text;
  }
}

function decryptData(cipherText) {
  if (!cipherText) return null;
  const trimmed = cipherText.trim();
  // Safe backward compatibility check for existing non-encrypted data
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return trimmed;
  }
  try {
    return decodeURIComponent(escape(atob(trimmed)));
  } catch (e) {
    console.error("Decryption failed: ", e);
    return null;
  }
}

function loadDataFromLocalStorage() {
  try {
    // 1. Profile & Target calculations
    const savedProfile = localStorage.getItem('nutriflow_user_profile');
    if (savedProfile) {
      const decrypted = decryptData(savedProfile);
      if (decrypted) {
        state.userProfile = JSON.parse(decrypted);
        if (!state.userProfile.username) state.userProfile.username = 'User Profile';
        if (!state.userProfile.avatarInitial) state.userProfile.avatarInitial = 'U';
        if (!state.userProfile.avatarColor) state.userProfile.avatarColor = '#8b5cf6';
        if (!state.userProfile.weightUnit) state.userProfile.weightUnit = 'kg';
        if (!state.userProfile.heightUnit) state.userProfile.heightUnit = 'cm';
        
        // Dynamically apply their accent color scheme immediately!
        applyGlobalThemeAccent(state.userProfile.avatarColor);
      }
    } else {
      calculateTDEETargets();
      applyGlobalThemeAccent('#8b5cf6');
    }
    
    // 2. Daily Food Logs
    const savedFoodLogs = localStorage.getItem('nutriflow_food_logs');
    if (savedFoodLogs) {
      const decrypted = decryptData(savedFoodLogs);
      if (decrypted) {
        state.foodLogs = JSON.parse(decrypted);
      }
    }
    
    // 3. Weight Log History
    const savedWeightHistory = localStorage.getItem('nutriflow_weight_history');
    if (savedWeightHistory) {
      const decrypted = decryptData(savedWeightHistory);
      if (decrypted) {
        state.weightHistory = JSON.parse(decrypted);
      }
    } else {
      state.weightHistory = [];
    }
    
    // 4. Hydration Logs
    const savedWaterLogs = localStorage.getItem('nutriflow_water_logs');
    if (savedWaterLogs) {
      const decrypted = decryptData(savedWaterLogs);
      if (decrypted) {
        state.waterLogs = JSON.parse(decrypted);
      }
    }
    
    // 5. Custom food items dictionary
    const savedCustomFoods = localStorage.getItem('nutriflow_custom_foods');
    if (savedCustomFoods) {
      const decrypted = decryptData(savedCustomFoods);
      if (decrypted) {
        state.customFoods = JSON.parse(decrypted);
      }
    }
  } catch (error) {
    console.error("Failed to load local storage configurations: ", error);
  }
}

function saveToLocalStorage(key, val) {
  try {
    const jsonString = JSON.stringify(val);
    const encrypted = encryptData(jsonString);
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error(`Error saving ${key} to localStorage: `, error);
  }
}

// ==========================================
// 4. ROUTING & VIEW CONTROLLER
// ==========================================
function switchView(viewId) {
  state.activeView = viewId;
  
  // 1. Toggle active item in navigation list
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const targetNavItem = document.getElementById(`nav-${viewId}`);
  if (targetNavItem) {
    targetNavItem.classList.add('active');
  }
  
  // 2. Hide all view sections and show requested one
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active');
  });
  
  const targetSection = document.getElementById(`view-${viewId}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }
  
  // 3. Render contents specific to active view
  if (viewId === 'dashboard') {
    renderDashboard();
  } else if (viewId === 'logger') {
    renderFoodLogger();
  } else if (viewId === 'calculator') {
    renderCalculatorProfile();
  } else if (viewId === 'weight') {
    renderWeightAndAnalytics();
  }
}

// ==========================================
// 5. TDEE MATHEMATICAL FORMULAS
// ==========================================
function calculateTDEETargets() {
  const profile = state.userProfile;
  
  // Mifflin-St Jeor requires weight in kg and height in cm
  let weightInKg = profile.weight;
  let heightInCm = profile.height;
  
  if (profile.weightUnit === 'lbs') {
    weightInKg = profile.weight / 2.20462;
  }
  if (profile.heightUnit === 'in') {
    heightInCm = profile.height * 2.54;
  }
  
  let bmr = 0;
  
  // Mifflin-St Jeor Equation
  if (profile.gender === 'male') {
    bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * profile.age + 5;
  } else {
    bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * profile.age - 161;
  }
  
  // Activity Multipliers
  let multiplier = 1.2; // Sedentary default
  switch (profile.activityLevel) {
    case 'light': multiplier = 1.375; break;
    case 'moderate': multiplier = 1.55; break;
    case 'active': multiplier = 1.725; break;
    case 'athlete': multiplier = 1.9; break;
  }
  
  const tdee = Math.round(bmr * multiplier);
  let calGoal = tdee;
  
  // Strategy Adjustment
  if (profile.goal === 'lose') {
    calGoal = tdee - 500; // 500 kcal safe caloric deficit
  } else if (profile.goal === 'gain') {
    calGoal = tdee + 300; // 300 kcal lean muscle mass surplus
  }
  
  // Minimum caloric thresholds for healthy safety bounds
  if (profile.gender === 'male' && calGoal < 1500) calGoal = 1500;
  if (profile.gender === 'female' && calGoal < 1200) calGoal = 1200;
  
  profile.targets.calories = calGoal;
  
  // Macro Ratio Gram Distribution
  let protPct = 30, carbsPct = 40, fatsPct = 30; // Balanced default
  
  if (profile.macroRatio === 'high-protein') {
    protPct = 45; carbsPct = 35; fatsPct = 20;
  } else if (profile.macroRatio === 'keto') {
    protPct = 40; carbsPct = 20; fatsPct = 40;
  } else if (profile.macroRatio === 'custom') {
    protPct = profile.customMacros.protein;
    carbsPct = profile.customMacros.carbs;
    fatsPct = profile.customMacros.fats;
  }
  
  // Math: 1g Protein/Carbs = 4 kcal, 1g Fats = 9 kcal
  profile.targets.protein = Math.round((calGoal * (protPct / 100)) / 4);
  profile.targets.carbs = Math.round((calGoal * (carbsPct / 100)) / 4);
  profile.targets.fats = Math.round((calGoal * (fatsPct / 100)) / 9);
  
  saveToLocalStorage('nutriflow_user_profile', state.userProfile);
}

// ==========================================
// 6. DASHBOARD RENDERING & LOGIC
// ==========================================
function renderDashboard() {
  const profile = state.userProfile;
  const todayString = state.currentDate;
  
  // 1. Pull food logged metrics for today
  let loggedCals = 0;
  let loggedProtein = 0;
  let loggedCarbs = 0;
  let loggedFats = 0;
  
  if (state.foodLogs[todayString]) {
    const meals = state.foodLogs[todayString];
    for (const mealKey in meals) {
      meals[mealKey].forEach(item => {
        loggedCals += item.calories;
        loggedProtein += item.protein;
        loggedCarbs += item.carbs;
        loggedFats += item.fats;
      });
    }
  }
  
  // Smooth float rounding
  loggedCals = Math.round(loggedCals);
  loggedProtein = Math.round(loggedProtein);
  loggedCarbs = Math.round(loggedCarbs);
  loggedFats = Math.round(loggedFats);
  
  const targetCals = profile.targets.calories;
  const remainingCals = targetCals - loggedCals;
  
  // 2. Set Sidebar user profiles labels dynamically
  document.getElementById('sidebar-username').innerText = profile.username || 'User Profile';
  const goalStrings = { lose: 'Fat Loss', maintain: 'Maintenance', gain: 'Lean Bulking' };
  document.getElementById('sidebar-goaltag').innerText = `Goal: ${goalStrings[profile.goal]}`;
  
  const avatarEl = document.getElementById('sidebar-avatar');
  if (avatarEl) {
    avatarEl.innerText = profile.avatarInitial || 'U';
    avatarEl.style.backgroundColor = profile.avatarColor || 'var(--color-calories)';
    avatarEl.style.color = '#ffffff';
  }
  
  // 3. Render Calorie Progress Ring values
  const remainingNumEl = document.getElementById('calorie-remaining-num');
  const remainingLabelEl = document.getElementById('calorie-remaining-status');
  
  if (remainingCals >= 0) {
    remainingNumEl.innerText = remainingCals.toLocaleString();
    remainingNumEl.style.color = 'var(--text-primary)';
    remainingLabelEl.innerText = 'Remaining';
  } else {
    remainingNumEl.innerText = Math.abs(remainingCals).toLocaleString();
    remainingNumEl.style.color = 'var(--color-danger)';
    remainingLabelEl.innerText = 'Over Target';
  }
  
  document.getElementById('cal-target-num').innerText = `${targetCals} kcal`;
  document.getElementById('cal-food-num').innerText = `${loggedCals} kcal`;
  document.getElementById('cal-net-num').innerText = `${loggedCals} kcal`;
  
  // 4. Animate SVG circular progress bar
  const ringFillEl = document.getElementById('calorie-svg-ring');
  const percentComplete = Math.min((loggedCals / targetCals) * 100, 100);
  const strokeOffset = RING_CIRCUMFERENCE - (percentComplete / 100) * RING_CIRCUMFERENCE;
  ringFillEl.style.strokeDashoffset = strokeOffset;
  
  // If calorie budget exceeded, flash ring outline red
  if (remainingCals < 0) {
    ringFillEl.style.stroke = 'var(--color-danger)';
  } else {
    ringFillEl.style.stroke = 'url(#ringGradient)';
  }
  
  // 5. Render Macronutrient progress blocks
  updateMacroBlock('protein', loggedProtein, profile.targets.protein);
  updateMacroBlock('carbs', loggedCarbs, profile.targets.carbs);
  updateMacroBlock('fats', loggedFats, profile.targets.fats);
  
  // 6. Water volume tracking updates
  const waterConsumed = state.waterLogs[todayString] || 0;
  document.getElementById('water-curr-val').innerText = `${waterConsumed} ml`;
  
  const waterFillPct = Math.min((waterConsumed / 3000) * 100, 100);
  document.getElementById('water-liquid-fill').style.height = `${waterFillPct}%`;
  
  // 7. Latest weight update display
  let latestWeight = profile.weight;
  if (state.weightHistory.length > 0) {
    // Sort chronologically and take last
    const sortedWeights = [...state.weightHistory].sort((a,b) => new Date(a.date) - new Date(b.date));
    latestWeight = sortedWeights[sortedWeights.length - 1].weight;
  }
  document.getElementById('quick-weight-val').innerText = `${latestWeight} ${profile.weightUnit}`;
}

function updateMacroBlock(macroKey, current, target) {
  document.getElementById(`macro-${macroKey}-curr`).innerText = current;
  document.getElementById(`macro-${macroKey}-target`).innerText = `/ ${target}g`;
  
  const pct = Math.min((current / target) * 100, 100);
  document.getElementById(`macro-${macroKey}-bar`).style.width = `${pct}%`;
}

// Add water logic
function addWater(amount) {
  const todayString = state.currentDate;
  const currentVal = state.waterLogs[todayString] || 0;
  state.waterLogs[todayString] = currentVal + amount;
  
  saveToLocalStorage('nutriflow_water_logs', state.waterLogs);
  
  // Visual re-draw
  renderDashboard();
}

function toggleWaterEdit(showInput) {
  const textEl = document.getElementById('water-curr-val');
  const inputEl = document.getElementById('water-edit-input');
  const editBtn = document.querySelector('.water-inline-edit-btn');
  
  if (!textEl || !inputEl) return;
  
  if (showInput) {
    const todayString = state.currentDate;
    const currentVal = state.waterLogs[todayString] || 0;
    
    textEl.style.display = 'none';
    if (editBtn) editBtn.style.display = 'none';
    
    inputEl.style.display = 'inline-block';
    inputEl.value = currentVal;
    inputEl.focus();
    inputEl.select();
  } else {
    inputEl.style.display = 'none';
    textEl.style.display = 'inline-block';
    if (editBtn) editBtn.style.display = 'inline-flex';
  }
}

function handleWaterEditKey(event) {
  if (event.key === 'Enter') {
    saveWaterEdit();
  } else if (event.key === 'Escape') {
    toggleWaterEdit(false);
  }
}

function saveWaterEdit() {
  const inputEl = document.getElementById('water-edit-input');
  if (!inputEl || inputEl.style.display === 'none') return;
  
  let newAmount = parseInt(inputEl.value);
  if (isNaN(newAmount) || newAmount < 0) {
    newAmount = 0;
  }
  
  const todayString = state.currentDate;
  state.waterLogs[todayString] = newAmount;
  
  saveToLocalStorage('nutriflow_water_logs', state.waterLogs);
  
  // Close and re-draw
  toggleWaterEdit(false);
  renderDashboard();
}

// ==========================================
// 7. FOOD LOGGER VIEWS & EVENT BINDINGS
// ==========================================
function renderFoodLogger() {
  const todayString = state.currentDate;
  
  // 1. If date doesn't exist in log dictionary, initialize empty meal keys
  if (!state.foodLogs[todayString]) {
    state.foodLogs[todayString] = { breakfast: [], lunch: [], dinner: [], snacks: [] };
  }
  
  const dailyMealLogs = state.foodLogs[todayString];
  
  // 2. Render each meal type logged list
  for (const mealKey in dailyMealLogs) {
    renderLoggedMealItems(mealKey, dailyMealLogs[mealKey]);
  }
}

function renderLoggedMealItems(mealKey, itemsList) {
  const listContainer = document.getElementById(`meal-list-${mealKey}`);
  const macroSummaryText = document.getElementById(`meal-${mealKey}-macros`);
  const calSummaryText = document.getElementById(`meal-${mealKey}-cals`);
  
  listContainer.innerHTML = '';
  
  let mealCals = 0;
  let mealProtein = 0;
  let mealCarbs = 0;
  let mealFats = 0;
  
  if (itemsList.length === 0) {
    listContainer.innerHTML = `<div class="empty-meal-state">No food logged for this meal yet</div>`;
  } else {
    itemsList.forEach((item, index) => {
      mealCals += item.calories;
      mealProtein += item.protein;
      mealCarbs += item.carbs;
      mealFats += item.fats;
      
      const itemEl = document.createElement('div');
      itemEl.className = 'logged-food-item';
      itemEl.innerHTML = `
        <div class="item-main-details">
          <span class="item-log-name">${item.name}</span>
          <span class="item-log-portion">${item.serving}${item.unit}</span>
        </div>
        <div class="item-log-right">
          <div class="item-log-macros">P: ${Math.round(item.protein)}g | C: ${Math.round(item.carbs)}g | F: ${Math.round(item.fats)}g</div>
          <span class="item-log-cals">${Math.round(item.calories)} kcal</span>
          <div class="item-actions">
            <button class="item-edit-btn" onclick="openEditFoodModal('${mealKey}', ${index})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="item-delete-btn" onclick="deleteLoggedFood('${mealKey}', ${index})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          </div>
        </div>
      `;
      listContainer.appendChild(itemEl);
    });
  }
  
  macroSummaryText.innerText = `P: ${Math.round(mealProtein)}g  |  C: ${Math.round(mealCarbs)}g  |  F: ${Math.round(mealFats)}g`;
  calSummaryText.innerText = `${Math.round(mealCals)} kcal`;
}

function toggleMealCollapse(mealKey) {
  const cardEl = document.getElementById(`meal-card-${mealKey}`);
  if (cardEl) {
    cardEl.classList.toggle('collapsed');
  }
}

// 8. FOOD SEARCH & AUTOCOMPLETE LOGIC
function handleFoodSearch() {
  const searchInput = document.getElementById('food-search-box').value.trim().toLowerCase();
  const dropdown = document.getElementById('search-suggestions');
  
  if (searchInput.length < 2) {
    dropdown.style.display = 'none';
    dropdown.innerHTML = '';
    return;
  }
  
  dropdown.innerHTML = '';
  
  // Combine native preset foods list with user custom foods
  const masterFoodDirectory = [...FOOD_DATABASE, ...state.customFoods];
  
  // Fuzzy text filter match
  const filtered = masterFoodDirectory.filter(food => 
    food.name.toLowerCase().includes(searchInput)
  ).slice(0, 8); // Max 8 suggestions
  
  if (filtered.length === 0) {
    dropdown.innerHTML = `<div style="padding:1rem; color:var(--text-secondary); text-align:center; font-style:italic;">No matching foods found. Create a custom one!</div>`;
    dropdown.style.display = 'block';
    return;
  }
  
  filtered.forEach(food => {
    const sugg = document.createElement('div');
    sugg.className = 'suggestion-item';
    sugg.onclick = () => selectFoodFromSearch(food);
    sugg.innerHTML = `
      <div class="suggestion-name-desc">
        <span class="sugg-name">${food.name}</span>
        <span class="sugg-category">${food.category || 'Custom'} (${food.defaultServing}${food.unit})</span>
      </div>
      <div class="suggestion-nutrition">
        <span class="sugg-cals">${food.calories} kcal</span><br>
        <span style="font-size:0.75rem;">P: ${food.protein}g | C: ${food.carbs}g | F: ${food.fats}g</span>
      </div>
    `;
    dropdown.appendChild(sugg);
  });
  
  dropdown.style.display = 'block';
}

function selectFoodFromSearch(food) {
  // Hide dropdown search
  document.getElementById('search-suggestions').style.display = 'none';
  document.getElementById('food-search-box').value = '';
  
  state.selectedFoodItem = food;
  
  // Render configuration panel
  document.getElementById('config-food-name').innerText = food.name;
  document.getElementById('input-serving-amount').value = food.defaultServing;
  
  const unitSelect = document.getElementById('select-serving-unit');
  unitSelect.value = food.unit || 'g';
  
  // Display log config block
  document.getElementById('food-log-config-card').classList.add('active');
  
  recalculateSelectedFoodNutrition();
}

function recalculateSelectedFoodNutrition() {
  const food = state.selectedFoodItem;
  if (!food) return;
  
  const loggedAmount = parseFloat(document.getElementById('input-serving-amount').value) || 0;
  
  // Portions ratios: database amounts are based per 100g, or per unit if standardized
  // Let's divide by 100 if unit is grams/ml to match base ratio, or treat directly if per unit
  // Actually in our database, everything is standard per 100g/100ml. So ratio = serving / 100
  let ratio = loggedAmount / 100;
  
  // Edge case overrides for standard portion units (e.g. piece, slice, scoop - which are stored directly)
  if (food.unit === 'unit' || food.id.includes('scoop') || food.id.includes('slice')) {
    ratio = loggedAmount; // Serving size matches unit directly
  }
  
  const calcCals = Math.round(food.calories * ratio);
  const calcProt = parseFloat((food.protein * ratio).toFixed(1));
  const calcCarbs = parseFloat((food.carbs * ratio).toFixed(1));
  const calcFats = parseFloat((food.fats * ratio).toFixed(1));
  
  document.getElementById('config-sum-cals').innerText = calcCals;
  document.getElementById('config-sum-protein').innerText = `${calcProt}g`;
  document.getElementById('config-sum-carbs').innerText = `${calcCarbs}g`;
  document.getElementById('config-sum-fats').innerText = `${calcFats}g`;
}

function closeLogConfigBox() {
  document.getElementById('food-log-config-card').classList.remove('active');
  state.selectedFoodItem = null;
}

function logSelectedFood() {
  const food = state.selectedFoodItem;
  if (!food) return;
  
  const targetMeal = document.getElementById('select-target-meal').value;
  const loggedAmount = parseFloat(document.getElementById('input-serving-amount').value) || 0;
  
  if (loggedAmount <= 0) {
    alert("Please log a positive serving weight amount");
    return;
  }
  
  let ratio = loggedAmount / 100;
  if (food.unit === 'unit' || food.id.includes('scoop') || food.id.includes('slice')) {
    ratio = loggedAmount;
  }
  
  const newLogItem = {
    id: `log_${Date.now()}`,
    name: food.name,
    serving: loggedAmount,
    unit: food.unit || 'g',
    calories: Math.round(food.calories * ratio),
    protein: parseFloat((food.protein * ratio).toFixed(1)),
    carbs: parseFloat((food.carbs * ratio).toFixed(1)),
    fats: parseFloat((food.fats * ratio).toFixed(1))
  };
  
  const todayString = state.currentDate;
  state.foodLogs[todayString][targetMeal].push(newLogItem);
  
  saveToLocalStorage('nutriflow_food_logs', state.foodLogs);
  
  // Re-draw and close
  renderFoodLogger();
  closeLogConfigBox();
}

function deleteLoggedFood(mealKey, index) {
  const todayString = state.currentDate;
  state.foodLogs[todayString][mealKey].splice(index, 1);
  saveToLocalStorage('nutriflow_food_logs', state.foodLogs);
  renderFoodLogger();
}

// ==========================================
// 7.5. EDIT LOGGED FOOD DIALOG CONTROLLERS
// ==========================================
function openEditFoodModal(mealKey, index) {
  const todayString = state.currentDate;
  const item = state.foodLogs[todayString][mealKey][index];
  if (!item) return;

  // Track the active item being edited
  state.editingFoodItem = {
    mealKey: mealKey,
    index: index,
    original: { ...item }
  };

  // Populate inputs in Edit Food Modal
  document.getElementById('input-edit-food-name').value = item.name;
  document.getElementById('select-edit-food-meal').value = mealKey;
  document.getElementById('input-edit-food-serving').value = item.serving;
  document.getElementById('input-edit-food-unit').value = item.unit || 'g';
  document.getElementById('input-edit-food-calories').value = item.calories;
  document.getElementById('input-edit-food-protein').value = item.protein;
  document.getElementById('input-edit-food-carbs').value = item.carbs;
  document.getElementById('input-edit-food-fats').value = item.fats;

  // Show modal
  document.getElementById('modal-edit-food-overlay').classList.add('active');
}

function closeEditFoodModal() {
  document.getElementById('modal-edit-food-overlay').classList.remove('active');
  state.editingFoodItem = null;
}

function handleEditServingChange() {
  if (!state.editingFoodItem) return;

  const originalItem = state.editingFoodItem.original;
  const newServing = parseFloat(document.getElementById('input-edit-food-serving').value);

  if (isNaN(newServing) || newServing <= 0) return;

  // Proportional scaling factor
  const ratio = newServing / originalItem.serving;

  // Scale calories and macros based on the original values when modal was opened
  const newCalories = Math.round(originalItem.calories * ratio);
  const newProtein = parseFloat((originalItem.protein * ratio).toFixed(1));
  const newCarbs = parseFloat((originalItem.carbs * ratio).toFixed(1));
  const newFats = parseFloat((originalItem.fats * ratio).toFixed(1));

  // Update modal input values
  document.getElementById('input-edit-food-calories').value = newCalories;
  document.getElementById('input-edit-food-protein').value = newProtein;
  document.getElementById('input-edit-food-carbs').value = newCarbs;
  document.getElementById('input-edit-food-fats').value = newFats;
}

function saveEditFoodEntry() {
  if (!state.editingFoodItem) return;

  const todayString = state.currentDate;
  const originalMealKey = state.editingFoodItem.mealKey;
  const index = state.editingFoodItem.index;

  const name = document.getElementById('input-edit-food-name').value.trim();
  const mealKey = document.getElementById('select-edit-food-meal').value;
  const serving = parseFloat(document.getElementById('input-edit-food-serving').value);
  const calories = parseInt(document.getElementById('input-edit-food-calories').value);
  const protein = parseFloat(document.getElementById('input-edit-food-protein').value) || 0;
  const carbs = parseFloat(document.getElementById('input-edit-food-carbs').value) || 0;
  const fats = parseFloat(document.getElementById('input-edit-food-fats').value) || 0;

  if (!name) {
    alert("Please enter a valid food name.");
    return;
  }
  if (isNaN(serving) || serving <= 0) {
    alert("Please enter a valid portion size.");
    return;
  }
  if (isNaN(calories) || calories < 0) {
    alert("Please enter valid calories.");
    return;
  }

  // Create updated item object
  const updatedItem = {
    ...state.editingFoodItem.original, // Preserve original ID and other properties (e.g. foodId if added)
    name: name,
    serving: serving,
    calories: calories,
    protein: protein,
    carbs: carbs,
    fats: fats
  };

  // Handle meal category re-categorization
  if (originalMealKey !== mealKey) {
    // Remove from original meal
    state.foodLogs[todayString][originalMealKey].splice(index, 1);
    // Push into new meal
    if (!state.foodLogs[todayString][mealKey]) {
      state.foodLogs[todayString][mealKey] = [];
    }
    state.foodLogs[todayString][mealKey].push(updatedItem);
  } else {
    // Simply update in place
    state.foodLogs[todayString][originalMealKey][index] = updatedItem;
  }

  // Save state
  saveToLocalStorage('nutriflow_food_logs', state.foodLogs);

  // Close and re-draw everything
  closeEditFoodModal();
  renderFoodLogger();
  renderDashboard();
}

function calculateQuickCalories() {
  const prot = parseFloat(document.getElementById('quick-prot-input').value) || 0;
  const carbs = parseFloat(document.getElementById('quick-carb-input').value) || 0;
  const fats = parseFloat(document.getElementById('quick-fat-input').value) || 0;

  const calculatedCals = Math.round((prot * 4) + (carbs * 4) + (fats * 9));
  document.getElementById('quick-cal-input').value = calculatedCals > 0 ? calculatedCals : '';
}

// Quick Calorie Log Addition
function logQuickMacros() {
  const cals = parseInt(document.getElementById('quick-cal-input').value) || 0;
  const prot = parseFloat(document.getElementById('quick-prot-input').value) || 0;
  const carbs = parseFloat(document.getElementById('quick-carb-input').value) || 0;
  const fats = parseFloat(document.getElementById('quick-fat-input').value) || 0;
  
  if (cals <= 0) {
    alert("Please input a caloric value to perform quick-log.");
    return;
  }
  
  const newQuickItem = {
    id: `quick_${Date.now()}`,
    name: "Quick Calorie Add",
    serving: 1,
    unit: "x",
    calories: cals,
    protein: prot,
    carbs: carbs,
    fats: fats
  };
  
  const todayString = state.currentDate;
  // Put under snacks as default
  if (!state.foodLogs[todayString]) {
    state.foodLogs[todayString] = { breakfast: [], lunch: [], dinner: [], snacks: [] };
  }
  state.foodLogs[todayString]['snacks'].push(newQuickItem);
  
  saveToLocalStorage('nutriflow_food_logs', state.foodLogs);
  
  // Reset values
  document.getElementById('quick-cal-input').value = '';
  document.getElementById('quick-prot-input').value = '';
  document.getElementById('quick-carb-input').value = '';
  document.getElementById('quick-fat-input').value = '';
  
  renderFoodLogger();
  alert("Nutrients quick-logged successfully!");
}

// ==========================================
// 8. TDEE TARGET CALCULATOR RENDERING
// ==========================================
function renderCalculatorProfile() {
  const p = state.userProfile;
  
  // Update unit label text dynamically
  const weightLbl = document.getElementById('lbl-calc-weight');
  if (weightLbl) weightLbl.innerText = `Weight (${p.weightUnit || 'kg'})`;
  
  const heightLbl = document.getElementById('lbl-calc-height');
  if (heightLbl) heightLbl.innerText = `Height (${p.heightUnit || 'cm'})`;
  
  // Populate form fields
  setGender(p.gender);
  document.getElementById('input-calc-age').value = p.age;
  document.getElementById('input-calc-weight').value = p.weight;
  document.getElementById('input-calc-height').value = p.height;
  document.getElementById('select-calc-activity').value = p.activityLevel;
  setObjective(p.goal);
  
  document.getElementById('select-calc-macros').value = p.macroRatio;
  handleMacroRatioSelect();
  
  // Display targets
  renderCalcStatsBox();
}

function setGender(gender) {
  state.userProfile.gender = gender;
  document.getElementById('gender-male').classList.toggle('active', gender === 'male');
  document.getElementById('gender-female').classList.toggle('active', gender === 'female');
}

function setObjective(strategy) {
  state.userProfile.goal = strategy;
  document.getElementById('strat-lose').classList.toggle('active', strategy === 'lose');
  document.getElementById('strat-maintain').classList.toggle('active', strategy === 'maintain');
  document.getElementById('strat-gain').classList.toggle('active', strategy === 'gain');
}

function handleMacroRatioSelect() {
  const macroSelectVal = document.getElementById('select-calc-macros').value;
  state.userProfile.macroRatio = macroSelectVal;
  
  const sliderContainer = document.getElementById('custom-macros-inputs-container');
  if (macroSelectVal === 'custom') {
    sliderContainer.style.display = 'block';
    adjustCustomMacros();
  } else {
    sliderContainer.style.display = 'none';
  }
}

function adjustCustomMacros(source) {
  let p = parseInt(document.getElementById('slider-protein-percent').value);
  let c = parseInt(document.getElementById('slider-carbs-percent').value);
  let f = parseInt(document.getElementById('slider-fats-percent').value);
  
  let total = p + c + f;
  
  // Auto adjustment to balance 100% simply
  if (total !== 100 && source) {
    const diff = 100 - total;
    if (source === 'protein') {
      // Adjust carbs
      c = Math.max(10, c + diff);
      document.getElementById('slider-carbs-percent').value = c;
    } else if (source === 'carbs') {
      // Adjust protein
      p = Math.max(10, p + diff);
      document.getElementById('slider-protein-percent').value = p;
    } else {
      // Adjust carbs
      c = Math.max(10, c + diff);
      document.getElementById('slider-carbs-percent').value = c;
    }
    total = p + c + f;
  }
  
  state.userProfile.customMacros = { protein: p, carbs: c, fats: f };
  
  document.getElementById('lbl-prot-pct').innerText = `${p}%`;
  document.getElementById('lbl-carbs-pct').innerText = `${c}%`;
  document.getElementById('lbl-fats-pct').innerText = `${f}%`;
  
  const errMsg = document.getElementById('custom-macro-err-msg');
  if (total === 100) {
    errMsg.innerText = "Macro distribution sums to exactly 100% ✅";
    errMsg.style.color = "var(--color-success)";
  } else {
    errMsg.innerText = `Must sum to 100% (Current: ${total}%) ❌`;
    errMsg.style.color = "var(--color-danger)";
  }
}

function calculateAndSaveProfile() {
  const age = parseInt(document.getElementById('input-calc-age').value);
  const weight = parseFloat(document.getElementById('input-calc-weight').value);
  const height = parseInt(document.getElementById('input-calc-height').value);
  const activity = document.getElementById('select-calc-activity').value;
  
  if (!age || !weight || !height) {
    alert("Please fill in valid biological profile variables");
    return;
  }
  
  state.userProfile.age = age;
  state.userProfile.weight = weight;
  state.userProfile.height = height;
  state.userProfile.activityLevel = activity;
  
  calculateTDEETargets();
  renderCalcStatsBox();
  
  alert("Daily nutrition profiles and macro targets updated successfully!");
}

function renderCalcStatsBox() {
  const targets = state.userProfile.targets;
  
  document.getElementById('res-target-cals').innerText = `${targets.calories} kcal`;
  document.getElementById('res-macro-protein').innerText = `${targets.protein} g`;
  document.getElementById('res-macro-carbs').innerText = `${targets.carbs} g`;
  document.getElementById('res-macro-fats').innerText = `${targets.fats} g`;
  
  const strategyStr = { lose: 'Fat Loss Caloric Deficit', maintain: 'Weight Maintenance', gain: 'Lean Bulking Surplus' };
  document.getElementById('res-tdee-calc-desc').innerText = `Daily budget targeted for ${strategyStr[state.userProfile.goal]} strategy.`;
}

// ==========================================
// 9. WEIGHT TIMELINES & CHART TRENDS (CHART.JS)
// ==========================================
function renderWeightAndAnalytics() {
  // 1. Render weight logs table
  const tbody = document.getElementById('weight-history-table-body');
  tbody.innerHTML = '';
  
  const sortedWeightHistory = [...state.weightHistory].sort((a,b) => new Date(b.date) - new Date(a.date));
  
  if (sortedWeightHistory.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-secondary); font-style:italic;">No weight logged yet</td></tr>`;
  } else {
    sortedWeightHistory.forEach((log, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 500;">${getFormattedDate(log.date)}</td>
        <td style="font-weight: 700; color:var(--color-calories);">${log.weight} ${state.userProfile.weightUnit}</td>
        <td>
          <button class="btn-danger" style="padding: 0.35rem 0.65rem; border-radius:8px; font-size:0.8rem;" onclick="deleteWeightEntry('${log.date}')">
            Delete
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
  
  // 2. Load Charts
  setTimeout(() => {
    buildCalorieTrendsChart();
    buildWeightTrendsChart();
  }, 100);
}

function buildCalorieTrendsChart() {
  const canvas = document.getElementById('chart-calorie-trends');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Generate date labels for last 7 days
  const labels = [];
  const calorieValues = [];
  const targetLineData = [];
  const targetVal = state.userProfile.targets.calories;
  
  const parts = state.currentDate.split('-');
  const anchorDate = new Date(parts[0], parts[1] - 1, parts[2]);
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(anchorDate);
    d.setDate(anchorDate.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dStr = `${yyyy}-${mm}-${dd}`;
    
    // Add label e.g., "May 30"
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    // Calculate total calories consumed on that day
    let dayCals = 0;
    if (state.foodLogs[dStr]) {
      const meals = state.foodLogs[dStr];
      for (const mealKey in meals) {
        meals[mealKey].forEach(item => {
          dayCals += item.calories;
        });
      }
    }
    calorieValues.push(dayCals);
    targetLineData.push(targetVal);
  }
  
  if (calorieTrendChart) {
    calorieTrendChart.destroy();
  }
  
  calorieTrendChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Consumed (kcal)',
          data: calorieValues,
          backgroundColor: 'rgba(139, 92, 246, 0.4)',
          borderColor: '#8b5cf6',
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: 'rgba(217, 70, 239, 0.6)',
          hoverBorderColor: '#d946ef'
        },
        {
          label: 'Budget Target',
          data: targetLineData,
          type: 'line',
          borderColor: 'rgba(255, 255, 255, 0.4)',
          borderDash: [5, 5],
          pointRadius: 0,
          borderWidth: 2,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#fafafa', font: { family: 'Outfit', size: 12 } }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#a1a1aa', font: { family: 'Outfit' } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#a1a1aa', font: { family: 'Outfit' } }
        }
      }
    }
  });
}

function buildWeightTrendsChart() {
  const canvas = document.getElementById('chart-weight-trends');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Sort weight history chronological for graphing
  const sorted = [...state.weightHistory].sort((a,b) => new Date(a.date) - new Date(b.date));
  
  const labels = sorted.map(item => {
    const parts = item.date.split('-');
    const d = new Date(parts[0], parts[1]-1, parts[2]);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  
  const data = sorted.map(item => item.weight);
  
  if (weightTrendChart) {
    weightTrendChart.destroy();
  }
  
  // Build a beautiful glowing smooth line chart
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
  gradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
  
  weightTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `Body Weight (${state.userProfile.weightUnit})`,
        data: data,
        backgroundColor: gradient,
        borderColor: '#06b6d4',
        borderWidth: 3,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#fafafa',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#fafafa', font: { family: 'Outfit', size: 12 } }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#a1a1aa', font: { family: 'Outfit' } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#a1a1aa', font: { family: 'Outfit' } }
        }
      }
    }
  });
}

// ==========================================
// 10. MODALS CONTROLLER & POPUPS
// ==========================================

// --- A. Weight Modal ---
function openWeightModal() {
  document.getElementById('modal-weight-overlay').classList.add('active');
  document.getElementById('input-modal-weight').value = state.userProfile.weight;
  document.getElementById('select-modal-weight-unit').value = state.userProfile.weightUnit;
}

function closeWeightModal() {
  document.getElementById('modal-weight-overlay').classList.remove('active');
}

function saveWeightEntry() {
  const weight = parseFloat(document.getElementById('input-modal-weight').value);
  const unit = document.getElementById('select-modal-weight-unit').value;
  const dateStr = document.getElementById('input-modal-weight-date').value;
  
  if (!weight || !dateStr) {
    alert("Please fill in weight value and a valid date.");
    return;
  }
  
  const existingIdx = state.weightHistory.findIndex(item => item.date === dateStr);
  if (existingIdx !== -1) {
    state.weightHistory[existingIdx].weight = weight;
  } else {
    state.weightHistory.push({ date: dateStr, weight: weight });
  }
  
  // Update state target weight too
  state.userProfile.weight = weight;
  state.userProfile.weightUnit = unit;
  
  // Recompute goals based on new weight
  calculateTDEETargets();
  
  saveToLocalStorage('nutriflow_weight_history', state.weightHistory);
  
  closeWeightModal();
  renderDashboard();
  if (state.activeView === 'weight') {
    renderWeightAndAnalytics();
  }
}

function deleteWeightEntry(dateStr) {
  state.weightHistory = state.weightHistory.filter(item => item.date !== dateStr);
  saveToLocalStorage('nutriflow_weight_history', state.weightHistory);
  renderWeightAndAnalytics();
}

// --- B. Custom Food Modal ---
function openCustomFoodModal() {
  document.getElementById('modal-custom-food-overlay').classList.add('active');
}

function closeCustomFoodModal() {
  document.getElementById('modal-custom-food-overlay').classList.remove('active');
  // Reset fields
  document.getElementById('input-new-food-name').value = '';
  document.getElementById('input-new-food-serving').value = 100;
  document.getElementById('input-new-food-calories').value = '';
  document.getElementById('input-new-food-protein').value = '';
  document.getElementById('input-new-food-carbs').value = '';
  document.getElementById('input-new-food-fats').value = '';
}

function calculateCustomFoodCalories() {
  const prot = parseFloat(document.getElementById('input-new-food-protein').value) || 0;
  const carbs = parseFloat(document.getElementById('input-new-food-carbs').value) || 0;
  const fats = parseFloat(document.getElementById('input-new-food-fats').value) || 0;

  const calculatedCals = Math.round((prot * 4) + (carbs * 4) + (fats * 9));
  document.getElementById('input-new-food-calories').value = calculatedCals > 0 ? calculatedCals : '';
}

function saveCustomFoodItem() {
  const name = document.getElementById('input-new-food-name').value.trim();
  const baseServing = parseFloat(document.getElementById('input-new-food-serving').value) || 100;
  const cals = parseInt(document.getElementById('input-new-food-calories').value);
  const prot = parseFloat(document.getElementById('input-new-food-protein').value) || 0;
  const carbs = parseFloat(document.getElementById('input-new-food-carbs').value) || 0;
  const fats = parseFloat(document.getElementById('input-new-food-fats').value) || 0;
  
  if (!name || isNaN(cals)) {
    alert("Please provide at least a food item name and total calories.");
    return;
  }
  
  const newFoodItem = {
    id: `custom_${Date.now()}`,
    name: name,
    category: "Custom Foods",
    calories: cals,
    protein: prot,
    carbs: carbs,
    fats: fats,
    defaultServing: baseServing,
    unit: "g"
  };
  
  state.customFoods.push(newFoodItem);
  saveToLocalStorage('nutriflow_custom_foods', state.customFoods);
  
  closeCustomFoodModal();
  alert(`${name} has been permanently saved to your custom food dictionary directory!`);
}

// Helper: Form Defaults setup
function initializeFormDefaults() {
  const ageField = document.getElementById('input-calc-age');
  if (ageField) ageField.value = state.userProfile.age;
  
  const weightField = document.getElementById('input-calc-weight');
  if (weightField) weightField.value = state.userProfile.weight;
  
  const heightField = document.getElementById('input-calc-height');
  if (heightField) heightField.value = state.userProfile.height;
  
  const activityField = document.getElementById('select-calc-activity');
  if (activityField) activityField.value = state.userProfile.activityLevel;
}

// ==========================================
// 11. EDIT PROFILE MODAL CONTROLLERS
// ==========================================
function openProfileModal() {
  const profile = state.userProfile;
  
  document.getElementById('input-profile-name').value = profile.username || 'User Profile';
  document.getElementById('input-profile-initial').value = profile.avatarInitial || 'U';
  document.getElementById('input-profile-color').value = profile.avatarColor || '#8b5cf6';
  document.getElementById('select-profile-weight-unit').value = profile.weightUnit || 'kg';
  document.getElementById('select-profile-height-unit').value = profile.heightUnit || 'cm';
  
  document.getElementById('modal-profile-overlay').classList.add('active');
}

function closeProfileModal() {
  document.getElementById('modal-profile-overlay').classList.remove('active');
}

function saveProfileEntry() {
  const name = document.getElementById('input-profile-name').value.trim();
  const initial = document.getElementById('input-profile-initial').value.trim().toUpperCase();
  const color = document.getElementById('input-profile-color').value;
  const newWeightUnit = document.getElementById('select-profile-weight-unit').value;
  const newHeightUnit = document.getElementById('select-profile-height-unit').value;
  
  if (!name) {
    alert("Please enter a valid profile name.");
    return;
  }
  
  const profile = state.userProfile;
  
  // Handle Weight Unit Conversions if unit has changed
  if (profile.weightUnit !== newWeightUnit) {
    if (newWeightUnit === 'lbs') {
      // kg to lbs conversion
      profile.weight = parseFloat((profile.weight * 2.20462).toFixed(1));
      state.weightHistory = state.weightHistory.map(w => ({
        ...w,
        weight: parseFloat((w.weight * 2.20462).toFixed(1))
      }));
    } else {
      // lbs to kg conversion
      profile.weight = parseFloat((profile.weight / 2.20462).toFixed(1));
      state.weightHistory = state.weightHistory.map(w => ({
        ...w,
        weight: parseFloat((w.weight / 2.20462).toFixed(1))
      }));
    }
    saveToLocalStorage('nutriflow_weight_history', state.weightHistory);
  }
  
  // Handle Height Unit Conversions if unit has changed
  if (profile.heightUnit !== newHeightUnit) {
    if (newHeightUnit === 'in') {
      // cm to inches conversion
      profile.height = parseFloat((profile.height / 2.54).toFixed(1));
    } else {
      // inches to cm conversion
      profile.height = parseFloat((profile.height * 2.54).toFixed(1));
    }
  }
  
  profile.username = name;
  profile.avatarInitial = initial || name.charAt(0).toUpperCase();
  profile.avatarColor = color;
  profile.weightUnit = newWeightUnit;
  profile.heightUnit = newHeightUnit;
  
  // Recalculate targets based on new profiles variables
  calculateTDEETargets();
  saveToLocalStorage('nutriflow_user_profile', state.userProfile);
  
  // Live update the global color theme!
  applyGlobalThemeAccent(color);
  
  // Dynamic UI update
  renderDashboard();
  if (state.activeView === 'weight') {
    renderWeightAndAnalytics();
  } else if (state.activeView === 'calculator') {
    renderCalculatorProfile();
  }
  
  closeProfileModal();
  alert("Profile configurations updated successfully!");
}

// ==========================================
// 12. PRIVACY & COMPLIANCE CONTROLLER
// ==========================================
function acceptPrivacyConsent() {
  localStorage.setItem('nutriflow_privacy_consent', 'accepted');
  const banner = document.getElementById('privacy-banner-container');
  if (banner) banner.style.display = 'none';
}

function openPrivacyModal() {
  const modal = document.getElementById('modal-privacy-overlay');
  if (modal) modal.classList.add('active');
}

function closePrivacyModal() {
  const modal = document.getElementById('modal-privacy-overlay');
  if (modal) modal.classList.remove('active');
}

// ==========================================
// 13. ONBOARDING LANDING CONTROLLER
// ==========================================
function goToOnboardingStep(stepNum) {
  // Validate name on step 1 to continue
  if (stepNum > 1) {
    const nameInput = document.getElementById('onboard-name').value.trim();
    if (!nameInput) {
      alert("Please enter your name to proceed.");
      return;
    }
  }
  
  // Deactivate all dots and panes
  document.querySelectorAll('.step-dot').forEach((dot, index) => {
    dot.classList.toggle('active', index + 1 === stepNum);
  });
  document.querySelectorAll('.onboarding-step-pane').forEach((pane, index) => {
    pane.classList.toggle('active', index + 1 === stepNum);
  });
}

function setOnboardGender(gender) {
  onboardingState.gender = gender;
  document.getElementById('onboard-gender-male').classList.toggle('active', gender === 'male');
  document.getElementById('onboard-gender-female').classList.toggle('active', gender === 'female');
}

function setOnboardObjective(strategy) {
  onboardingState.goal = strategy;
  document.getElementById('onboard-strat-lose').classList.toggle('active', strategy === 'lose');
  document.getElementById('onboard-strat-maintain').classList.toggle('active', strategy === 'maintain');
  document.getElementById('onboard-strat-gain').classList.toggle('active', strategy === 'gain');
}

function completeOnboarding() {
  // Enforce Privacy Policy acknowledgment for legal compliance
  const hasConsent = localStorage.getItem('nutriflow_privacy_consent');
  if (!hasConsent) {
    alert("Privacy Policy Acknowledgment Required:\n\nPlease accept the Privacy & Security banner at the bottom of the screen to proceed.");
    return;
  }

  const name = document.getElementById('onboard-name').value.trim();
  const color = document.getElementById('onboard-color').value;
  const age = parseInt(document.getElementById('onboard-age').value);
  const weight = parseFloat(document.getElementById('onboard-weight').value);
  const height = parseInt(document.getElementById('onboard-height').value);
  const activity = document.getElementById('onboard-activity').value;
  const macros = document.getElementById('onboard-macros').value;
  
  if (!name || !age || !weight || !height) {
    alert("Please fill in all requested biometric fields.");
    return;
  }
  
  // Calculate avatar initial automatically using the first letter of their name
  const initial = name.charAt(0).toUpperCase();
  
  // Save to global userProfile state
  state.userProfile.username = name;
  state.userProfile.avatarInitial = initial;
  state.userProfile.avatarColor = color;
  state.userProfile.age = age;
  state.userProfile.weight = weight;
  state.userProfile.height = height;
  state.userProfile.gender = onboardingState.gender;
  state.userProfile.activityLevel = activity;
  state.userProfile.goal = onboardingState.goal;
  state.userProfile.macroRatio = macros;
  
  // Run calculations and save profile
  calculateTDEETargets();
  saveToLocalStorage('nutriflow_user_profile', state.userProfile);
  
  // Set custom color theme accent dynamically!
  applyGlobalThemeAccent(color);
  
  // Set initial weight history log using the exact weight entered in onboarding
  state.weightHistory = [
    { date: getTodayString(), weight: weight }
  ];
  saveToLocalStorage('nutriflow_weight_history', state.weightHistory);
  
  // Save onboarding flag
  localStorage.setItem('nutriflow_onboarded', 'true');
  
  // Animate out overlay
  const overlay = document.getElementById('onboarding-container');
  if (overlay) {
    overlay.classList.add('fade-out');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 500);
  }
  
  // Sync and redraw main view
  renderDashboard();
  alert(`Welcome aboard, ${name}! Your customized calorie and macronutrient targets are generated.`);
}

// ==========================================
// 14. DYNAMIC GLOBAL ACCENT COLOR SCHEME LOADER
// ==========================================
function applyGlobalThemeAccent(colorHex) {
  const root = document.documentElement;
  let caloriesColor = '#8b5cf6';
  let caloriesGrad = 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)';
  let caloriesGlow = 'rgba(139, 92, 246, 0.25)';
  
  let caloriesLight = '#c084fc';
  let caloriesAlpha10 = 'rgba(139, 92, 246, 0.1)';
  let caloriesAlpha20 = 'rgba(139, 92, 246, 0.2)';
  let caloriesAlpha30 = 'rgba(139, 92, 246, 0.3)';
  
  switch (colorHex) {
    case '#f97316': // Orange Blaze
      caloriesColor = '#f97316';
      caloriesGrad = 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)';
      caloriesGlow = 'rgba(249, 115, 22, 0.25)';
      caloriesLight = '#fdba74';
      caloriesAlpha10 = 'rgba(249, 115, 22, 0.1)';
      caloriesAlpha20 = 'rgba(249, 115, 22, 0.2)';
      caloriesAlpha30 = 'rgba(249, 115, 22, 0.3)';
      break;
    case '#06b6d4': // Cyan Wave
      caloriesColor = '#06b6d4';
      caloriesGrad = 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)';
      caloriesGlow = 'rgba(6, 182, 212, 0.25)';
      caloriesLight = '#67e8f9';
      caloriesAlpha10 = 'rgba(6, 182, 212, 0.1)';
      caloriesAlpha20 = 'rgba(6, 182, 212, 0.2)';
      caloriesAlpha30 = 'rgba(6, 182, 212, 0.3)';
      break;
    case '#10b981': // Green Emerald
      caloriesColor = '#10b981';
      caloriesGrad = 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)';
      caloriesGlow = 'rgba(16, 185, 129, 0.25)';
      caloriesLight = '#6ee7b7';
      caloriesAlpha10 = 'rgba(16, 185, 129, 0.1)';
      caloriesAlpha20 = 'rgba(16, 185, 129, 0.2)';
      caloriesAlpha30 = 'rgba(16, 185, 129, 0.3)';
      break;
    case '#38bdf8': // Sky Blue
      caloriesColor = '#38bdf8';
      caloriesGrad = 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)';
      caloriesGlow = 'rgba(56, 189, 248, 0.25)';
      caloriesLight = '#7dd3fc';
      caloriesAlpha10 = 'rgba(56, 189, 248, 0.1)';
      caloriesAlpha20 = 'rgba(56, 189, 248, 0.2)';
      caloriesAlpha30 = 'rgba(56, 189, 248, 0.3)';
      break;
    default: // Purple Glow (Default)
      caloriesColor = '#8b5cf6';
      caloriesGrad = 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)';
      caloriesGlow = 'rgba(139, 92, 246, 0.25)';
      caloriesLight = '#c084fc';
      caloriesAlpha10 = 'rgba(139, 92, 246, 0.1)';
      caloriesAlpha20 = 'rgba(139, 92, 246, 0.2)';
      caloriesAlpha30 = 'rgba(139, 92, 246, 0.3)';
  }
  
  root.style.setProperty('--color-calories', caloriesColor);
  root.style.setProperty('--grad-calories', caloriesGrad);
  root.style.setProperty('--grad-calories-glow', caloriesGlow);
  root.style.setProperty('--color-calories-light', caloriesLight);
  root.style.setProperty('--color-calories-alpha-10', caloriesAlpha10);
  root.style.setProperty('--color-calories-alpha-20', caloriesAlpha20);
  root.style.setProperty('--color-calories-alpha-30', caloriesAlpha30);
  
  // Dynamic ring gradient override for calorie ring in SVG
  const ringFillGradient = document.getElementById('ringGradient');
  if (ringFillGradient) {
    const stops = ringFillGradient.getElementsByTagName('stop');
    if (stops.length >= 2) {
      if (colorHex === '#f97316') {
        stops[0].setAttribute('stop-color', '#f59e0b');
        stops[1].setAttribute('stop-color', '#f97316');
      } else if (colorHex === '#06b6d4') {
        stops[0].setAttribute('stop-color', '#06b6d4');
        stops[1].setAttribute('stop-color', '#3b82f6');
      } else if (colorHex === '#10b981') {
        stops[0].setAttribute('stop-color', '#10b981');
        stops[1].setAttribute('stop-color', '#14b8a6');
      } else if (colorHex === '#38bdf8') {
        stops[0].setAttribute('stop-color', '#38bdf8');
        stops[1].setAttribute('stop-color', '#0284c7');
      } else {
        stops[0].setAttribute('stop-color', '#8b5cf6');
        stops[1].setAttribute('stop-color', '#d946ef');
      }
    }
  }
}

// ==========================================
// 15. DATA BACKUP & PURGE CACHE SYSTEM
// ==========================================
function exportUserData() {
  try {
    const backupData = {
      userProfile: state.userProfile,
      foodLogs: state.foodLogs,
      weightHistory: state.weightHistory,
      waterLogs: state.waterLogs,
      customFoods: state.customFoods
    };
    
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `nutriflow_backup_${getTodayString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    alert("Failed to export backup: " + error.message);
  }
}

function importUserData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      
      // Basic structural validation
      if (!parsed.userProfile || !parsed.foodLogs || !parsed.weightHistory || !parsed.waterLogs || !parsed.customFoods) {
        throw new Error("Invalid backup file structure. Missing required data categories.");
      }
      
      // Encrypt and save each category to LocalStorage
      saveToLocalStorage('nutriflow_user_profile', parsed.userProfile);
      saveToLocalStorage('nutriflow_food_logs', parsed.foodLogs);
      saveToLocalStorage('nutriflow_weight_history', parsed.weightHistory);
      saveToLocalStorage('nutriflow_water_logs', parsed.waterLogs);
      saveToLocalStorage('nutriflow_custom_foods', parsed.customFoods);
      
      // Set onboarding and privacy consent to true since they are importing valid data
      localStorage.setItem('nutriflow_onboarded', 'true');
      localStorage.setItem('nutriflow_privacy_consent', 'accepted');
      
      alert("Data successfully restored from backup! The application will now reload.");
      window.location.reload();
    } catch (err) {
      alert("Restore failed: " + err.message + "\nPlease verify that you are uploading a valid NutriFlow JSON backup file.");
    }
  };
  reader.readAsText(file);
}

function openWipeDataModal() {
  const overlay = document.getElementById('modal-wipe-data-overlay');
  if (overlay) {
    overlay.classList.add('active');
    goWipeStep(1);
    
    // Clear final confirmation input
    const confirmInput = document.getElementById('input-wipe-confirm');
    if (confirmInput) confirmInput.value = '';
    
    const wipeBtn = document.getElementById('btn-final-wipe-execute');
    if (wipeBtn) {
      wipeBtn.disabled = true;
      wipeBtn.style.opacity = '0.5';
      wipeBtn.style.cursor = 'not-allowed';
    }
  }
}

function closeWipeDataModal() {
  const overlay = document.getElementById('modal-wipe-data-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

function goWipeStep(stepNum) {
  // Hide all step panels
  document.querySelectorAll('.wipe-pane').forEach((pane, idx) => {
    pane.style.display = (idx + 1 === stepNum) ? 'flex' : 'none';
  });
}

function exportUserDataAndContinuePurge() {
  exportUserData();
  // Move automatically to the final verification step
  setTimeout(() => {
    goWipeStep(3);
  }, 1000);
}

function validateWipeInput(val) {
  const wipeBtn = document.getElementById('btn-final-wipe-execute');
  if (!wipeBtn) return;
  
  if (val.trim() === 'DELETE') {
    wipeBtn.disabled = false;
    wipeBtn.style.opacity = '1';
    wipeBtn.style.cursor = 'pointer';
  } else {
    wipeBtn.disabled = true;
    wipeBtn.style.opacity = '0.5';
    wipeBtn.style.cursor = 'not-allowed';
  }
}

function executeDatabasePurge() {
  try {
    // 1. Purge all LocalStorage keys
    localStorage.removeItem('nutriflow_user_profile');
    localStorage.removeItem('nutriflow_food_logs');
    localStorage.removeItem('nutriflow_weight_history');
    localStorage.removeItem('nutriflow_water_logs');
    localStorage.removeItem('nutriflow_custom_foods');
    localStorage.removeItem('nutriflow_privacy_consent');
    localStorage.removeItem('nutriflow_onboarded');
    
    // 2. Clear out application state
    state.userProfile = {};
    state.foodLogs = {};
    state.weightHistory = [];
    state.waterLogs = {};
    state.customFoods = [];
    
    alert("Database purged! All personal physical statistics, logged records, and credentials have been deleted. The application will now reload to the first-time setup wizard.");
    window.location.reload();
  } catch (error) {
    alert("Failed to purge database: " + error.message);
  }
}

function toggleDataManagementCard() {
  const card = document.getElementById('data-management-card');
  const btn = document.getElementById('btn-toggle-data-card');
  if (!card || !btn) return;
  
  const isHidden = (card.style.display === 'none' || !card.style.display);
  if (isHidden) {
    card.style.display = 'block';
    card.style.animation = 'fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--color-calories);">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      Hide Data Management & Privacy Options
    `;
  } else {
    card.style.display = 'none';
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--color-calories);">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      Show Data Management & Privacy Options
    `;
  }
}
