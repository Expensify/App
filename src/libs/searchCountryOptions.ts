import StringUtils from './StringUtils';

type CountryData = {
    value: string;
    keyForList: string;
    text: string;
    isSelected: boolean;
    searchValue: string;
};

/**
 * Searches the countries/states data and returns sorted results based on the search query
 * @param countriesData - An array of country data objects
 * @returns An array of countries/states sorted based on the search query
 */
function searchCountryOptions(searchValue: string, countriesData: CountryData[]): CountryData[] {
    if (!searchValue) {
        return countriesData;
    }

    const trimmedSearchValue = StringUtils.sanitizeString(searchValue);
    if (!trimmedSearchValue) {
        return [];
    }
    const filteredData = countriesData.filter((country) => country.searchValue.includes(trimmedSearchValue));

    const halfSorted = filteredData.sort((a, b) => {
        // Prioritize matches at the beginning of the string
        // e.g. For the search term "Bar" "Barbados" should be prioritized over Antigua & Barbuda
        // The first two characters are the country code, so we start at index 2
        // and end at the length of the search term
        const countryNameASubstring = a.searchValue.toLowerCase().substring(2, trimmedSearchValue.length + 2);
        const countryNameBSubstring = b.searchValue.toLowerCase().substring(2, trimmedSearchValue.length + 2);
        if (countryNameASubstring === trimmedSearchValue.toLowerCase()) {
            return -1;
        }
        if (countryNameBSubstring === trimmedSearchValue.toLowerCase()) {
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
            const unsanitizedCountryNameA = a.text.toLowerCase();
            const unsanitizedCountryNameB = b.text.toLowerCase();
            if (unsanitizedCountryNameA.includes(unsanitizedSearchValue)) {
                return -1;
            }
            if (unsanitizedCountryNameB.includes(unsanitizedSearchValue)) {
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
    return fullSorted;
}

export default searchCountryOptions;
export type {CountryData};
