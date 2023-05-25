import hashCode from './hashCode';

/**
 * Hashes provided string and returns a value between [0, range)
 * @param {String} login
 * @param {Number} range
 * @returns {Number}
 */
function hashLogin(login, range) {
    return Math.abs(hashCode(login.toLowerCase())) % range;
}

export default hashLogin;
