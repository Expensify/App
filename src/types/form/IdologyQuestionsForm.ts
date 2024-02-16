import type Form from './Form';

const INPUT_IDS = {
    ANSWER: 'answer',
} as const;

type IdologyQuestionsForm = Form<{
    [INPUT_IDS.ANSWER]: string;
}>;

export type {IdologyQuestionsForm};
export default INPUT_IDS;
