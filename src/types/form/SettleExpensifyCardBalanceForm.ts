import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    SETTLEMENT_TYPE: 'settlementType',
    AMOUNT: 'amount',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SettleExpensifyCardBalanceForm = Form<InputID, {[INPUT_IDS.SETTLEMENT_TYPE]: string; [INPUT_IDS.AMOUNT]: string}>;

export type {SettleExpensifyCardBalanceForm};
export default INPUT_IDS;
