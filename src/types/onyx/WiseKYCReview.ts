import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {Errors} from './OnyxCommon';

/** One KYC requirement the business's application needs right now, derived by the server on every read. Never stored. */
type WiseKYCRequirement = {
    /** Wise's requirement type; also the step its answers are saved under */
    key: string;

    /** Wise's state for it, NOT_PROVIDED until submitted */
    state: ValueOf<typeof CONST.WISE.KYC_REQUIREMENT_STATE>;

    /** True when only Wise's embedded page can collect it */
    hostedOnly: boolean;

    /** EXPENSIFY while we pre-collect it before Submit so Wise does not have to ask, WISE once it comes from Wise's live review */
    requestedBy: ValueOf<typeof CONST.WISE.KYC_REQUIREMENT_REQUESTED_BY>;

    /** Wise's attributes for the requirement, passed through unchanged */
    attributes?: Record<string, unknown>;
};

/** A fresh link to Wise's embedded KYC page. Its fragment carries a token, so the key is RAM only and never logged. */
type WiseKYCReviewEmbeddedLink = {
    url?: string;

    /** When the link stops working, ISO 8601 */
    expiresAt?: string;

    /** Set while the link is being requested */
    isLoading?: boolean;

    errors?: Errors;
};

export type {WiseKYCRequirement, WiseKYCReviewEmbeddedLink};
