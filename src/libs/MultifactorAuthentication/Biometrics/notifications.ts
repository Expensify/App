import MULTIFACTOR_AUTHENTICATION_UI from '@components/MultifactorAuthenticationContext/ui';
import type {AllMultifactorAuthenticationNotificationType, MultifactorAuthenticationNotificationType} from './notifications.types';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationUIConfig} from './types';

const UI_CONFIG_ROUTES = Object.entries(MULTIFACTOR_AUTHENTICATION_UI).reduce(
    (configs, [key, config]) => {
        const scenario = key as MultifactorAuthenticationScenario;
        const lowerCaseScenario = scenario.toLowerCase() as Lowercase<typeof scenario>;

        const mergedConfigs = Object.entries(config).reduce(
            (cfg, [name, ui]) => {
                const lowerCaseName = name.toLowerCase() as Lowercase<keyof typeof config>;
                // eslint-disable-next-line no-param-reassign
                cfg[`${lowerCaseScenario}-${lowerCaseName}`] = ui;
                return cfg;
            },
            {} as Record<MultifactorAuthenticationNotificationType<typeof scenario>, MultifactorAuthenticationUIConfig>,
        );

        return Object.assign(config, mergedConfigs);
    },
    {} as Record<AllMultifactorAuthenticationNotificationType, MultifactorAuthenticationUIConfig>,
);

export default UI_CONFIG_ROUTES;
