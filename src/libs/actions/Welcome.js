import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import Navigation from '../Navigation/Navigation';
import * as ReportUtils from '../ReportUtils';
import ROUTES from '../../ROUTES';
import * as Policy from './Policy';
import ONYXKEYS from '../../ONYXKEYS';
import NameValuePair from './NameValuePair';
import CONST from '../../CONST';

let resolveIsReadyPromise;
let isReadyPromise = new Promise((resolve) => {
    resolveIsReadyPromise = resolve;
});

let isFirstTimeNewExpensifyUser;
let isLoadingReportData = true;
let isLoadingPolicyData = true;
let email = '';

/**
 * Check that a few requests have completed so that the welcome action can proceed:
 *
 * - Whether we are a first time new expensify user
 * - Whether we have loaded all policies the server knows about
 * - Whether we have loaded all reports the server knows about
 */
function checkOnReady() {
    if (!_.isBoolean(isFirstTimeNewExpensifyUser) || isLoadingPolicyData || isLoadingReportData) {
        return;
    }

    resolveIsReadyPromise();
}

Onyx.connect({
    key: ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER,
    initWithStoredValues: false,
    callback: (val) => {
        isFirstTimeNewExpensifyUser = val;
        checkOnReady();
    },
});

Onyx.connect({
    key: ONYXKEYS.IS_LOADING_REPORT_DATA,
    initWithStoredValues: false,
    callback: (val) => {
        isLoadingReportData = val;
        checkOnReady();
    },
});

Onyx.connect({
    key: ONYXKEYS.IS_LOADING_POLICY_DATA,
    initWithStoredValues: false,
    callback: (val) => {
        isLoadingPolicyData = val;
        checkOnReady();
    },
});

const allReports = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    initWithStoredValues: false,
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

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val, key) => {
        if (!val || !key) {
            return;
        }

        email = val.email;
    },
});

/**
 * Shows a welcome action on first login
 *
 * @param {Object} params
 * @param {Object} params.routes
 * @param {Function} params.showCreateMenu
 */
function show({routes, showCreateMenu}) {
    isReadyPromise.then(() => {
        if (!isFirstTimeNewExpensifyUser) {
            return;
        }

        // Set the NVP back to false so we don't automatically run welcome actions again
        NameValuePair.set(CONST.NVP.IS_FIRST_TIME_NEW_EXPENSIFY_USER, false, ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER);

        // We want to display the Workspace chat first since that means a user is already in a Workspace and doesn't need to create another one
        const workspaceChatReport = _.find(allReports, report => ReportUtils.isPolicyExpenseChat(report) && report.ownerEmail === email);
        if (workspaceChatReport) {
            Navigation.navigate(ROUTES.getReportRoute(workspaceChatReport.reportID));
            return;
        }

        // If we are rendering the SidebarScreen at the same time as a workspace route that means we've already created a workspace via workspace/new and should not open the global
        // create menu right now.
        const topRouteName = lodashGet(_.last(routes), 'name', '');
        const loginWithShortLivedTokenRoute = _.find(routes, route => route.name === 'LogInWithShortLivedToken');
        const exitingToWorkspaceRoute = lodashGet(loginWithShortLivedTokenRoute, 'params.exitTo', '') === 'workspace/new';
        const isDisplayingWorkspaceRoute = topRouteName.toLowerCase().includes('workspace') || exitingToWorkspaceRoute;

        // If user is not already an admin of a free policy and we are not navigating them to their workspace or creating a new workspace via workspace/new then
        // we will show the create menu.
        if (!Policy.isAdminOfFreePolicy(allPolicies) && !isDisplayingWorkspaceRoute) {
            showCreateMenu();
        }
    });
}

function resetReadyCheck() {
    isReadyPromise = new Promise((resolve) => {
        resolveIsReadyPromise = resolve;
    });
}

export {
    show,
    resetReadyCheck,
};
