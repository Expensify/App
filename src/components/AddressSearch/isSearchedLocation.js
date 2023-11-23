import { some } from 'lodash';
/**
 * Check if it is the location by searching for the location
 *
 * @param   {string} search  the string to search for a location
 * @param   {object} location  the location data consisted of name, description and geometry
 * @returns {boolean} related or not.
 */
function isSearchedLocation(search, location) {
    if (!search) {
        return true;
    }
    if (!location) {
        return false;
    }
    let result = false;
    if (location.name) {
        result = some(search.split(" "), (searchTerm) => location.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()));
    }
    if (location.description) {
        result = result || some(search.split(" "), (searchTerm) => location.description.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()));
    }
    return result;
}

export default isSearchedLocation;
