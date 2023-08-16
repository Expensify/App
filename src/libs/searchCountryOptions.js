import _ from 'lodash';
import StringUtils from './StringUtils';

/**
 * Searches the countries/states data and returns sorted results based on the search query
 * @param {String} searchValue
 * @param {Object[]} countriesData - An array of country data objects
 * @returns {Object[]} An array of countries/states sorted based on the search query
 */
function searchCountryOptions(searchValue, countriesData) {
    const trimmedSearchValue = StringUtils.sanitizeString(searchValue);
    if (_.isEmpty(trimmedSearchValue)) {
        return [];
    }

    const filteredData = _.filter(countriesData, (country) => _.includes(country.searchValue, trimmedSearchValue));

    // sort by country code
    return _.sortBy(filteredData, (country) => (_.toLower(country.value) === trimmedSearchValue ? -1 : 1));
}

export default searchCountryOptions;
