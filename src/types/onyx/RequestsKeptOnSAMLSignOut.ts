import type {AnyRequest} from './Request';

/** Unsent requests set aside when SAML signs someone out, sent again only if the same account signs back in */
type RequestsKeptOnSAMLSignOut = {
    /** accountID that was signed out, so a different account signing in never sends these */
    accountID: number;

    /** Queued requests, including the one that was being sent, in the order they were queued */
    requests: AnyRequest[];
};

export default RequestsKeptOnSAMLSignOut;
