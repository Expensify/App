import type {SearchAutocompleteResult} from '@components/Search/types';
import * as autocompleteParser from './AutocompleteParser/autocompleteParser';

function parseForAutocomplete(text: string) {
    try {
        const parsedAutocomplete = autocompleteParser.parse(text) as SearchAutocompleteResult;
        return parsedAutocomplete;
    } catch (e) {
        console.error(`Error when parsing autocopmlete}"`, e);
    }
}

// eslint-disable-next-line import/prefer-default-export
export {parseForAutocomplete};
