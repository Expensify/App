import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    COMMENT: 'comment',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type MoneyRequestHoldReasonForm = Form<
    InputID,
    {
        [INPUT_IDS.COMMENT]: string;
    }
>;

export type {MoneyRequestHoldReasonForm};
export default INPUT_IDS;
