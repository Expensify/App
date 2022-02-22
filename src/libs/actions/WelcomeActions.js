import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import Navigation from '../Navigation/Navigation';
import * as ReportUtils from '../reportUtils';
import ROUTES from '../../ROUTES';
import * as Policy from './Policy';
import ONYXKEYS from '../../ONYXKEYS';
import NameValuePair from './NameValuePair';
import CONST from '../../CONST';

/* Flag for new users used to show welcome actions on first load */
let isFirstTimeNewExpensifyUser = false;
Onyx.connect({
    key: ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER,
    callback: val => isFirstTimeNewExpensifyUser = val,
});

const allReports = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (val, key) => {
        if (!val || !key) {
            return;
        }

        allReports[key] = {...allReports[key], ...val};
    },
});

const allPolicies = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (val, key) => {
        if (!val || !key) {
            return;
        }

        allPolicies[key] = {...allPolicies[key], ...val};
    },
});

/**
 * Shows a welcome action on first login
 *
 * @param {Object} params
 * @param {Object} params.routes
 * @param {Function} params.toggleCreateMenu
 */
function show({routes, toggleCreateMenu}) {
    console.log(isFirstTimeNewExpensifyUser)
    if (!isFirstTimeNewExpensifyUser) {
        return;
    }

    // Set the NVP back to false so we don't automatically run welcome actions again
    NameValuePair.set(CONST.NVP.IS_FIRST_TIME_NEW_EXPENSIFY_USER, false, ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER);

    // We want to display the Workspace chat first since that means a user is already in a Workspace and doesn't need to create another one
    const workspaceChatReport = _.find(allReports, report => ReportUtils.isPolicyExpenseChat(report));
    if (workspaceChatReport) {
        Navigation.navigate(ROUTES.getReportRoute(workspaceChatReport.reportID));
        return;
    }

    // If we are rendering the SidebarScreen at the same time as a workspace route that means we've already created a workspace via workspace/new and should not open the global
    // create menu right now.
    const topRouteName = lodashGet(_.last(routes), 'name', '');
    const isDisplayingWorkspaceRoute = topRouteName.toLowerCase().includes('workspace');

    // It's also possible that we already have a workspace policy. In either case we will not toggle the menu but do still want to set the NVP in this case
    // since the user does not need to create a workspace.
    if (!Policy.isAdminOfFreePolicy(allPolicies) && !isDisplayingWorkspaceRoute) {
        // NOTE: This setTimeout is required due to a bug in react-navigation where modals do not display properly in a drawerContent
        // This is a short-term workaround, see this issue for updates on a long-term solution: https://github.com/Expensify/App/issues/5296
        setTimeout(() => {
            toggleCreateMenu();
        }, 1500);
    }
}

export {
    // eslint-disable-next-line import/prefer-default-export
    show,
};
