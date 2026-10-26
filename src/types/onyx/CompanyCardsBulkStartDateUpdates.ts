import type {CardFeedWithNumber} from './CardFeeds';

/**
 * Latest queued bulk transaction start date update for each company card feed, keyed by feed name.
 *
 * Persisted so an update queued offline still gets its success message after an app reload. Deleting a feed clears its
 * entry on the device, because the server can keep the feed after a deletion that only unlinks it from the workspace.
 */
type CompanyCardsBulkStartDateUpdates = Partial<Record<CardFeedWithNumber, string>>;

export default CompanyCardsBulkStartDateUpdates;
