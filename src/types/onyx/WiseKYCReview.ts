import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {Errors} from './OnyxCommon';

/** One KYC requirement the Wise onboarding still needs, on `achData.wise.kycRequirements` */
type WiseKYCRequirement = {
    /** Wise's requirement type */
    key: string;

    /** Wise's state for the requirement */
    state: ValueOf<typeof CONST.WISE.KYC_REQUIREMENT_STATE>;

    /** True when only Wise's embedded page can collect it */
    isHostedOnly: boolean;

    /** Whether we asked for it before Submit or Wise asked after */
    requestedBy: ValueOf<typeof CONST.WISE.KYC_REQUIREMENT_REQUESTED_BY>;

    /** Wise's attributes for the requirement */
    attributes?: Record<string, unknown>;
};

/** A link to Wise's embedded KYC page. It carries a token, so the key is RAM only */
type WiseKYCReviewEmbeddedLink = {
    url?: string;

    /** When the link expires */
    expiresAt?: string;

    /** Whether the link is being fetched */
    isLoading?: boolean;

    errors?: Errors;
};

export type {WiseKYCRequirement, WiseKYCReviewEmbeddedLink};
