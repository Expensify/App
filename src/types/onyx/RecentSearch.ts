/**
 * Model of a single recent search
 */
type RecentSearchItem = {
    /** Query string for the recent search */
    query: string;

    /** Timestamp of recent search */
    timestamp: string;
};

/* oxlint-disable-next-line hosted/prefer-default-export */ // eslint-disable-next-line import/prefer-default-export
export type {RecentSearchItem};
