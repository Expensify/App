import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    RATE: 'rate',
    NAME: 'name',
    START_DATE: 'startDate',
    END_DATE: 'endDate',
    TAX_CLAIMABLE_VALUE: 'taxClaimableValue',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type PolicyCreateDistanceRateForm = Form<
    InputID,
    {
        [INPUT_IDS.RATE]: string;
        [INPUT_IDS.NAME]: string;
        [INPUT_IDS.START_DATE]: string;
        [INPUT_IDS.END_DATE]: string;
        [INPUT_IDS.TAX_CLAIMABLE_VALUE]: string;
    }
>;

export type {PolicyCreateDistanceRateForm};
export default INPUT_IDS;
