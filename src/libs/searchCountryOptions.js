import _ from 'lodash';
import CONST from '../CONST';

/**
 * Searches the countries/states data and returns sorted results based on the search query
 * @param {String} searchValue
 * @param {Object[]} countriesData - An array of country data objects
 * @returns {Object[]} An array of countries/states sorted based on the search query
 */
function searchCountryOptions(searchValue, countriesData) {
    // const trimmedSearchValue = searchValue.toLowerCase().replaceAll(CONST.REGEX.NON_ALPHABETIC_AND_NON_LATIN_CHARS, '');
    const trimmedSearchValue = _.chain(searchValue).deburr().toLower().value().replaceAll(CONST.REGEX.NON_ALPHABETIC_AND_NON_LATIN_CHARS, '');
    if (_.isEmpty(trimmedSearchValue)) {
        return [];
    }

    const filteredData = _.filter(countriesData, (country) => _.includes(_.deburr(country.searchValue), trimmedSearchValue));

    // sort by country code
    return _.sortBy(filteredData, (country) => (_.toLower(country.value) === trimmedSearchValue ? -1 : 1));
}

export default searchCountryOptions;
