/** A single card returned by SearchCompanyCardByNumber */
type CompanyCardNumberSearchResult = {
    /** The feed the card belongs to */
    feed: string;

    /** The domain or workspace account that owns the feed */
    domainAccountID: number;

    /** Whether the card is already assigned or available to assign */
    status: 'assigned' | 'unassigned';

    /** 'full' when the full number was stored and matched, 'lastFour' when only partial digits lined up */
    matchType: 'full' | 'lastFour';

    /** The masked card name */
    cardName: string;

    /** The cardID of an assigned card */
    cardID?: number;

    /** The encrypted card number, when the card has one */
    encryptedCardNumber?: string;
};

/** RAM-only results of a company-card full-number search, keyed by policyID */
type CompanyCardNumberSearch = {
    /** Whether a search request is in flight */
    isLoading: boolean;

    /** Whether the request failed rather than returning an authoritative empty result */
    hasError?: boolean;

    /** Non-reversible hash of the normalized number the current results belong to. The raw number is never
     *  stored in Onyx; consumers correlate results to the typed input by hashing it the same way. */
    queryHash: number;

    /** The matching cards */
    cards: CompanyCardNumberSearchResult[];
};

export default CompanyCardNumberSearch;
export type {CompanyCardNumberSearchResult};
