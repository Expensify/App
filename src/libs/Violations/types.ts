import type {MileageRate} from '@libs/DistanceRequestUtils';

import type {PolicyCategories, PolicyTagLists, TaxRates} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';

type ViolationFixParams = {
    category: string;
    tag: string;
    taxCode: string | undefined;
    /** Tax value as a percentage string (e.g., "5%", "10%") or undefined if not set */
    taxValue?: string;
    policyCategories: PolicyCategories | undefined;
    policyTagLists: PolicyTagLists | undefined;
    policyTaxRates: TaxRates | undefined;
    iouAttendees?: Attendee[];
    ownerLogin?: string;
    isAttendeeTrackingEnabled?: boolean;
    isControlPolicy?: boolean;
    mileageRate?: MileageRate;
    expenseDate?: string;
};

export default ViolationFixParams;
