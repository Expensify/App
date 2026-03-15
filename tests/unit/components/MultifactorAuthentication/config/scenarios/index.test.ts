import MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG from '@components/MultifactorAuthentication/config/scenarios';
import type {MultifactorAuthenticationScenarioConfigRecord} from '@components/MultifactorAuthentication/config/types';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

describe('MultifactorAuthentication Scenarios Config', () => {
    it('should have all required properties for every scenario config', () => {
        const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG as MultifactorAuthenticationScenarioConfigRecord;

        for (const scenarioConfig of Object.values(config)) {
            expect(scenarioConfig).toHaveProperty('modals');
            expect(scenarioConfig.modals).toHaveProperty('cancelConfirmation');

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
        const callbackResult = await biometricsTestConfig.callback?.(
            true,
            {
                httpStatusCode: 200,
                message: CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.AUTHORIZATION_SUCCESSFUL,
                body: {},
            },
            undefined,
        );

        // Verify that the callback returns SHOW_OUTCOME_SCREEN, indicating
        // the MFA flow should navigate to the outcome screen
        expect(callbackResult).toBe(CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN);
    });

    /**
     * Tests for the SET_PIN_ORDER_CARD scenario used when UK/EU cardholders set their PIN.
     */
    describe('SET_PIN_ORDER_CARD scenario', () => {
        // Complete payload for SET_PIN_ORDER_CARD scenario tests
        const validPayload = {
            legalFirstName: 'John',
            legalLastName: 'Doe',
            phoneNumber: '+441234567890',
            addressCity: 'London',
            addressStreet: '123 Test Street',
            addressStreet2: '',
            addressZip: 'SW1A 1AA',
            addressCountry: 'GB',
            addressState: '',
            dob: '1990-01-15',
            pin: '5739',
            cardID: '12345',
        };

        it('should have SET_PIN_ORDER_CARD scenario properly configured', () => {
            const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG as MultifactorAuthenticationScenarioConfigRecord;
            const setPinScenario = config[CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.SET_PIN_ORDER_CARD];

            expect(setPinScenario).toBeDefined();
            expect(setPinScenario.allowedAuthenticationMethods).toStrictEqual([CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS]);
            expect(setPinScenario.action).toBeDefined();
            expect(setPinScenario.callback).toBeDefined();
            expect(typeof setPinScenario.callback).toBe('function');
        });

        it('should have proper failure screens configured', () => {
            const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG as MultifactorAuthenticationScenarioConfigRecord;
            const setPinScenario = config[CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.SET_PIN_ORDER_CARD];

            expect(setPinScenario.defaultClientFailureScreen).toBeDefined();
            expect(setPinScenario.defaultServerFailureScreen).toBeDefined();
            expect(setPinScenario.failureScreens).toHaveProperty(CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ELIGIBLE_METHODS);
            expect(setPinScenario.failureScreens).toHaveProperty(CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.UNSUPPORTED_DEVICE);
        });

        it('should return SHOW_OUTCOME_SCREEN on authentication failure', async () => {
            const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG as MultifactorAuthenticationScenarioConfigRecord;
            const setPinScenario = config[CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.SET_PIN_ORDER_CARD];

            // When authentication fails, callback should return SHOW_OUTCOME_SCREEN
            const callbackResult = await setPinScenario.callback?.(
                false,
                {
                    httpStatusCode: 401,
                    message: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.UNHANDLED_ERROR,
                    body: {},
                },
                validPayload,
            );

            expect(callbackResult).toBe(CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN);
        });

        it('should return SHOW_OUTCOME_SCREEN when payload is undefined', async () => {
            const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG as MultifactorAuthenticationScenarioConfigRecord;
            const setPinScenario = config[CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.SET_PIN_ORDER_CARD];

            const callbackResult = await setPinScenario.callback?.(
                true,
                {
                    httpStatusCode: 200,
                    message: CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.AUTHORIZATION_SUCCESSFUL,
                    body: {},
                },
                undefined,
            );

            expect(callbackResult).toBe(CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN);
        });
    });
});
