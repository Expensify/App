import {parse as parseSearchQuery} from '@libs/SearchParser/searchParser';

import CONST from '@src/CONST';

/**
 * Default expenses search query used to seed a deeplink-only search screen (see getAdaptedStateFromPath).
 *
 * Equivalent to buildCannedSearchQuery() with no arguments, but imports only the standalone (dependency-free)
 * PEG parser instead of SearchQueryUtils. SearchQueryUtils pulls the actions/Onyx graph, which loops back into
 * the linkingConfig require graph and leaves route constants half-initialized at module load time. A canned
 * query has no filters, so its string form is just the root keys with the grammar's default values.
 */
type ParsedDefaults = {type: string; sortBy: string; sortOrder: string};

function isParsedDefaults(value: unknown): value is ParsedDefaults {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    if (!('type' in value) || !('sortBy' in value) || !('sortOrder' in value)) {
        return false;
    }
    return typeof value.type === 'string' && typeof value.sortBy === 'string' && typeof value.sortOrder === 'string';
}

export default function getDefaultDeeplinkSearchQuery(): string {
    const parsed: unknown = parseSearchQuery(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE}`);
    if (!isParsedDefaults(parsed)) {
        throw new Error('Unexpected output from search query parser');
    }
    const {type, sortBy, sortOrder} = parsed;
    return `type:${type} sortBy:${sortBy} sortOrder:${sortOrder}`;
}
