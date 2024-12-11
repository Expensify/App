import type {OnyxCollection} from 'react-native-onyx';
import type {SearchAutocompleteQueryRange, SearchFilterKey} from '@components/Search/types';
import * as parser from '@libs/SearchParser/autocompleteParser';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {SubstitutionMap} from './getQueryWithSubstitutions';

const getSubstitutionsKey = (filterKey: SearchFilterKey, value: string) => `${filterKey}:${value}`;

/**
 * Given a plaintext query and specific entities data,
 * this function will build the substitutions map from scratch for this query
 *
 * Ex:
 * query: `Test from:12345 to:9876`
 * personalDetails: {
 *     12345: JohnDoe
 *     98765: SomeoneElse
 * }
 *
 * return: {
 *     from:JohnDoe: 12345,
 *     to:SomeoneElse: 98765,
 * }
 */
function buildSubstitutionsMap(
    query: string,
    personalDetails: OnyxTypes.PersonalDetailsList | undefined,
    reports: OnyxCollection<OnyxTypes.Report>,
    allTaxRates: Record<string, string[]>,
): SubstitutionMap {
    const parsedQuery = parser.parse(query) as {ranges: SearchAutocompleteQueryRange[]};

    const searchAutocompleteQueryRanges = parsedQuery.ranges;

    if (searchAutocompleteQueryRanges.length === 0) {
        return {};
    }

    const substitutionsMap = searchAutocompleteQueryRanges.reduce((map, range) => {
        const {key: filterKey, value: filterValue} = range;

        if (filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE) {
            const taxRateID = filterValue;
            const taxRates = Object.entries(allTaxRates)
                .filter(([, IDs]) => IDs.includes(taxRateID))
                .map(([name]) => name);

            const taxRateNames = taxRates.length > 0 ? taxRates : [taxRateID];
            const uniqueTaxRateNames = [...new Set(taxRateNames)];
            uniqueTaxRateNames.forEach((taxRateName) => {
                const substitutionKey = getSubstitutionsKey(filterKey, taxRateName);

                // eslint-disable-next-line no-param-reassign
                map[substitutionKey] = taxRateID;
            });
        } else if (
            filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM ||
            filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TO ||
            filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.IN ||
            filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID
        ) {
            const displayValue = SearchQueryUtils.getFilterDisplayValue(filterKey, filterValue, personalDetails, reports);

            // If displayValue === filterValue, then it means there is nothing to substitute, so we don't add any key to map
            if (displayValue !== filterValue) {
                const substitutionKey = getSubstitutionsKey(filterKey, displayValue);
                // eslint-disable-next-line no-param-reassign
                map[substitutionKey] = filterValue;
            }
        }

        return map;
    }, {} as SubstitutionMap);

    return substitutionsMap;
}

// eslint-disable-next-line import/prefer-default-export
export {buildSubstitutionsMap};
