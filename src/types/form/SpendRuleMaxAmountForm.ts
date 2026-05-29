import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    MAX_AMOUNT: 'maxAmount',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SpendRuleMaxAmountForm = Form<InputID, {maxAmount: string}>;

export type {SpendRuleMaxAmountForm};
export default INPUT_IDS;
