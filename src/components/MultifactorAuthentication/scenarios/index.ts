import type {ValueOf} from 'type-fest';
import * as AuthorizeTransaction from './config/AuthorizeTransaction';
import {mapMultifactorAuthenticationNotification} from './helpers';
import type {MultifactorAuthenticationUIRecord} from './types';

type MultifactorAuthenticationScenarioParameters = {
    [AuthorizeTransaction.Name]: AuthorizeTransaction.Parameters;
};

const MULTIFACTOR_AUTHENTICATION_SCENARIO_NAMES = {
    AUTHORIZE_TRANSACTION: AuthorizeTransaction.Name,
} as const;

const MULTIFACTOR_AUTHENTICATION_UI = {
    [AuthorizeTransaction.Name]: AuthorizeTransaction.UI,
} as const satisfies MultifactorAuthenticationUIRecord;

const MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG = {
    [AuthorizeTransaction.Name]: AuthorizeTransaction.Config,
} as const;

/* No need to modify anything below this point when adding a new scenario */

const MULTIFACTOR_AUTHENTICATION_NOTIFICATION_MAP = mapMultifactorAuthenticationNotification(MULTIFACTOR_AUTHENTICATION_UI);

type MultifactorAuthenticationScenario = ValueOf<typeof MULTIFACTOR_AUTHENTICATION_SCENARIO_NAMES>;

export {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG, MULTIFACTOR_AUTHENTICATION_SCENARIO_NAMES, MULTIFACTOR_AUTHENTICATION_UI, MULTIFACTOR_AUTHENTICATION_NOTIFICATION_MAP};

export {default as MULTIFACTOR_AUTHENTICATION_PROMPT_UI} from './config/Prompt';
export type {MultifactorAuthenticationScenarioParameters, MultifactorAuthenticationScenario};
