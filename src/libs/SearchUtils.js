import Str from 'expensify-common/lib/str';

const MAX_SEARCH_RESULTS = 10;

/**
 * Provided a list of search options and search string this will filter the options.
 *
 * @param {String} searchValue
 * @param {Array} searchOptions
 * @param {Function} [rejectMethod] additional criteria for excluding any items from matches
 */
function filterChatSearchOptions(searchValue, searchOptions, rejectMethod = () => false) {
    // Search our full list of options. We want:
    // 1) Exact matches first
    // 2) beginning-of-string matches second
    // 3) middle-of-string matches last
    const matchRegexes = [
        new RegExp(`^${Str.escapeForRegExp(searchValue)}$`, 'i'),
        new RegExp(`^${Str.escapeForRegExp(searchValue)}`, 'i'),
        new RegExp(Str.escapeForRegExp(searchValue), 'i'),
    ];

    // Because we want to regexes above to be listed in a specific order, the for loop below will end up adding
    // duplicate options to the list (because one option can match multiple regex patterns).
    // A Set is used here so that duplicate values are automatically removed.
    const matches = new Set();

    for (let i = 0; i < matchRegexes.length; i++) {
        if (matches.size < MAX_SEARCH_RESULTS) {
            for (let j = 0; j < searchOptions.length; j++) {
                const option = searchOptions[j];
                const valueToSearch = option.searchText && option.searchText.replace(new RegExp(/&nbsp;/g), '');
                const isMatch = matchRegexes[i].test(valueToSearch);
                const shouldReject = rejectMethod(option);

                // Make sure we don't include the same option twice (automatically handled by using a `Set`)
                if (isMatch && !shouldReject) {
                    matches.add(option);
                }

                if (matches.size === MAX_SEARCH_RESULTS) {
                    break;
                }
            }
        } else {
            break;
        }
    }

    return Array.from(matches);
}

export {
    filterChatSearchOptions,
};
