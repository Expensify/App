import type {SearchAutocompleteQueryRange} from '@components/Search/types';
import * as parser from '@libs/SearchParser/autocompleteParser';
import type {SubstitutionMap} from './getQueryWithSubstitutions';

const getSubstitutionsKey = (filterName: string, value: string) => `${filterName}:${value}`;

function getUpdatedSubstitutionsMap(query: string, substitutions: SubstitutionMap): SubstitutionMap {
    const parsedQuery = parser.parse(query) as {ranges: SearchAutocompleteQueryRange[]};

    const searchAutocompleteQueryRanges = parsedQuery.ranges;

    if (searchAutocompleteQueryRanges.length === 0) {
        return {};
    }

    const autocompleteQueryKeys = searchAutocompleteQueryRanges.map((range) => getSubstitutionsKey(range.key, range.value));

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
