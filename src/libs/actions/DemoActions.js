import Str from 'expensify-common/lib/str';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import CONST from '../../CONST';
import * as API from '../API';
import {buildOptimisticWorkspaceChats, buildOptimisticAddCommentReportAction, getPolicyExpenseChatReportIDByOwner} from '../ReportUtils';
import {buildOptimisticCustomUnits, generatePolicyID} from './Policy';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';

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
    }
})

function createSaastrDemoWorkspaceAndNavigate() {
    // Try to navigate to existing SaaStr expense chat if it exists in Onyx
    const saastrWorkspaceChatReportID = getPolicyExpenseChatReportIDByOwner(CONST.EMAIL.SAASTR);
    if (saastrWorkspaceChatReportID) {
        // We must call goBack() to remove the /saastr route from history
        Navigation.goBack();
        Navigation.navigate(ROUTES.getReportRoute(saastrWorkspaceChatReportID));
        return;
    }

    // Create workspace, owned and admin'd by SaaStr
    const policyID = generatePolicyID();

    // Add domain name as prefix (only if domain is private)
    const domainNamePrefix = userIsFromPublicDomain ? `${Str.extractEmailDomain(sessionEmail)} ` : '';
    const workspaceName = `${domainNamePrefix}SaaStr Workspace`;

    const {customUnits, customUnitID, customUnitRateID} = buildOptimisticCustomUnits();

    const {
        announceChatReportID,
        announceChatData,
        announceReportActionData,
        announceCreatedReportActionID,
        // TODO: maybe comment these admin report data out b/c user shouldn't an admin to start with, right? :think:
        adminsChatReportID,
        adminsChatData,
        adminsReportActionData,
        adminsCreatedReportActionID,
        expenseChatReportID,
        expenseChatData,
        expenseReportActionData,
        expenseCreatedReportActionID,
    } = buildOptimisticWorkspaceChats(policyID, workspaceName);

    // Add optimistic invite message comment
    const initialMessageText = `
    Welcome to NewExpensify, who wants $20?

    To scan the receipt and get paid:
    1. Click the +
    2. Click Request Money.
    3. Take a photo of the receipt, we'll automatically enter all the info.
    4. Come say hi at the Expensify booth (#601) and let us know if you have any feedback!
    `;
    const welcomeMessageReportAction = buildOptimisticAddCommentReportAction(initialMessageText);
    welcomeMessageReportAction.reportAction.actorAccountID = CONST.ACCOUNT_ID.SAASTR;
    welcomeMessageReportAction.reportAction.person[0].text = 'SaaStr 2023';
    welcomeMessageReportAction.reportAction.avatar = '';

    // Update policy expense chat report actions with welcome message from saastr
    expenseReportActionData[welcomeMessageReportAction.reportAction.reportActionID] = welcomeMessageReportAction.reportAction;

    // Update report with info about last message sent
    const currentTime = DateUtils.getDBTime();
    expenseChatData.lastVisibleActionCreated = currentTime;
    expenseChatData.lastMessageText = initialMessageText;
    expenseChatData.lastActorAccountID = CONST.ACCOUNT_ID.SAASTR;
    expenseChatData.lastReadTime = currentTime;

    API.write(
        'CreateSaastrDemoWorkspace',
        {
            policyID,
            announceChatReportID,
            adminsChatReportID,
            expenseChatReportID,
            policyName: workspaceName,
            announceCreatedReportActionID,
            adminsCreatedReportActionID,
            expenseCreatedReportActionID,
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
                        owner: CONST.EMAIL.SAASTR,
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
                        [CONST.ACCOUNT_ID.SAASTR]: {
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
                    key: `${ONYXKEYS.COLLECTION.REPORT}${adminsChatReportID}`,
                    value: {
                        pendingFields: {
                            addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        },
                        ...adminsChatData,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsChatReportID}`,
                    value: adminsReportActionData,
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
                    key: `${ONYXKEYS.COLLECTION.REPORT}${adminsChatReportID}`,
                    value: {
                        pendingFields: {
                            addWorkspaceRoom: null,
                        },
                        pendingAction: null,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsChatReportID}`,
                    value: {
                        [_.keys(adminsChatData)[0]]: {
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
                    key: `${ONYXKEYS.COLLECTION.REPORT}${adminsChatReportID}`,
                    value: null,
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsChatReportID}`,
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
        }
    );

    // Navigate to the new workspace chat report
    // We must call goBack() to remove the /saastr route from history
    Navigation.goBack();
    Navigation.navigate(ROUTES.getReportRoute(expenseChatReportID));
}

export {createSaastrDemoWorkspaceAndNavigate};
