import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type Form from './Form';

type ExitReason = ValueOf<typeof CONST.EXIT_SURVEY.REASONS>;

const INPUT_IDS = {
    REASON: 'reason',
} as const;

type ExitSurveyReasonForm = Form<
    ValueOf<typeof INPUT_IDS>,
    {
        [INPUT_IDS.REASON]: ExitReason;
    }
>;

export type {ExitSurveyReasonForm, ExitReason};
export default INPUT_IDS;
