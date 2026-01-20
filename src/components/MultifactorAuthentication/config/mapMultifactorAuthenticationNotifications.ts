import StringUtils from '@libs/StringUtils';
import type {
    MultifactorAuthenticationNotificationMap,
    MultifactorAuthenticationNotificationOptions,
    MultifactorAuthenticationNotificationRecord,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioConfigRecord,
} from './types';

/**
 * This utility module provides functions to map multifactor authentication scenario configurations
 * to a notification map with kebab-case keys.
 *
 * This allows notification pages to reference the config based on its NotificationType in url.
 *
 * e.g.
 *
 * {
 *     "BIOMETRICS-TEST": {
 *         // ...
 *         NOTIFICATIONS: {
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
 * Creates a notification record from multifactor authentication scenario configuration.
 * For details refer to the example above.
 */
const createNotificationRecord = (mfaConfig: MultifactorAuthenticationScenarioConfigRecord): MultifactorAuthenticationNotificationRecord => {
    const entries = Object.entries({...mfaConfig});
    return entries.reduce((record, [key, {NOTIFICATIONS}]) => {
        // eslint-disable-next-line no-param-reassign
        record[key as MultifactorAuthenticationScenario] = {...NOTIFICATIONS};
        return record;
    }, {} as MultifactorAuthenticationNotificationRecord);
};

/**
 * Creates a notification key by combining scenario and notification name in kebab-case format.
 * e.g. a scenario key of "BIOMETRICS-TEST" and notification name of "success" will produce "biometrics-test-success".
 */
const createNotificationKey = (key: string, name: string) => {
    const scenarioKebabCase = StringUtils.toLowerCase(key as MultifactorAuthenticationScenario);
    const notificationName = StringUtils.camelToKebabCase(name as MultifactorAuthenticationNotificationOptions);

    return `${scenarioKebabCase}-${notificationName}` as const;
};

/**
 * Maps multifactor authentication scenario configuration to a notification map with kebab-case keys.
 */
const mapMultifactorAuthenticationNotification = (mfaConfig: MultifactorAuthenticationScenarioConfigRecord) => {
    const recordEntries = Object.entries(createNotificationRecord({...mfaConfig}));

    const notifications: Partial<MultifactorAuthenticationNotificationMap> = {};

    for (const [key, config] of recordEntries) {
        for (const [name, ui] of Object.entries(config)) {
            notifications[createNotificationKey(key, name)] = {...ui};
        }
    }

    return notifications as MultifactorAuthenticationNotificationMap;
};

export default mapMultifactorAuthenticationNotification;
