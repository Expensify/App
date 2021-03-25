import _ from 'underscore';
import Str from 'expensify-common/lib/str';

/**
 * Returns the concatenated title for the PrimaryLogins of a report
 *
 * @param {Array} logins
 * @returns {string}
 */
function getReportParticipantsTitle(logins) {
    return _.map(logins, login => Str.removeSMSDomain(login)).join(', ');
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getReportParticipantsTitle,
};
