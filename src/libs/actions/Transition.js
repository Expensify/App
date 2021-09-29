import ROUTES from '../../ROUTES';
import Navigation from '../Navigation/Navigation';
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
        .then(() => (shouldCreateNewWorkspace ? createPolicy() : Promise.resolve()))
        .then(({policyID}) => {
            // In order to navigate to a modal, we first have to dismiss the current modal. But there is no current
            // modal you say? I know, it confuses me too. Without dismissing the current modal, if the user cancels out
            // of the workspace modal, then they will be routed back to
            // /transition/<accountID>/<email>/<authToken>/workspace/<policyID>/card and we don't want that. We want them to go back to `/`
            // and by calling dismissModal(), the /transition/... route is removed from history so the user will get taken to `/`
            // if they cancel out of the new workspace modal.
            Navigation.dismissModal();
            Navigation.navigate(policyID ? ROUTES.getWorkspaceCardRoute(policyID) : ROUTES.HOME);
        });
}

export {
    // eslint-disable-next-line import/prefer-default-export
    loadBetasAndFetchPolicies,
};
