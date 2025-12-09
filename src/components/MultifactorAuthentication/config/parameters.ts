/**
 * This module defines the available multifactorial authentication scenarios and their parameters.
 * It maps each scenario type to its corresponding implementation method and any post-processing logic.
 * The scenarios include setting up multifactorial authentication and authorizing transactions with different authentication flows.
 */
import type {MultifactorAuthenticationScenarioMap} from '@libs/MultifactorAuthentication/Biometrics/types';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import {authorizeTransaction} from '@userActions/MultifactorAuthentication';
import ROUTES from '@src/ROUTES';
import SCENARIO from './scenarios';

/**
 * Defines the required parameters for each multifactorial authentication scenario type.
 * Each scenario requires specific parameters:
 * - Regular transaction authorization needs a transaction ID
 * - Authorization with validation code needs a transaction ID
 * - Multifactor authentication setup needs a public key
 */
type MultifactorAuthenticationScenarioParameters = {
    [SCENARIO.AUTHORIZE_TRANSACTION]: {
        transactionID: string;
    };
};

/**
 * Maps each multifactorial authentication scenario to its implementation details.
 */
const MULTIFACTOR_AUTHENTICATION_SCENARIOS = {
    [SCENARIO.AUTHORIZE_TRANSACTION]: {
        allowedAuthentication: VALUES.TYPE.BIOMETRICS,
        action: authorizeTransaction,
        route: ROUTES.MULTIFACTOR_AUTHENTICATION_APPROVE_TRANSACTION.route,
    },
} as const satisfies MultifactorAuthenticationScenarioMap;

export default MULTIFACTOR_AUTHENTICATION_SCENARIOS;
export type {MultifactorAuthenticationScenarioParameters};
