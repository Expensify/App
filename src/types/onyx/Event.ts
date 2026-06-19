import type {Errors} from './OnyxCommon';

/** A single business event shown in the Book events screen */
type Event = {
    /** Stable unique identifier */
    id: string;

    /** Display name of the event */
    name: string;

    /** ISO start date string, e.g. '2026-09-12' */
    startDate: string;

    /** ISO end date string; present only for multi-day events */
    endDate?: string;

    /** Remote thumbnail URL */
    thumbnailUrl: string;
};

/** Loading/error metadata for the mocked events fetch */
type EventsFetchMetadata = {
    /** Whether a fetch is currently in progress */
    loading: boolean;

    /** Whether at least one fetch has completed (success or failure) */
    hasCompletedInitialFetch?: boolean;

    /** Errors keyed by microtime; present when the last fetch failed */
    errors?: Errors;
};

export type {Event, EventsFetchMetadata};
