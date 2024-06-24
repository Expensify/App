import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    CARD_NAME: 'cardName',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type IssueNewExpensifyCardForm = Form<
    InputID,
    {
        [INPUT_IDS.CARD_NAME]: string;
    }
>;

export type {IssueNewExpensifyCardForm};
export default INPUT_IDS;
