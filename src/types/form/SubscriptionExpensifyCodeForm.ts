import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    EXPENSIFY_CODE: 'expensifyCode',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SubscriptionExpensifyCodeForm = Form<InputID, {[INPUT_IDS.EXPENSIFY_CODE]: string}>;

export type {SubscriptionExpensifyCodeForm};
export default INPUT_IDS;
