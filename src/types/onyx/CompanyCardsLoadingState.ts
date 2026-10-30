import type {CardFeedWithNumber} from './CardFeeds';

/**
 * Session-scoped loading state for an individual company card feed.
 */
type CompanyCardsFeedLoadingState = {
    /** Whether this feed has been fetched at least once in this session */
    hasOnceLoaded?: boolean;
};

/**
 * Session-scoped loading state for company cards.
 *
 * Frontend-owned and RAM-only so backend SET responses on SHARED_NVP_PRIVATE_DOMAIN_MEMBER
 * cannot wipe hasOnceLoaded flags. Used to gate skeleton UI without blocking refresh requests.
 */
type CompanyCardsLoadingState = {
    /** Whether workspace company card feeds have been fetched at least once in this session */
    hasOnceLoadedPage?: boolean;

    /** Identifies the latest successful bulk transaction start date update */
    bulkTransactionStartDateUpdateSuccessID?: string;

    /** Identifies the latest queued bulk transaction start date update */
    bulkTransactionStartDateUpdateID?: string;

    /** Per-feed session loading state keyed by feed name */
    feeds?: Partial<Record<CardFeedWithNumber, CompanyCardsFeedLoadingState>>;
};

export default CompanyCardsLoadingState;
