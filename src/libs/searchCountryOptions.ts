import StringUtils from './StringUtils';

type CountryData = {
    value: string;
    keyForList: string;
    text: string;
    isSelected: boolean;
    searchValue: string;
};

function searchCountryOptions(searchValue: string, countriesData: CountryData[]): CountryData[] {
    if (!searchValue.trim()) {
        return countriesData;
    }

    const trimmedSearchValue = StringUtils.sanitizeString(searchValue.trim());
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
