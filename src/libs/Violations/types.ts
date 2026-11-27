import type {MileageRate} from '@libs/DistanceRequestUtils';

import type {PolicyCategories, PolicyTagLists, TaxRates} from '@src/types/onyx';

type ViolationFixParams = {
    category: string;
    tag: string;
    taxCode: string | undefined;
    /** Tax value as a percentage string (e.g., "5%", "10%") or undefined if not set */
    taxValue?: string;
    policyCategories: PolicyCategories | undefined;
    policyTagLists: PolicyTagLists | undefined;
    policyTaxRates: TaxRates | undefined;

    /** Whether the expense still needs attendees it doesn't have. The caller works it out with the same rule that raised the violation. */
    isMissingAttendees: boolean;

    mileageRate?: MileageRate;
    expenseDate?: string;
};

export default ViolationFixParams;
