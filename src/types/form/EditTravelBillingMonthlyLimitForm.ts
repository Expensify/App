import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    LIMIT: 'limit',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type EditTravelBillingMonthlyLimitForm = Form<InputID, {[INPUT_IDS.LIMIT]: string}>;

export type {EditTravelBillingMonthlyLimitForm};
export default INPUT_IDS;
