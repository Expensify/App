import type {SearchAutocompleteQueryRange, SearchFilterKey} from '@components/Search/types';
import {parse} from '@libs/SearchParser/autocompleteParser';
import {sanitizeSearchValue} from '@libs/SearchQueryUtils';

type SubstitutionMap = Record<string, string>;

const getSubstitutionMapKey = (filterKey: SearchFilterKey, value: string) => `${filterKey}:${value}`;

const getSubstitutionMapKeyWithIndex = (filterKey: SearchFilterKey, value: string, index: number) =>
    index === 0 ? getSubstitutionMapKey(filterKey, value) : `${getSubstitutionMapKey(filterKey, value)}:${index}`;

/**
 * Given a plaintext query and a SubstitutionMap object, this function will return a transformed query where:
 * - any autocomplete mention in the original query will be substituted with an id taken from `substitutions` object
 * - anything that does not match will stay as is
 *
 * Ex:
 * query: `A from:@johndoe A`
 * substitutions: {
 *     from:@johndoe: 9876
 * }
 * return: `A from:9876 A`
 */
function getQueryWithSubstitutions(changedQuery: string, substitutions: SubstitutionMap) {
    const parsed = parse(changedQuery) as {ranges: SearchAutocompleteQueryRange[]};

    const searchAutocompleteQueryRanges = parsed.ranges;

    if (searchAutocompleteQueryRanges.length === 0) {
        return changedQuery;
    }

    let resultQuery = changedQuery;
    let lengthDiff = 0;
    const keyOccurrences = new Map<string, number>();

    for (const range of searchAutocompleteQueryRanges) {
        const baseKey = getSubstitutionMapKey(range.key, range.value);
        const index = keyOccurrences.get(baseKey) ?? 0;
        keyOccurrences.set(baseKey, index + 1);

        const itemKey = getSubstitutionMapKeyWithIndex(range.key, range.value, index);
        let substitutionEntry = substitutions[itemKey];

        if (substitutionEntry) {
            const substitutionStart = range.start + lengthDiff;
            const substitutionEnd = range.start + range.length;
            substitutionEntry = sanitizeSearchValue(substitutionEntry);

            // generate new query but substituting "user-typed" value with the entity id/email from substitutions
            resultQuery = resultQuery.slice(0, substitutionStart) + substitutionEntry + changedQuery.slice(substitutionEnd);
            lengthDiff = lengthDiff + substitutionEntry.length - range.length;
        }
    }

    return resultQuery;
}

export {getQueryWithSubstitutions, getSubstitutionMapKey, getSubstitutionMapKeyWithIndex};
export type {SubstitutionMap};
