import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {Errors} from './OnyxCommon';

/** One KYC requirement the business's application needs right now, derived by the server on every read. Never stored. The App draws the page from its own layout for the key. */
type WiseKYCRequirement = {
    /** Wise's requirement type, such as BUSINESS_ULTIMATE_BENEFICIAL_OWNER_ID; also the step the page saves under */
    key: string;

    /** Wise's state for it, NOT_PROVIDED until submitted */
    state: ValueOf<typeof CONST.WISE.KYC_REQUIREMENT_STATE>;

    /** True when only Wise's own page can collect it, so the task opens the embedded page instead of a form */
    hostedOnly: boolean;

    /** EXPENSIFY while we pre-collect it before Submit so Wise does not have to ask, WISE once it comes from Wise's live review */
    requestedBy: ValueOf<typeof CONST.WISE.KYC_REQUIREMENT_REQUESTED_BY>;

    /** What the page needs for this entry, prepared by the server and named after Wise's attribute where one exists, such as requiredUbos as shareholder IDs joined with names for the UBO ID page */
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
