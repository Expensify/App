import type {SearchAutocompleteQueryRange} from '@components/Search/types';
import * as parser from '@libs/SearchParser/autocompleteParser';

type SubstitutionEntry = {value: string};
type SubstitutionMap = Record<string, SubstitutionEntry>;

const getSubstitutionsKey = (filterName: string, value: string) => `${filterName}:${value}`;

function getQueryWithSubstitutions(changedQuery: string, substitutions: SubstitutionMap) {
    const parsed = parser.parse(changedQuery) as {ranges: SearchAutocompleteQueryRange[]};

    const searchAutocompleteQueryRanges = parsed.ranges;

    if (searchAutocompleteQueryRanges.length === 0) {
        return changedQuery;
    }

    let resultQuery = changedQuery;
    let lengthDiff = 0;

    for (const range of searchAutocompleteQueryRanges) {
        const itemKey = getSubstitutionsKey(range.key, range.value);
        const substitutionEntry = substitutions[itemKey];

        if (substitutionEntry) {
            const substitutionStart = range.start + lengthDiff;
            const substitutionEnd = range.start + range.length;

            // generate new query but substituting "user-typed" value with the entity id/email from substitutions
            resultQuery = resultQuery.slice(0, substitutionStart) + substitutionEntry.value + changedQuery.slice(substitutionEnd);
            lengthDiff = lengthDiff + substitutionEntry.value.length - range.length;
        }
    }

    return resultQuery;
}

// eslint-disable-next-line import/prefer-default-export
export {getQueryWithSubstitutions};
