import _ from 'underscore';
import CONST from '../CONST';

/**
 * Searches the countries/states data and returns sorted results based on the search query
 * @param {String} searchValue
 * @param {Object[]} countriesData - An array of country data objects
 * @returns {Object[]} An array of countries/states sorted based on the search query
 */
function searchCountryOptions(searchValue, countriesData) {
    const trimmedSearchValue = searchValue.toLowerCase().replaceAll(CONST.REGEX.NON_ALPHABETIC_AND_NON_LATIN_CHARS, '');
    if (trimmedSearchValue.length === 0) {
        return [];
    }

    const filteredData = _.filter(countriesData, (country) => country.searchValue.includes(trimmedSearchValue));

    // sort by country code
    return _.sortBy(filteredData, (country) => (country.value.toLowerCase() === trimmedSearchValue ? -1 : 1));
}

export default searchCountryOptions;
