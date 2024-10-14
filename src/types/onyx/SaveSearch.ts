import type * as OnyxCommon from './OnyxCommon';

/**
 * Model of a single saved search
 */
type SaveSearchItem = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Name of the saved search */
    name: string;

    /** Query string for the saved search */
    query: string;
}>;

/**
 * Model of saved searches
 */
type SaveSearch = Record<number, SaveSearchItem>;

export type {SaveSearch, SaveSearchItem};
