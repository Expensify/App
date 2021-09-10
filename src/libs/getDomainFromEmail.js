import _ from 'underscore';

/**
 * Checks if the expiresAt date of a user's ban is before right now
 *
 * @param {String} email
 * @returns {String}
 */
 function getDomainFromEmail(email) {
    if (_.indexOf(email, '@') > -1) {
        return email.split('@')[1];
    }
    return '';
}

export default getDomainFromEmail;