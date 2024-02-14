import type Form from './Form';

const INPUT_IDS = {
    COMMENT: 'comment',
    MONEY_REQUEST_COMMENT: 'moneyRequestComment',
} as const;

type MoneyRequestDescriptionForm = Form<{
    [INPUT_IDS.COMMENT]: string;
    [INPUT_IDS.MONEY_REQUEST_COMMENT]: string;
}>;

export type {MoneyRequestDescriptionForm};
export default INPUT_IDS;
