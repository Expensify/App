import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    SUBSCRIPTION_SIZE: 'subscriptionSize',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SubscriptionSizeForm = Form<InputID, {[INPUT_IDS.SUBSCRIPTION_SIZE]: string}>;

export type {SubscriptionSizeForm};
export default INPUT_IDS;
