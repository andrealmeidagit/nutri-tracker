import { describe, it, expect, beforeEach } from 'vitest';
import { setupTestEnvironment } from './helpers/test-setup';

describe('NutriFlow - Onboarding flow & Legal Consent', () => {
  let env;

  beforeEach(() => {
    env = setupTestEnvironment();
    env.dispatchDOMContentLoaded();
  });

  describe('Step Transitions & Validations', () => {
    it('restricts proceeding to step 2 if the name field is empty, triggering an alert', () => {
      // 1. Arrange: clear name input
      env.document.getElementById('onboard-name').value = '';

      // 2. Act: Try to transition to step 2
      env.window.goToOnboardingStep(2);

      // 3. Assert: alert must be called, step dot 1 remains active
      expect(env.window.alert).toHaveBeenCalledWith("Please enter your name to proceed.");
      expect(env.document.getElementById('dot-step-1').classList.contains('active')).toBe(true);
      expect(env.document.getElementById('dot-step-2').classList.contains('active')).toBe(false);
    });

    it('navigates to step 2 successfully when a name is provided', () => {
      // Arrange
      env.document.getElementById('onboard-name').value = 'Chris Runner';

      // Act: Transition to step 2
      env.window.goToOnboardingStep(2);

      // Assert: Pane 2 and Dot 2 must be active
      expect(env.document.getElementById('dot-step-2').classList.contains('active')).toBe(true);
      expect(env.document.getElementById('dot-step-1').classList.contains('active')).toBe(false);
      expect(env.document.getElementById('pane-step-2').classList.contains('active')).toBe(true);
    });
  });

  describe('GDPR Offline Privacy Compliance Block', () => {
    it('prevents completing onboarding if the privacy banner has NOT been accepted, triggering an alert', () => {
      // 1. Arrange: seed onboarding inputs
      env.document.getElementById('onboard-name').value = 'Chris Runner';
      env.document.getElementById('onboard-age').value = '25';
      env.document.getElementById('onboard-weight').value = '75.0';
      env.document.getElementById('onboard-height').value = '175';
      env.document.getElementById('onboard-activity').value = 'moderate';
      env.document.getElementById('onboard-macros').value = 'balanced';

      // Seed local storage with NO consent
      env.window.localStorage.removeItem('nutriflow_privacy_consent');

      // 2. Act: Try to complete
      env.window.completeOnboarding();

      // 3. Assert: Verify rejection alert is called and onboarded flag is not set
      expect(env.window.alert).toHaveBeenCalledWith(expect.stringContaining("Privacy Policy Acknowledgment Required"));
      expect(env.window.localStorage.getItem('nutriflow_onboarded')).toBeNull();
    });

    it('completes onboarding, saves biometrics, generates targets, and extracts avatar initial after privacy consent is accepted', () => {
      // 1. Arrange: seed inputs
      env.document.getElementById('onboard-name').value = 'Chris Runner';
      env.document.getElementById('onboard-age').value = '25';
      env.document.getElementById('onboard-weight').value = '75.0';
      env.document.getElementById('onboard-height').value = '175';
      env.document.getElementById('onboard-activity').value = 'moderate';
      env.document.getElementById('onboard-macros').value = 'balanced';

      // Accept Privacy Consent beforehand
      env.window.localStorage.setItem('nutriflow_privacy_consent', 'accepted');

      // 2. Act: Complete onboarding
      env.window.completeOnboarding();

      // 3. Assert: Profile state must be successfully updated
      const profile = env.window.state.userProfile;
      expect(profile.username).toBe('Chris Runner');
      expect(profile.avatarInitial).toBe('C'); // Extracted from first letter
      expect(profile.age).toBe(25);
      expect(profile.weight).toBe(75.0);
      expect(profile.height).toBe(175);
      
      // Onboarding flags should be set
      expect(env.window.localStorage.getItem('nutriflow_onboarded')).toBe('true');
      
      // Initial weight entry must be populated in history
      expect(env.window.state.weightHistory.length).toBe(1);
      expect(env.window.state.weightHistory[0].weight).toBe(75.0);
    });
  });
});
