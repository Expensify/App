import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    LIMIT: 'limit',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type EditTravelInvoicingMonthlyLimitForm = Form<InputID, {[INPUT_IDS.LIMIT]: string}>;

export type {EditTravelInvoicingMonthlyLimitForm};
export default INPUT_IDS;
