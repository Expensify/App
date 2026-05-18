import type {SearchAutocompleteQueryRange} from '@components/Search/types';
import {parse} from '@libs/SearchParser/autocompleteParser';
import type {SubstitutionMap} from './getQueryWithSubstitutions';
import {getSubstitutionMapKeyWithIndex} from './getQueryWithSubstitutions';

/**
 * Given a plaintext query and a SubstitutionMap object,
 * this function will remove any substitution keys that do not appear in the query and return an updated object.
 * When the same filter+value appears multiple times (e.g. workspace:"A's Workspace" three times), each occurrence
 * is assigned an index and we preserve keys baseKey (index 0), baseKey:1, baseKey:2, ... so multiple IDs are kept.
 *
 * Ex:
 * query: `Test from:John1`
 * substitutions: {
 *     from:SomeOtherJohn: 12345
 * }
 * return: {}
 */
function getUpdatedSubstitutionsMap(query: string, substitutions: SubstitutionMap): SubstitutionMap {
    const parsedQuery = parse(query) as {ranges: SearchAutocompleteQueryRange[]};

    const searchAutocompleteQueryRanges = parsedQuery.ranges;

    if (searchAutocompleteQueryRanges.length === 0) {
        return {};
    }

    // Assign occurrence index per (key, value) so we preserve indexed keys for duplicates (e.g. same workspace name)
    const keyValueCount = new Map<string, number>();
    const updatedSubstitutionMap: SubstitutionMap = {};

    for (const range of searchAutocompleteQueryRanges) {
        const baseKey = `${range.key}:${range.value}`;
        const index = keyValueCount.get(baseKey) ?? 0;
        keyValueCount.set(baseKey, index + 1);

        const fullKey = getSubstitutionMapKeyWithIndex(range.key, range.value, index);
        const value = substitutions[fullKey] ?? (index === 0 ? substitutions[baseKey] : undefined);
        if (value) {
            updatedSubstitutionMap[fullKey] = value;
        }
    }

    return updatedSubstitutionMap;
}

// eslint-disable-next-line import/prefer-default-export
export {getUpdatedSubstitutionsMap};
