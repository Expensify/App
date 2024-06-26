import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    CARD_NAME: 'cardName',
    LIMIT: 'limit',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type IssueNewExpensifyCardForm = Form<
    InputID,
    {
        [INPUT_IDS.CARD_NAME]: string;
        [INPUT_IDS.LIMIT]: string;
    }
>;

export type {IssueNewExpensifyCardForm};
export default INPUT_IDS;
