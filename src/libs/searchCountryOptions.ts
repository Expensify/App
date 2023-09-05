import _ from 'lodash';
import StringUtils from './StringUtils';

type CountryData = {
    value: string;
    keyForList: string;
    text: string;
    isSelected: boolean;
    searchValue: string;
};

function searchCountryOptions(searchValue: string, countriesData: CountryData[]): CountryData[] {
    if (_.isEmpty(searchValue)) {
        return countriesData;
    }

    const trimmedSearchValue = StringUtils.sanitizeString(searchValue);
    if (_.isEmpty(trimmedSearchValue)) {
        return [];
    }

    const filteredData = countriesData.filter((country) => country.searchValue.includes(trimmedSearchValue));

    return _.sortBy(filteredData, (country) => (country.value.toLowerCase() === trimmedSearchValue ? -1 : 1));
}

export default searchCountryOptions;
