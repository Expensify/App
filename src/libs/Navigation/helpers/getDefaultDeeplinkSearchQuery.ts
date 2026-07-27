import {parse as parseSearchQuery} from '@libs/SearchParser/searchParser';

/**
 * Default expenses search query used to seed a deeplink-only search screen (see getAdaptedStateFromPath).
 *
 * Equivalent to buildCannedSearchQuery() with no arguments, but imports only the standalone (dependency-free)
 * PEG parser instead of SearchQueryUtils. SearchQueryUtils pulls the actions/Onyx graph, which loops back into
 * the linkingConfig require graph and leaves route constants half-initialized at module load time. A canned
 * query has no filters, so its string form is just the root keys with the grammar's default values.
 */
export default function getDefaultDeeplinkSearchQuery(): string {
    const {type, sortBy, sortOrder} = parseSearchQuery('type:expense') as {type: string; sortBy: string; sortOrder: string};
    return `type:${type} sortBy:${sortBy} sortOrder:${sortOrder}`;
}
