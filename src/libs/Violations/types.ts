import type {PolicyCategories, PolicyTagLists} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

type ViolationFixParams = {
    category: string;
    tag: string;
    taxCode: string | undefined;
    policyCategories: PolicyCategories | undefined;
    policyTagLists: PolicyTagLists | undefined;
    policyTaxRates: Record<string, unknown> | undefined;
    iouAttendees: Attendee[] | undefined;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    isAttendeeTrackingEnabled: boolean | undefined;
};

export type {ViolationFixParams};
