import type {KebabCase} from 'type-fest';
import type {
    MultifactorAuthenticationNotificationMap,
    MultifactorAuthenticationNotificationOptions,
    MultifactorAuthenticationNotificationRecord,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioConfigRecord,
} from './types';

/**
 * Converts a string to lowercase.
 */
function toLowerCase<T extends string>(str: T) {
    return str.toLowerCase() as Lowercase<T>;
}

/**
 * Converts camelCase string to kebab-case format.
 */
function camelToKebabCase<T extends string>(str: T) {
    return str.replaceAll(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() as KebabCase<T>;
}

/**
 * Creates a notification record from multifactor authentication scenario configuration.
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
 */
const createNotificationKey = (key: string, name: string) => {
    const scenarioKebabCase = toLowerCase(key as MultifactorAuthenticationScenario);
    const notificationName = camelToKebabCase(name as MultifactorAuthenticationNotificationOptions);

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
export {mapMultifactorAuthenticationNotification, toLowerCase};
