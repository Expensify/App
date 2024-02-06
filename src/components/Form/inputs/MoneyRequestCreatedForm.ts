import type {Form} from '@src/types/onyx';

const INPUT_IDS = {
    CREATED: 'created',
    MONEY_REQUEST_CREATED: 'moneyRequestCreated',
} as const;

type MoneyRequestCreatedForm = Form<{
    [INPUT_IDS.CREATED]: string;
    [INPUT_IDS.MONEY_REQUEST_CREATED]: string;
}>;

export default MoneyRequestCreatedForm;
export {INPUT_IDS};
