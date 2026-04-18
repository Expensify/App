import type {SearchAutocompleteQueryRange, SearchFilterKey} from '@components/Search/types';
import {parse} from '@libs/SearchParser/autocompleteParser';
import {sanitizeSearchValue} from '@libs/SearchQueryUtils';

type SubstitutionMap = Record<string, string>;

const getSubstitutionMapKey = (filterKey: SearchFilterKey, value: string) => `${filterKey}:${value}`;

/**
 * Key for the Nth occurrence of the same filter+value (e.g. multiple workspaces with the same name).
 * Index 0 uses the base key for backward compatibility; index > 0 uses baseKey:index.
 */
const getSubstitutionMapKeyWithIndex = (filterKey: SearchFilterKey, value: string, index: number) =>
    index === 0 ? getSubstitutionMapKey(filterKey, value) : `${getSubstitutionMapKey(filterKey, value)}:${index}`;

/**
 * Given a plaintext query and a SubstitutionMap object, this function will return a transformed query where:
 * - any autocomplete mention in the original query will be substituted with an id taken from `substitutions` object
 * - anything that does not match will stay as is
 * - when the same filter+value appears multiple times (e.g. workspace:"A's Workspace" three times), each occurrence
 *   is looked up with an index so multiple different IDs can be stored (baseKey for first, baseKey:1, baseKey:2, ...)
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

    // Count occurrence index per (key, value) so we can look up indexed keys for duplicates (e.g. same workspace name)
    const keyValueCount = new Map<string, number>();
    const rangeIndices = searchAutocompleteQueryRanges.map((range) => {
        const baseKey = getSubstitutionMapKey(range.key, range.value);
        const index = keyValueCount.get(baseKey) ?? 0;
        keyValueCount.set(baseKey, index + 1);
        return index;
    });

    let resultQuery = changedQuery;
    let lengthDiff = 0;

    for (let i = 0; i < searchAutocompleteQueryRanges.length; i++) {
        const range = searchAutocompleteQueryRanges.at(i);
        const index = rangeIndices.at(i);
        if (range === undefined || index === undefined) {
            continue;
        }
        const itemKey = getSubstitutionMapKeyWithIndex(range.key, range.value, index);
        let substitutionEntry = substitutions[itemKey] ?? (index === 0 ? substitutions[getSubstitutionMapKey(range.key, range.value)] : undefined);

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
