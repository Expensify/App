import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    ANSWER: 'answer',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type IdologyQuestionsForm = Form<
    InputID,
    {
        [INPUT_IDS.ANSWER]: string;
    }
>;

export type {IdologyQuestionsForm};
export default INPUT_IDS;
