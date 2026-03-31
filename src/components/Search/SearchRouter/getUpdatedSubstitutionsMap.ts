import type {SearchAutocompleteQueryRange, SearchFilterKey} from '@components/Search/types';
import {parse} from '@libs/SearchParser/autocompleteParser';
import type {SubstitutionMap} from './getQueryWithSubstitutions';
import {getSubstitutionMapKeyWithIndex} from './getQueryWithSubstitutions';

const getSubstitutionsKey = (filterKey: SearchFilterKey, value: string) => `${filterKey}:${value}`;

/**
 * Given a plaintext query and a SubstitutionMap object,
 * this function will remove any substitution keys that do not appear in the query and return an updated object
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

    const keyOccurrences = new Map<string, number>();
    const autocompleteQueryKeys = searchAutocompleteQueryRanges.map((range) => {
        const baseKey = getSubstitutionsKey(range.key, range.value);
        const index = keyOccurrences.get(baseKey) ?? 0;
        keyOccurrences.set(baseKey, index + 1);
        return getSubstitutionMapKeyWithIndex(range.key, range.value, index);
    });

    // Build a new substitutions map consisting of only the keys from old map, that appear in query
    const updatedSubstitutionMap = autocompleteQueryKeys.reduce((map, key) => {
        if (substitutions[key]) {
            // eslint-disable-next-line no-param-reassign
            map[key] = substitutions[key];
        }

        return map;
    }, {} as SubstitutionMap);

    return updatedSubstitutionMap;
}

// eslint-disable-next-line import/prefer-default-export
export {getUpdatedSubstitutionsMap};
