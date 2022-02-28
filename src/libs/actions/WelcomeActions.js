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

let toggleCreateMenuFunc;
let isWelcomeActionValid;
let firstTimeNewExpensifyUserStep = CONST.FIRST_TIME_NEW_EXPENSIFY_USER_STEP.WELCOME_PROFILE_SETTING;

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
 * Handle Welcome step value change for first time new expensify user welcome actions
 *
 * @param {Number} val , current step of welcome actions
 */
function handleFirstTimeExpensifyUserStepChange(val) {
    firstTimeNewExpensifyUserStep = val;
    if (!isWelcomeActionValid) {
        return;
    }
    if (val === CONST.FIRST_TIME_NEW_EXPENSIFY_USER_STEP.WELCOME_PROFILE_SETTING) {
        Navigation.navigate(ROUTES.WELCOME_PROFILE_SETTING, 1500);
    }else if (val === CONST.FIRST_TIME_NEW_EXPENSIFY_USER_STEP.GLOBAL_CREATE_MENU) {
        NameValuePair.set(
            CONST.NVP.FIRST_TIME_NEW_EXPENSIFY_USER_STEP,
            CONST.FIRST_TIME_NEW_EXPENSIFY_USER_STEP.FINISH, 
            ONYXKEYS.NVP_FIRST_TIME_NEW_EXPENSIFY_USER_STEP
        );
        toggleCreateMenuFunc();
    }
}

Onyx.connect({
    key: ONYXKEYS.NVP_FIRST_TIME_NEW_EXPENSIFY_USER_STEP,
    callback: val => handleFirstTimeExpensifyUserStepChange(val),
});


/**
 * Trigger welcome action start on first login
 *
 * @param {Object} params
 * @param {Object} params.routes
 * @param {Function} params.toggleCreateMenu
 */
function show({routes, toggleCreateMenu}) {
    toggleCreateMenuFunc = toggleCreateMenu;

    // isWelcomeActionValid = stepCheck();
    // NOTE: This setTimeout is required due to a bug in react-navigation where modals do not display properly in a drawerContent
    // This is a short-term workaround, see this issue for updates on a long-term solution: https://github.com/Expensify/App/issues/5296
    setTimeout(() => { 
        if (firstTimeNewExpensifyUserStep === CONST.FIRST_TIME_NEW_EXPENSIFY_USER_STEP.FINISH) {
            return;
        }
        
        // We want to display the Workspace chat first since that means a user is already in a Workspace and doesn't need to create another one
        const workspaceChatReport = _.find(allReports, report => ReportUtils.isPolicyExpenseChat(report));
        if (workspaceChatReport) {
            Navigation.navigate(ROUTES.getReportRoute(workspaceChatReport.reportID));
        }
  
        // If we are rendering the SidebarScreen at the same time as a workspace route that means we've already created a workspace via workspace/new and should not open the global
        // create menu right now.
        const topRouteName = lodashGet(_.last(routes), 'name', '');
        const isDisplayingWorkspaceRoute = topRouteName.toLowerCase().includes('workspace');
  
        // It's also possible that we already have a workspace policy. In either case we will not toggle the menu but do still want to set the NVP in this case
        // since the user does not need to create a workspace.
        if (!workspaceChatReport && !Policy.isAdminOfFreePolicy(allPolicies) && !isDisplayingWorkspaceRoute) {
            isWelcomeActionValid = true;
            handleFirstTimeExpensifyUserStepChange(firstTimeNewExpensifyUserStep);
        }else{
            isWelcomeActionValid = false;
            NameValuePair.set(
                CONST.NVP.FIRST_TIME_NEW_EXPENSIFY_USER_STEP,
                CONST.FIRST_TIME_NEW_EXPENSIFY_USER_STEP.FINISH, 
                ONYXKEYS.NVP_FIRST_TIME_NEW_EXPENSIFY_USER_STEP
            );
        }
    }, 1500);
}

/**
 * Return current firstTimeNewExpensifyUserStep  
 *
 * @Retusn {number}
 */
function getCurrentWelcomeStep() {
    return firstTimeNewExpensifyUserStep;
} 

export {
    // eslint-disable-next-line import/prefer-default-export
    show,
    getCurrentWelcomeStep,
};
