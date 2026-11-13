import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    RESPONSE: 'response',
} as const;

type ExitSurveyResponseForm = Form<
    ValueOf<typeof INPUT_IDS>,
    {
        [INPUT_IDS.RESPONSE]: string;
    }
> & {
    /** Outcome of each SwitchToOldDot request, keyed by the ID it was started with, so switches from several tabs don't read each other's outcome */
    switchToOldDotResults?: Record<string, ValueOf<typeof CONST.EXIT_SURVEY.SWITCH_RESULT>>;
};

export type {ExitSurveyResponseForm};
export default INPUT_IDS;
