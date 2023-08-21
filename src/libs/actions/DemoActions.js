import Str from 'expensify-common/lib/str';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import CONST from '../../CONST';
import * as API from '../API';
import * as ReportUtils from '../ReportUtils';
import * as Policy from './Policy';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';
import DateUtils from '../DateUtils';

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
 * @param {String} workspaceName
 * @param {String} welcomeNoteText
 * @param {Number} adminAccountID
 * @param {String} apiCommand
 */
function createDemoWorkspaceAndNavigate(workspaceOwnerEmail, workspaceName, welcomeNoteText, adminAccountID, apiCommand) {
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

    // Create workspace, owned and admin'd by passed email
    const policyID = Policy.generatePolicyID();
    
    const {customUnits, customUnitID, customUnitRateID} = Policy.buildOptimisticCustomUnits();
    const {
        announceChatReportID,
        announceChatData,
        announceReportActionData,
        announceCreatedReportActionID,
        expenseChatReportID,
        expenseChatData,
        expenseReportActionData,
        expenseCreatedReportActionID,
    } = ReportUtils.buildOptimisticWorkspaceChats(policyID, workspaceName);

    // Add optimistic invite message comment
    const welcomeMessageReportAction = ReportUtils.buildOptimisticAddCommentReportAction(welcomeNoteText);
    welcomeMessageReportAction.reportAction.actorAccountID = adminAccountID;
    welcomeMessageReportAction.reportAction.person[0].text = '';
    welcomeMessageReportAction.reportAction.avatar = '';

    // Update policy expense chat report actions with welcome message
    const expenseChatWelcomeReportActionID = welcomeMessageReportAction.reportAction.reportActionID;
    expenseReportActionData[expenseChatWelcomeReportActionID] = welcomeMessageReportAction.reportAction;

    // Update report with info about last message sent
    const currentTime = DateUtils.getDBTime();
    expenseChatData.lastVisibleActionCreated = currentTime;
    expenseChatData.lastMessageText = welcomeNoteText.replace(CONST.REGEX.AFTER_FIRST_LINE_BREAK, '').substring(0, CONST.REPORT.LAST_MESSAGE_TEXT_MAX_LENGTH).trim();
    expenseChatData.lastActorAccountID = adminAccountID;
    expenseChatData.lastReadTime = currentTime;

    API.write(
        apiCommand,
        {
            policyID,
            announceChatReportID,
            expenseChatReportID,
            policyName: workspaceName,
            announceCreatedReportActionID,
            expenseCreatedReportActionID,
            expenseChatWelcomeReportActionID,
            customUnitID,
            customUnitRateID,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    value: {
                        id: policyID,
                        type: CONST.POLICY.TYPE.FREE,
                        name: workspaceName,
                        role: CONST.POLICY.ROLE.USER,
                        owner: workspaceOwnerEmail,
                        outputCurrency: CONST.CURRENCY.USD,
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        customUnits,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`,
                    value: {
                        [sessionAccountID]: {
                            role: CONST.POLICY.ROLE.USER,
                            errors: {},
                        },
                        [adminAccountID]: {
                            role: CONST.POLICY.ROLE.ADMIN,
                            errors: {},
                        },
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${announceChatReportID}`,
                    value: {
                        pendingFields: {
                            addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        },
                        ...announceChatData,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceChatReportID}`,
                    value: announceReportActionData,
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${expenseChatReportID}`,
                    value: {
                        pendingFields: {
                            addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        },
                        ...expenseChatData,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseChatReportID}`,
                    value: expenseReportActionData,
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    value: {pendingAction: null},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${announceChatReportID}`,
                    value: {
                        pendingFields: {
                            addWorkspaceRoom: null,
                        },
                        pendingAction: null,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceChatReportID}`,
                    value: {
                        [_.keys(announceChatData)[0]]: {
                            pendingAction: null,
                        },
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${expenseChatReportID}`,
                    value: {
                        pendingFields: {
                            addWorkspaceRoom: null,
                        },
                        pendingAction: null,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseChatReportID}`,
                    value: {
                        [_.keys(expenseChatData)[0]]: {
                            pendingAction: null,
                        },
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`,
                    value: null,
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${announceChatReportID}`,
                    value: null,
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceChatReportID}`,
                    value: null,
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${expenseChatReportID}`,
                    value: null,
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseChatReportID}`,
                    value: null,
                },
            ],
        },
    );

    // Navigate to the new workspace chat report
    // We must call goBack() to remove the demo route from history
    Navigation.goBack();
    Navigation.navigate(ROUTES.getReportRoute(expenseChatReportID));
}

function runSbeDemo() {
    // Add domain name as prefix (only if domain is private)
    const domainNamePrefix = userIsFromPublicDomain ? `${Str.extractEmailDomain(sessionEmail)} ` : '';
    const workspaceName = `${domainNamePrefix}SBE Workspace`;

    const welcomeNoteText = `
    Thanks for testing out New Expensify!
    
    Get paid back for your journey to or from Small Business Expo, whether you're driving yourself or catching a ride:
    
    1. Click the "+" > Request money > Distance.
    2. Enter your start and end addresses.
    3. Get paid back at the IRS mileage rate of $0.655/mile!
    
    Note: Must submit by Thursday, September 7th, 2023. One reimbursement per person.`;

    createDemoWorkspaceAndNavigate(CONST.EMAIL.SBE, workspaceName, welcomeNoteText, CONST.ACCOUNT_ID.SBE, '');
}

function runSaastrDemo() {
    // Add domain name as prefix (only if domain is private)
    const domainNamePrefix = userIsFromPublicDomain ? `${Str.extractEmailDomain(sessionEmail)} ` : '';
    const workspaceName = `${domainNamePrefix}SaaStr Workspace`;

    const welcomeNoteText = `
    Welcome to NewExpensify, who wants $20?

    To scan the receipt and get paid:
    1. Click the +
    2. Click Request Money.
    3. Take a photo of the receipt, we'll automatically enter all the info.
    4. Come say hi at the Expensify booth (#601) and let us know if you have any feedback!`;

    createDemoWorkspaceAndNavigate(CONST.EMAIL.SAASTR, workspaceName, welcomeNoteText, CONST.ACCOUNT_ID.SAASTR, 'CreateSaastrDemoWorkspace');
}

export {
    runSaastrDemo,
    runSbeDemo,
};
