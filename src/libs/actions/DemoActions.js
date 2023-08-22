import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import CONST from '../../CONST';
import * as API from '../API';
import * as ReportUtils from '../ReportUtils';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';
import * as Localize from '../Localize';

let sessionAccountID = 0;
let sessionEmail = 0;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        sessionAccountID = lodashGet(val, 'accountID', 0);
        sessionEmail = lodashGet(val, 'email', '');
    },
});

let userIsFromPublicDomain;
Onyx.connect({
    key: ONYXKEYS.USER,
    callback: (val) => {
        if (!val) {
            return;
        }
        userIsFromPublicDomain = val.isFromPublicDomain;
    },
});

/**
 * @param {String} workspaceOwnerEmail email of the workspace owner
 * @param {String} apiCommand
 */
function createDemoWorkspaceAndNavigate(workspaceOwnerEmail, apiCommand) {
    // If we don't have a command name to call, just go back so the user is navigated home
    if (!apiCommand) {
        Navigation.goBack();
        return;
    }
    
    // Try to navigate to existing demo workspace expense chat if it exists in Onyx
    const demoWorkspaceChatReportID = ReportUtils.getPolicyExpenseChatReportIDByOwner(workspaceOwnerEmail);
    if (demoWorkspaceChatReportID) {
        // We must call goBack() to remove the demo route from nav history
        Navigation.goBack();
        Navigation.navigate(ROUTES.getReportRoute(demoWorkspaceChatReportID));
        return;
    }

    API.makeRequestWithSideEffects(apiCommand, {})
        .then((response) => {
            // Navigate to the new workspace chat report
            // We must call goBack() to remove the demo route from history
            Navigation.goBack();
            Navigation.navigate(ROUTES.getReportRoute(response.expenseChatReportID));
        });

}

function runSbeDemo() {
    createDemoWorkspaceAndNavigate(CONST.EMAIL.SBE, '');
}

function runSaastrDemo() {
    createDemoWorkspaceAndNavigate(CONST.EMAIL.SAASTR, 'CreateSaastrDemoWorkspace');
}

/**
 * Runs code for specific demos, based on the provided URL
 *
 * @param {String} url - URL user is navigating to via deep link (or regular link in web)
 */
function runDemoByURL(url = '') {
    const cleanUrl = (url || '').toLowerCase();

    if (cleanUrl.endsWith(ROUTES.SAASTR)) {
        Onyx.set(ONYXKEYS.DEMO_INFO, {
            saastr: {
                isBeginningDemo: true,
            },
        });
    } else if (cleanUrl.endsWith(ROUTES.SBE)) {
        Onyx.set(ONYXKEYS.DEMO_INFO, {
            sbe: {
                isBeginningDemo: true,
            },
        });
    } else {
        // No demo is being run, so clear out demo info
        Onyx.set(ONYXKEYS.DEMO_INFO, null);
    }
}

function getHeadlineKeyByDemoInfo(demoInfo = {}) {
    if (lodashGet(demoInfo, 'saastr.isBeginningDemo')) {
        return Localize.translateLocal('demos.saastr.signInWelcome');
    } else if (lodashGet(demoInfo, 'sbe.isBeginningDemo')) {
        return Localize.translateLocal('demos.sbe.signInWelcome');
    }
    return '';
}

export {
    runSaastrDemo,
    runSbeDemo,
    runDemoByURL,
    getHeadlineKeyByDemoInfo,
};
