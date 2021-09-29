import {getBetas} from './User';
import Permissions from '../Permissions';
import {create as createPolicy, getPolicyList, getPolicySummaries} from './Policy';

/**
 * @param {Boolean} shouldCreateNewWorkspace
 */
function loadBetasAndFetchPolicies(shouldCreateNewWorkspace = false) {
    getBetas()
        .then((betas) => {
            if (Permissions.canUseFreePlan(betas) || Permissions.canUseDefaultRooms(betas)) {
                return Promise.all([
                    getPolicyList(),
                    getPolicySummaries(),
                ]);
            }
            return Promise.resolve();
        })
        .then(() => (shouldCreateNewWorkspace ? createPolicy() : Promise.resolve()));
}

export {
    // eslint-disable-next-line import/prefer-default-export
    loadBetasAndFetchPolicies,
};
