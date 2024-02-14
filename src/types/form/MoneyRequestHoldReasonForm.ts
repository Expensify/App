import type Form from "./Form";

const INPUT_IDS = {
    COMMENT: 'comment',
} as const;

type MoneyRequestHoldReasonForm = Form<{
    [INPUT_IDS.COMMENT]: string;
}>;

export type {MoneyRequestHoldReasonForm};
export default INPUT_IDS;