import type {OutcomePaths} from '@libs/MultifactorAuthentication/Biometrics/types';
import type {AllMultifactorAuthenticationOutcomeType, MultifactorAuthenticationOutcomeSuffixes, MultifactorAuthenticationScenario} from './types';

/**
 * Constructs an outcome type string from scenario prefix and outcome suffix.
 * Combines the lowercase scenario name with the kebab-cased suffix (e.g., 'biometrics-test-success').
 * @param scenarioPrefix - The lowercase scenario name or undefined to use default 'biometrics-test'.
 * @param suffix - The outcome suffix (success/failure).
 * @returns A fully qualified outcome type string.
 */
const getOutcomePath = <T extends MultifactorAuthenticationScenario>(
    scenarioPrefix: Lowercase<T> | undefined,
    suffix: MultifactorAuthenticationOutcomeSuffixes<T>,
): AllMultifactorAuthenticationOutcomeType => {
    return `${scenarioPrefix ?? 'biometrics-test'}-${suffix}` as AllMultifactorAuthenticationOutcomeType;
};

/**
 * Generates success and failure outcome paths for a given scenario.
 * Handles undefined scenarios by using default 'biometrics-test' prefix.
 * @param scenario - The authentication scenario or undefined for defaults.
 * @returns An object containing successOutcome and failureOutcome paths.
 */
const getOutcomePaths = (scenario: MultifactorAuthenticationScenario | undefined): OutcomePaths => {
    const scenarioPrefix = scenario?.toLowerCase() as Lowercase<MultifactorAuthenticationScenario> | undefined;
    const successOutcome = getOutcomePath(scenarioPrefix, 'success');
    const failureOutcome = getOutcomePath(scenarioPrefix, 'failure');

    return {
        successOutcome,
        failureOutcome,
    };
};

export {getOutcomePath, getOutcomePaths};
