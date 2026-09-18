import type {Errors} from './OnyxCommon';

/** A short-lived link to Wise's embedded KYC page for the requirements Auth cannot express as fields */
type WiseKYCReviewEmbeddedLink = {
    url?: string;

    /** ISO timestamp after which Wise rejects the link */
    expiresAt?: string;

    isLoading?: boolean;

    errors?: Errors;
};

export default WiseKYCReviewEmbeddedLink;
