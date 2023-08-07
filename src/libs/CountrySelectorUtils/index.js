import CONST from '../../CONST';

/**
 * Searches the countriesData and returns sorted results based on country code
 * @param {String} searchValue
 * @param {Object} countriesData
 * @returns
 */
function searchOptions(searchValue, countriesData) {
    const trimmedSearchValue = searchValue.toLowerCase().replaceAll(CONST.REGEX.NON_ALPHABETIC_AND_NON_LATIN_CHARS, '');
    if (trimmedSearchValue.length === 0) {
        return [];
    }

    const filteredData = _.filter(countriesData, (country) => country.searchValue.includes(trimmedSearchValue));

    // sort by country code
    return _.sortBy(filteredData, (country) => (country.value.toLowerCase() === trimmedSearchValue ? -1 : 1));
}

export default searchOptions;
