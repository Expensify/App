import type {
    MultifactorAuthenticationNotificationMap,
    MultifactorAuthenticationNotificationOptions,
    MultifactorAuthenticationNotificationRecord,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioConfigRecord,
} from './types';

function toLowerCase<T extends string>(str: T) {
    return str.toLowerCase() as Lowercase<T>;
}

const createNotificationRecord = (mfaConfig: MultifactorAuthenticationScenarioConfigRecord): MultifactorAuthenticationNotificationRecord => {
    const entries = Object.entries({...mfaConfig});
    return entries.reduce((record, [key, {NOTIFICATIONS}]) => {
        // eslint-disable-next-line no-param-reassign
        record[key as MultifactorAuthenticationScenario] = {...NOTIFICATIONS};
        return record;
    }, {} as MultifactorAuthenticationNotificationRecord);
};

const createNotificationKey = (key: string, name: string) => {
    const scenarioSnakeCase = toLowerCase(key as MultifactorAuthenticationScenario);
    const notificationName = toLowerCase(name as MultifactorAuthenticationNotificationOptions);

    return `${scenarioSnakeCase}-${notificationName}` as const;
};

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
