import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    TAX_CLAIMABLE_VALUE: 'taxClaimableValue',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type PolicyDistanceRateTaxReclaimableOnEditForm = Form<
    InputID,
    {
        [INPUT_IDS.TAX_CLAIMABLE_VALUE]: string;
    }
>;

export type {PolicyDistanceRateTaxReclaimableOnEditForm};
export default INPUT_IDS;
