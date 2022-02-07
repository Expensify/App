import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as OptionsListUtils from '../OptionsListUtils';

let persistedRequests;
Onyx.connect({
    key: ONYXKEYS.NETWORK_REQUEST_QUEUE,
    callback: (val) => {
        if (!val) {
            return;
        }
        persistedRequests = val;
    },
});

/**
 * Modify persisted request of Policy_Employees_Merge API
 * After user invite a user to a workspace in offline mode and then
 * want to remove it, this function will modify Request_Policy_Employees_Merge
 * request and exclude the removed emails from API request
 *
 * @param {String} policyID
 * @param {Array<String>} logins
 */
function modifyPersistedRequest_Policy_Employees_Merge(policyID, logins) {
    const commandName = 'Policy_Employees_Merge';
    let isModified = false;
    const updatedPersistedRequest = _.compact(_.map(
        persistedRequests,
        (req) => {
            if (req.command !== commandName || req.data.policyID !== policyID) {
                return req;
            }

            const reqEmployees = _.pluck(JSON.parse(req.data.employees), 'email');
            const removedLogins = _.intersection(reqEmployees, logins);
            if (_.isEmpty(removedLogins)) {
                return req;
            }

            isModified = true;
            const newlogins = _.without(reqEmployees, ...removedLogins);
            if (_.isEmpty(newlogins)) {
                return null;
            }
            const removedLoginsRequest = _.clone(req);
            removedLoginsRequest.data.employees = JSON.stringify(
                _.map(newlogins, login => ({email: OptionsListUtils.addSMSDomainIfPhoneNumber(login)})),
            );

            return removedLoginsRequest;
        },
    ));

    if (isModified) {
        Onyx.set(ONYXKEYS.NETWORK_REQUEST_QUEUE, updatedPersistedRequest);
    }
}

export default {
    modifyPersistedRequest_Policy_Employees_Merge,
};
