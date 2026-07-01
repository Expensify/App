import type {SearchAutocompleteResult} from '@components/Search/types';
import {parse as parseSearchQuery} from '@libs/SearchParser/autocompleteParser';

function getAutocompleteSelectionSubstitutionKey(newSearchQuery: string, fieldKey: string, fallbackMapKey: string, fallbackSearchQuery: string): string {
    const parsed = parseSearchQuery(newSearchQuery) as SearchAutocompleteResult;
    const sameKeyRanges = parsed.ranges?.filter((range) => range.key === fieldKey) ?? [];
    const lastRange = sameKeyRanges.at(-1);
    const rangeValue = lastRange?.value ?? fallbackSearchQuery;
    const index = sameKeyRanges.filter((range) => range.value === rangeValue).length - 1;
    const substitutionBaseKey = `${fieldKey}:${rangeValue}`;
    return index <= 0 ? fallbackMapKey : `${substitutionBaseKey}:${index}`;
}

export default getAutocompleteSelectionSubstitutionKey;
