import type {SearchAutocompleteQueryRange, SearchFilterKey} from '@components/Search/types';
import {parse} from '@libs/SearchParser/autocompleteParser';
import {getSubstitutionMapKeyWithIndex} from './getQueryWithSubstitutions';
import type {SubstitutionMap} from './getQueryWithSubstitutions';

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

    const substitutionKeyOccurrences = new Map<string, number>();
    const autocompleteQueryKeys = searchAutocompleteQueryRanges.map((range) => {
        const substitutionMapKey = getSubstitutionsKey(range.key, range.value);
        const substitutionOccurrenceIndex = substitutionKeyOccurrences.get(substitutionMapKey) ?? 0;
        substitutionKeyOccurrences.set(substitutionMapKey, substitutionOccurrenceIndex + 1);

        return getSubstitutionMapKeyWithIndex(range.key, range.value, substitutionOccurrenceIndex);
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
