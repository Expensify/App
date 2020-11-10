import _ from 'underscore';
import {AllHtmlEntities} from 'html-entities';
import guid from './guid';


const Str = {
    /**
     * Returns the proper phrase depending on the count that is passed.
     * Example:
     * console.log(Str.pluralize('puppy', 'puppies', 1)); // puppy
     * console.log(Str.pluralize('puppy', 'puppies', 3)); // puppies
     *
     * @param {String} singular form of the phrase
     * @param {String} plural form of the phrase
     * @param {Number} n the count which determines the plurality
     *
     * @return {String}
     */
    pluralize(singular, plural, n) {
        if (!n || n > 1) {
            return plural;
        }
        return singular;
    },

    /**
     * Escape text while preventing any sort of double escape, so 'X & Y' -> 'X &amp; Y' and 'X &amp; Y' -> 'X &amp; Y'
     *
     * @param {String} s the string to escape
     * @return {String} the escaped string
     */
    safeEscape(s) {
        return _.escape(_.unescape(s));
    },

    /**
     * Decodes the given HTML encoded string.
     *
     * @param {String} s The string to decode.
     * @return {String} The decoded string.
     */
    htmlDecode(s) {
        return AllHtmlEntities.decode(s);
    },

    /**
     * Convert new line to <br />
     *
     * @param {String} str
     * @returns {string}
     */
    nl2br(str) {
        return str.replace(/\n/g, '<br />');
    },

    /**
     * Generates a random device login using Guid
     *
     * @returns {string}
     */
    generateDeviceLoginID() {
        return `react-native-chat-${guid()}`;
    },

    /**
     * Escapes all special RegExp characters from a string
     *
     * @param {String} string The subject
     *
     * @returns {String} The escaped string
     */
    escapeForRegExp(string) {
        return string.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
    },

    /**
     * Returns true if the haystack begins with the needle
     *
     * @param {String} haystack  The full string to be searched
     * @param {String} needle    The case-sensitive string to search for
     * @returns {Boolean} Returns true if the haystack starts with the needle.
     */
    startsWith(haystack, needle) {
        return _.isString(haystack)
            && _.isString(needle)
            && haystack.substring(0, needle.length) === needle;
    },

    /**
     * Takes in a URL and returns it with a leading '/'
     *
     * @param {mixed} url The URL to be formatted
     * @returns {String} The formatted URL
     */
    normalizeUrl(url) {
        return (typeof url === 'string' && url.startsWith('/')) ? url : `/${url}`;
    },

    /**
     * Checks if parameter is a string or function
     * if it is a function then we will call it with
     * any additional arguments.
     *
     * @param {String|Function} parameter
     * @returns {String}
     */
    result(parameter, ...args) {
        return _.isFunction(parameter)
            ? parameter(...args)
            : parameter;
    },
};

export default Str;
