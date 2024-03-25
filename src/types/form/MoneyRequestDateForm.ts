import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    CREATED: 'created',
    MONEY_REQUEST_CREATED: 'moneyRequestCreated',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type MoneyRequestDateForm = Form<
    InputID,
    {
        [INPUT_IDS.CREATED]: string;
        [INPUT_IDS.MONEY_REQUEST_CREATED]: string;
    }
>;

export type {MoneyRequestDateForm};
export default INPUT_IDS;
