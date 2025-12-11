import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import {mapMultifactorAuthenticationNotification} from './helpers';
import * as AuthorizeTransaction from './scenarios/AuthorizeTransaction';
import type {MultifactorAuthenticationScenarioConfigRecord, MultifactorAuthenticationUIRecord} from './types';

type MultifactorAuthenticationScenarioParameters = {
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION]: AuthorizeTransaction.Parameters;
};

const MULTIFACTOR_AUTHENTICATION_UI = {
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION]: AuthorizeTransaction.UI,
} as const satisfies MultifactorAuthenticationUIRecord;

const MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG = {
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION]: AuthorizeTransaction.Config,
} as const satisfies MultifactorAuthenticationScenarioConfigRecord;

/* No need to modify anything below this point when adding a new scenario */

const MULTIFACTOR_AUTHENTICATION_NOTIFICATION_MAP = mapMultifactorAuthenticationNotification(MULTIFACTOR_AUTHENTICATION_UI);

type MultifactorAuthenticationScenario = ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO>;

export {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG, MULTIFACTOR_AUTHENTICATION_UI, MULTIFACTOR_AUTHENTICATION_NOTIFICATION_MAP};

export {default as MULTIFACTOR_AUTHENTICATION_PROMPT_UI} from './Prompt';
export type {MultifactorAuthenticationScenarioParameters, MultifactorAuthenticationScenario};
