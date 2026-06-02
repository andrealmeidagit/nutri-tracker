import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { vi } from 'vitest';

const htmlPath = path.resolve(__dirname, '../../index.html');
const foodsPath = path.resolve(__dirname, '../../foods.js');
const appPath = path.resolve(__dirname, '../../app.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const foodsContent = fs.readFileSync(foodsPath, 'utf8') + "\nwindow.FOOD_DATABASE = FOOD_DATABASE;\n";
const appContent = fs.readFileSync(appPath, 'utf8') + "\nwindow.state = state;\nwindow.onboardingState = onboardingState;\n";

export function setupTestEnvironment() {
  const virtualConsole = new VirtualConsole();
  virtualConsole.sendTo(console);

  // Create JSDOM instance
  const dom = new JSDOM(htmlContent, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    virtualConsole
  });
  
  const domWindow = dom.window;
  
  // Set up mocked localStorage
  let localStorageStore = {};
  domWindow.localStorage = {
    getItem: vi.fn(key => localStorageStore[key] || null),
    setItem: vi.fn((key, value) => {
      localStorageStore[key] = String(value);
    }),
    removeItem: vi.fn(key => {
      delete localStorageStore[key];
    }),
    clear: vi.fn(() => {
      localStorageStore = {};
    }),
    _getStore: () => localStorageStore,
    _setStore: (newStore) => { localStorageStore = newStore; }
  };

  // Mock global alert
  domWindow.alert = vi.fn();
  
  // Mock external CDN dependencies loaded in HTML: Chart.js
  domWindow.Chart = class MockChart {
    constructor(ctx, config) {
      this.ctx = ctx;
      this.config = config;
    }
    destroy = vi.fn();
  };

  // Mock HTML5 Canvas API in JSDOM (returns a mock 2D context to avoid linear gradient uncaught timer errors)
  domWindow.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    })),
    fillRect: vi.fn(),
    drawImage: vi.fn()
  }));

  // Bind JSDOM globals to the Node environment context so code can run/assert globally
  global.window = domWindow;
  global.document = domWindow.document;
  global.localStorage = domWindow.localStorage;
  global.alert = domWindow.alert;
  global.Chart = domWindow.Chart;

  // Execute foods.js and app.js synchronously in JSDOM's global context using eval
  try {
    domWindow.eval(foodsContent);
    domWindow.eval(appContent);
  } catch (e) {
    console.error("Error executing scripts in JSDOM:", e);
  }

  // Helper to trigger life cycle events
  const dispatchDOMContentLoaded = () => {
    const event = new domWindow.Event('DOMContentLoaded');
    domWindow.dispatchEvent(event);
  };

  return {
    dom,
    window: domWindow,
    document: domWindow.document,
    dispatchDOMContentLoaded,
    getStore: () => localStorageStore,
    setStore: (newStore) => { localStorageStore = newStore; }
  };
}
