import CONST from '@src/CONST';
import StringUtils from './StringUtils';

type Option = {
    value: string;
    keyForList: string;
    text: string;
    isSelected: boolean;
    searchValue: string;
};

function moveSelectedOptionsToTop<TOption extends {value: string}>(options: TOption[], initialSelectedValues: string[] = []): TOption[] {
    if (options.length <= CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD || initialSelectedValues.length === 0) {
        return options;
    }

    const initialSelectedValuesSet = new Set(initialSelectedValues);
    const selectedOptions: TOption[] = [];
    const unselectedOptions: TOption[] = [];

    for (const option of options) {
        if (initialSelectedValuesSet.has(option.value)) {
            selectedOptions.push(option);
        } else {
            unselectedOptions.push(option);
        }
    }

    return [...selectedOptions, ...unselectedOptions];
}

/**
 * Searches the options and returns sorted results based on the search query
 * @param options - An array of option objects
 * @returns An array of options sorted based on the search query
 */
function searchOptions(searchValue: string, options: Option[], initialSelectedValues: string[] = []): Option[] {
    if (!searchValue) {
        return moveSelectedOptionsToTop(options, initialSelectedValues);
    }

    const trimmedSearchValue = StringUtils.sanitizeString(searchValue);
    if (!trimmedSearchValue) {
        return [];
    }
    const filteredData = options.filter((option) => option.searchValue.includes(trimmedSearchValue));

    const halfSorted = filteredData.sort((a, b) => {
        // Prioritize matches at the beginning of the string
        // e.g. For the search term "Bar" "Barbados" should be prioritized over Antigua & Barbuda
        // The first two characters are the country code, so we start at index 2
        // and end at the length of the search term
        const optionASubstring = a.searchValue.toLowerCase().substring(2, trimmedSearchValue.length + 2);
        const optionBSubstring = b.searchValue.toLowerCase().substring(2, trimmedSearchValue.length + 2);
        if (optionASubstring === trimmedSearchValue.toLowerCase()) {
            return -1;
        }
        if (optionBSubstring === trimmedSearchValue.toLowerCase()) {
            return 1;
        }
        return 0;
    });

    let fullSorted;
    const unsanitizedSearchValue = searchValue.toLowerCase().trim();
    if (trimmedSearchValue !== unsanitizedSearchValue) {
        // Diacritic detected, prioritize diacritic matches
        // We search for diacritic matches by using the unsanitized country name and search term
        fullSorted = halfSorted.sort((a, b) => {
            const unsanitizedOptionA = a.text.toLowerCase();
            const unsanitizedOptionB = b.text.toLowerCase();
            if (unsanitizedOptionA.includes(unsanitizedSearchValue)) {
                return -1;
            }
            if (unsanitizedOptionB.includes(unsanitizedSearchValue)) {
                return 1;
            }
            return 0;
        });
    } else {
        // Diacritic not detected, prioritize country code matches (country codes can never contain diacritics)
        // E.g. the search term 'US' should push 'United States' to the top
        fullSorted = halfSorted.sort((a, b) => {
            if (a.value.toLowerCase() === trimmedSearchValue) {
                return -1;
            }
            if (b.value.toLowerCase() === trimmedSearchValue) {
                return 1;
            }
            return 0;
        });
    }
    return moveSelectedOptionsToTop(fullSorted, initialSelectedValues);
}

export default searchOptions;
export type {Option};
