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
>;

export type {ExitSurveyResponseForm};
export default INPUT_IDS;
