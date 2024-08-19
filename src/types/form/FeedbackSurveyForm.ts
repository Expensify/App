import type {ValueOf} from 'type-fest';
import type {FeedbackSurveyOptionID} from '@src/CONST';
import type Form from './Form';

const INPUT_IDS = {
    REASON: 'reason',
    NOTE: 'note',
} as const;

type FeedbackSurveyForm = Form<
    ValueOf<typeof INPUT_IDS>,
    {
        [INPUT_IDS.REASON]: FeedbackSurveyOptionID;
        [INPUT_IDS.NOTE]: string;
    }
>;

export type {FeedbackSurveyForm};
export default INPUT_IDS;
