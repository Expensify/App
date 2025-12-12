import type {
    MultifactorAuthenticationNotificationMap,
    MultifactorAuthenticationNotificationMapEntry,
    MultifactorAuthenticationNotificationOptions,
    MultifactorAuthenticationNotificationRecord,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioConfigRecord,
} from './types';

function toLowerCase<T extends string>(str: T) {
    return str.toLowerCase() as Lowercase<T>;
}

const createNotificationRecord = (mfaConfig: MultifactorAuthenticationScenarioConfigRecord): MultifactorAuthenticationNotificationRecord => {
    const entries = Object.entries(mfaConfig);
    return entries.reduce((record, [key, {NOTIFICATIONS}]) => {
        // eslint-disable-next-line no-param-reassign
        record[key as MultifactorAuthenticationScenario] = NOTIFICATIONS;
        return record;
    }, {} as MultifactorAuthenticationNotificationRecord);
};

const mapMultifactorAuthenticationNotification = (mfaConfig: MultifactorAuthenticationScenarioConfigRecord) =>
    Object.entries(createNotificationRecord(mfaConfig)).reduce(
        (_, [key, config]) =>
            Object.assign(
                config,
                Object.entries(config).reduce((entry, [name, ui]) => {
                    const scenarioSnakeCase = toLowerCase(key as MultifactorAuthenticationScenario);
                    const notificationName = toLowerCase(name as MultifactorAuthenticationNotificationOptions);
                    // eslint-disable-next-line no-param-reassign
                    entry[`${scenarioSnakeCase}-${notificationName}`] = ui;
                    return entry;
                }, {} as MultifactorAuthenticationNotificationMapEntry),
            ),
        {} as MultifactorAuthenticationNotificationMap,
    );

export {mapMultifactorAuthenticationNotification, toLowerCase};
