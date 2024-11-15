import type {OnyxCollection} from 'react-native-onyx';
import type {SearchAutocompleteQueryRange, SearchFilterKey} from '@components/Search/types';
import * as parser from '@libs/SearchParser/autocompleteParser';
import type * as OnyxTypes from '@src/types/onyx';
import type {SubstitutionMap} from './getQueryWithSubstitutions';

const getSubstitutionsKey = (filterKey: SearchFilterKey, value: string) => `${filterKey}:${value}`;

/**
 * Given a plaintext query and data
 * this function will build from scratch
 *
 * Ex:
 * query: `Test from:John1`
 * substitutions: {
 *     from:SomeOtherJohn: 12345
 * }
 * return: {}
 */
function buildSubstitutionsMap(query: string, personalDetails: OnyxTypes.PersonalDetailsList, cardList: OnyxTypes.CardList, reports: OnyxCollection<OnyxTypes.Report>): SubstitutionMap {
    const parsedQuery = parser.parse(query) as {ranges: SearchAutocompleteQueryRange[]};

    const searchAutocompleteQueryRanges = parsedQuery.ranges;

    if (searchAutocompleteQueryRanges.length === 0) {
        return {};
    }

    const autocompleteQueryKeys = searchAutocompleteQueryRanges.map((range) => getSubstitutionsKey(range.key, range.value));

    // Build a new substitutions map consisting of only the keys from old map, that appear in query
    const updatedSubstitutionMap = autocompleteQueryKeys.reduce((map, key) => {
        //
        return map;
    }, {} as SubstitutionMap);

    return updatedSubstitutionMap;
}

// eslint-disable-next-line import/prefer-default-export
export {buildSubstitutionsMap};
