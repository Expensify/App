import type {PolicyCategories, PolicyTagLists, TaxRates} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

type ViolationFixParams = {
    category: string;
    tag: string;
    taxCode: string | undefined;
    /** Tax value as a percentage string (e.g., "5%", "10%") or undefined if not set */
    taxValue?: string;
    policyCategories: PolicyCategories | undefined;
    policyTagLists: PolicyTagLists | undefined;
    policyTaxRates: TaxRates | undefined;
    iouAttendees: Attendee[] | undefined;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    isAttendeeTrackingEnabled: boolean | undefined;
    isControlPolicy?: boolean;
};

export default ViolationFixParams;
