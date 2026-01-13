import MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG from '@components/MultifactorAuthentication/config/scenarios';
import type {MultifactorAuthenticationScenarioConfigRecord} from '@components/MultifactorAuthentication/config/types';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

describe('MultifactorAuthentication Scenarios Config', () => {
    /**
     * Verifies that every scenario config has all required properties via customConfig
     */
    it('should have all required properties for every scenario config', () => {
        const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG as MultifactorAuthenticationScenarioConfigRecord;

        for (const scenarioConfig of Object.values(config)) {
            // Verify MODALS exists and has cancelConfirmation
            expect(scenarioConfig).toHaveProperty('MODALS');
            expect(scenarioConfig.MODALS).toHaveProperty('cancelConfirmation');

            const cancelConfirmation = scenarioConfig.MODALS.cancelConfirmation;
            expect(cancelConfirmation).toHaveProperty('title');
            expect(cancelConfirmation).toHaveProperty('description');
            expect(cancelConfirmation).toHaveProperty('confirmButtonText');
            expect(cancelConfirmation).toHaveProperty('cancelButtonText');

            // Verify NOTIFICATIONS exists and has all required notification types
            expect(scenarioConfig).toHaveProperty('NOTIFICATIONS');
            expect(scenarioConfig.NOTIFICATIONS).toHaveProperty('success');
            expect(scenarioConfig.NOTIFICATIONS).toHaveProperty('failure');
            expect(scenarioConfig.NOTIFICATIONS).toHaveProperty('outOfTime');
            expect(scenarioConfig.NOTIFICATIONS).toHaveProperty('noEligibleMethods');
        }
    });

    /**
     * Verifies that each notification in every scenario has all required properties
     */
    it('should have all required notification properties for each notification type', () => {
        const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG as MultifactorAuthenticationScenarioConfigRecord;

        const requiredNotificationProps = ['illustration', 'iconWidth', 'iconHeight', 'padding', 'headerTitle', 'title', 'description'];

        for (const scenarioConfig of Object.values(config)) {
            for (const notification of Object.values(scenarioConfig.NOTIFICATIONS)) {
                for (const prop of requiredNotificationProps) {
                    expect(notification).toHaveProperty(prop);
                }
            }
        }
    });

    /**
     * Verifies that every scenario config has required action-related properties
     */
    it('should have all required action properties for each scenario', () => {
        const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG as MultifactorAuthenticationScenarioConfigRecord;

        for (const scenarioConfig of Object.values(config)) {
            expect(scenarioConfig).toHaveProperty('action');
            expect(scenarioConfig).toHaveProperty('allowedAuthentication');
            expect(scenarioConfig).toHaveProperty('screen');
            expect(scenarioConfig).toHaveProperty('nativePromptTitle');
        }
    });

    /**
     * Verifies that BIOMETRICS_TEST scenario config is properly configured
     */
    it('should have BIOMETRICS_TEST scenario properly configured', () => {
        const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG as MultifactorAuthenticationScenarioConfigRecord;
        const biometricsTestScenario = config[CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST];

        expect(biometricsTestScenario).toBeDefined();
        expect(biometricsTestScenario.allowedAuthentication).toBe(CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS);
        expect(biometricsTestScenario.screen).toBe(SCREENS.MULTIFACTOR_AUTHENTICATION.BIOMETRICS_TEST);
        expect(biometricsTestScenario.pure).toBe(true);
        expect(biometricsTestScenario.action).toBeDefined();
    });

    /**
     * Verifies that the customConfig properly merges defaults with custom overrides
     */
    it('should properly merge default and custom notification configurations', () => {
        const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG as MultifactorAuthenticationScenarioConfigRecord;
        const biometricsTestConfig = config[CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST];

        // Verify that custom success headerTitle is applied
        expect(biometricsTestConfig.NOTIFICATIONS.success.headerTitle).toBe('multifactorAuthentication.biometricsTest.biometricsTest');

        // Verify that default illustration is preserved
        expect(biometricsTestConfig.NOTIFICATIONS.success).toHaveProperty('illustration');

        // Verify that other notifications still have defaults
        expect(biometricsTestConfig.NOTIFICATIONS.failure.illustration).toBe('HumptyDumpty');
        expect(biometricsTestConfig.NOTIFICATIONS.outOfTime.illustration).toBe('RunOutOfTime');
    });
});
