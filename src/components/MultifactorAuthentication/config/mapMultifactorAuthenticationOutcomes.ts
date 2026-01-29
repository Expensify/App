import StringUtils from '@libs/StringUtils';
import type {
    MultifactorAuthenticationOutcomeMap,
    MultifactorAuthenticationOutcomeOptions,
    MultifactorAuthenticationOutcomeRecord,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioConfigRecord,
} from './types';

/**
 * This utility module provides functions to map multifactor authentication scenario configurations
 * to an outcome map with kebab-case keys.
 *
 * This allows outcome pages to reference the config based on its OutcomeType in url.
 *
 * e.g.
 *
 * {
 *     "BIOMETRICS-TEST": {
 *         // ...
 *         OUTCOMES: {
 *             success: {
 *                 title: "...",
 *                 // ...
 *             },
 *             failure: {
 *                title: "...",
 *                 // ...
 *             },
 *             // ...
 *         }
 *     },
 *     "AUTHORIZE-TRANSACTION": {
 *       // ...
 *     }
 * }
 *
 * is mapped to:
 *
 * {
 *     "biometrics-test-success": {
 *         title: "...",
 *         // ...
 *     },
 *     "biometrics-test-failure": {
 *         title: "...",
 *         // ...
 *     },
 *     "authorize-transaction-success": {
 *         // ...
 *     }
 *     // ...
 * }
 */

/**
 * Creates an outcome record from multifactor authentication scenario configuration.
 * For details refer to the example above.
 */
const createOutcomeRecord = (mfaConfig: MultifactorAuthenticationScenarioConfigRecord): MultifactorAuthenticationOutcomeRecord => {
    const entries = Object.entries({...mfaConfig});
    return entries.reduce((record, [key, {OUTCOMES}]) => {
        // eslint-disable-next-line no-param-reassign
        record[key as MultifactorAuthenticationScenario] = {...OUTCOMES};
        return record;
    }, {} as MultifactorAuthenticationOutcomeRecord);
};

/**
 * Creates an outcome key by combining scenario and outcome name in kebab-case format.
 * e.g. a scenario key of "BIOMETRICS-TEST" and outcome name of "success" will produce "biometrics-test-success".
 */
const createOutcomeKey = (key: string, name: string) => {
    const scenarioKebabCase = StringUtils.toLowerCase(key as MultifactorAuthenticationScenario);
    const outcomeName = StringUtils.camelToKebabCase(name as MultifactorAuthenticationOutcomeOptions);

    return `${scenarioKebabCase}-${outcomeName}` as const;
};

/**
 * Maps multifactor authentication scenario configuration to an outcome map with kebab-case keys.
 */
const mapMultifactorAuthenticationOutcomes = (mfaConfig: MultifactorAuthenticationScenarioConfigRecord) => {
    const recordEntries = Object.entries(createOutcomeRecord({...mfaConfig}));

    const outcomes: Partial<MultifactorAuthenticationOutcomeMap> = {};

    for (const [key, config] of recordEntries) {
        for (const [name, ui] of Object.entries(config)) {
            outcomes[createOutcomeKey(key, name)] = {...ui};
        }
    }

    return outcomes as MultifactorAuthenticationOutcomeMap;
};

export default mapMultifactorAuthenticationOutcomes;
