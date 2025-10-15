import type * as OnyxCommon from './OnyxCommon';

/** Model of domain data */
type Domain = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** The accountID of the account representing the domain, used as a unique identifier for a domain */
    accountID: number;

    /** The name of the domain prefixed with +@ */
    email: string;

    /** Whether the domain has been validated by adding a DNS record */
    validated: boolean;
}>;

export default Domain;
