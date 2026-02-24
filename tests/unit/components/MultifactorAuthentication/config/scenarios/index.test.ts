import MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG from '@components/MultifactorAuthentication/config/scenarios';
import type {MultifactorAuthenticationScenarioConfigRecord} from '@components/MultifactorAuthentication/config/types';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

describe('MultifactorAuthentication Scenarios Config', () => {
    it('should have all required properties for every scenario config', () => {
        const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG as MultifactorAuthenticationScenarioConfigRecord;

        for (const scenarioConfig of Object.values(config)) {
            expect(scenarioConfig).toHaveProperty('MODALS');
            expect(scenarioConfig.MODALS).toHaveProperty('cancelConfirmation');

            const cancelConfirmation = scenarioConfig.MODALS.cancelConfirmation;
            expect(cancelConfirmation).toHaveProperty('title');
            expect(cancelConfirmation).toHaveProperty('description');
            expect(cancelConfirmation).toHaveProperty('confirmButtonText');
            expect(cancelConfirmation).toHaveProperty('cancelButtonText');

            expect(scenarioConfig).toHaveProperty('successScreen');
            expect(scenarioConfig).toHaveProperty('defaultClientFailureScreen');
            expect(scenarioConfig).toHaveProperty('defaultServerFailureScreen');
        }
    });

    it('should have all required action properties for each scenario', () => {
        const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG as MultifactorAuthenticationScenarioConfigRecord;

        for (const scenarioConfig of Object.values(config)) {
            expect(scenarioConfig).toHaveProperty('action');
            expect(scenarioConfig).toHaveProperty('allowedAuthenticationMethods');
            expect(scenarioConfig).toHaveProperty('screen');
        }
    });

    it('should have BIOMETRICS_TEST scenario properly configured', () => {
        const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG as MultifactorAuthenticationScenarioConfigRecord;
        const biometricsTestScenario = config[CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST];

        expect(biometricsTestScenario).toBeDefined();
        expect(biometricsTestScenario.allowedAuthenticationMethods).toStrictEqual([CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS]);
        expect(biometricsTestScenario.screen).toBe(SCREENS.MULTIFACTOR_AUTHENTICATION.BIOMETRICS_TEST);
        expect(biometricsTestScenario.pure).toBe(true);
        expect(biometricsTestScenario.action).toBeDefined();
    });

    it('should properly merge default and custom failure screen overrides', () => {
        const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG as MultifactorAuthenticationScenarioConfigRecord;
        const biometricsTestConfig = config[CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST];

        expect(biometricsTestConfig.failureScreens).toHaveProperty(CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ELIGIBLE_METHODS);
        expect(biometricsTestConfig.failureScreens).toHaveProperty(CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.UNSUPPORTED_DEVICE);
    });

    /**
     * Verifies that every scenario config includes a callback function.
     */
    it('should have a callback function for every scenario config', () => {
        const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG as MultifactorAuthenticationScenarioConfigRecord;

        for (const scenarioConfig of Object.values(config)) {
            expect(scenarioConfig).toHaveProperty('callback');
            expect(typeof scenarioConfig.callback).toBe('function');
        }
    });

    /**
     * Verifies that the default callback behavior returns SHOW_OUTCOME_SCREEN.
     * When a callback returns SHOW_OUTCOME_SCREEN, the handleCallback function
     * will navigate to the appropriate success or failure outcome screen.
     * This tests the default behavior for scenarios that don't override the callback.
     */
    it('should have default callback that returns SHOW_OUTCOME_SCREEN', async () => {
        const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG as MultifactorAuthenticationScenarioConfigRecord;
        const biometricsTestConfig = config[CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST];

        // Invoke the callback with successful authentication and valid response data
        const callbackResult = await biometricsTestConfig.callback?.(true, {
            httpStatusCode: 200,
            message: CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.AUTHORIZATION_SUCCESSFUL,
            body: {},
        });

        // Verify that the callback returns SHOW_OUTCOME_SCREEN, indicating
        // the MFA flow should navigate to the outcome screen
        expect(callbackResult).toBe(CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN);
    });
});
