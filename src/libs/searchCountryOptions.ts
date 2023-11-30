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

    return filteredData.sort((a, b) => {
        if (a.value.toLowerCase() === trimmedSearchValue) {
            return -1;
        }
        if (b.value.toLowerCase() === trimmedSearchValue) {
            return 1;
        }
        return 0;
    });
}

export default searchCountryOptions;
