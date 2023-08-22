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

/**
 * @param {String} workspaceOwnerEmail email of the workspace owner
 * @param {String} apiCommand
 */
function createDemoWorkspaceAndNavigate(workspaceOwnerEmail, apiCommand) {
    // Try to navigate to existing demo workspace expense chat if it exists in Onyx
    const demoWorkspaceChatReportID = ReportUtils.getPolicyExpenseChatReportIDByOwner(workspaceOwnerEmail);
    if (demoWorkspaceChatReportID) {
        // We must call goBack() to remove the demo route from nav history
        Navigation.goBack();
        Navigation.navigate(ROUTES.getReportRoute(demoWorkspaceChatReportID));
        return;
    }

    // We use makeRequestWithSideEffects here because we need to get the workspace chat report ID to navigate to it after it's created
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(apiCommand).then((response) => {
        // Get report updates from Onyx response data
        const reportUpdate = _.find(response.onyxData, ({key}) => key === ONYXKEYS.COLLECTION.REPORT);
        if (!reportUpdate) {
            return;
        }

        // Get the policy expense chat update
        const policyExpenseChatReport = _.find(reportUpdate.value, ({chatType}) => chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
        if (!policyExpenseChatReport) {
            return;
        }

        // Navigate to the new policy expense chat report
        // Note: We must call goBack() to remove the demo route from history
        Navigation.goBack();
        Navigation.navigate(ROUTES.getReportRoute(policyExpenseChatReport.reportID));
    });
}

function runSbeDemo() {
    createDemoWorkspaceAndNavigate(CONST.EMAIL.SBE, 'CreateSbeDemoWorkspace');
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
    }
    if (lodashGet(demoInfo, 'sbe.isBeginningDemo')) {
        return Localize.translateLocal('demos.sbe.signInWelcome');
    }
    return '';
}

export {runSaastrDemo, runSbeDemo, runDemoByURL, getHeadlineKeyByDemoInfo};
