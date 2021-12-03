import _ from 'underscore';
import Str from 'expensify-common/lib/str';

/**
 * Searches for a match when provided with a value
 *
 * @param {String} searchValue
 * @param {String} searchText
 * @param {Set<String>} [participantNames]
 * @param {Boolean} isDefaultChatRoom
 * @returns {Boolean}
 */
function isSearchStringMatch(searchValue, searchText, participantNames = new Set(), isDefaultChatRoom = false) {
    const searchWords = _.map(
        searchValue
            .replace(/,/g, ' ')
            .split(' '),
        word => word.trim(),
    );
    return _.every(searchWords, (word) => {
        const matchRegex = new RegExp(Str.escapeForRegExp(word), 'i');
        const valueToSearch = searchText && searchText.replace(new RegExp(/&nbsp;/g), '');
        return matchRegex.test(valueToSearch) || (!isDefaultChatRoom && participantNames.has(word));
    });
}

export default isSearchStringMatch;
