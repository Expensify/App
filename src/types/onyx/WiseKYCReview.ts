import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {DynamicFormField} from './DynamicFormField';
import type {Errors} from './OnyxCommon';

/** One thing Wise still needs on the business's KYC review, as the server builds it from the live review. Never stored. */
type WiseKYCRequirement = {
    /** Wise's requirement key, such as PROOF_OF_TRADING_ADDRESS; also the step a native page saves under */
    key: string;

    /** Wise's state for it, NOT_PROVIDED until submitted */
    state: ValueOf<typeof CONST.WISE.KYC_REQUIREMENT_STATE>;

    /** True when only Wise's own page can collect it, so the task opens the embedded page instead of a form */
    hostedOnly: boolean;

    /** The page to render; empty when hostedOnly */
    fields: DynamicFormField[];
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
