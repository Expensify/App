import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import Navigation from '../Navigation/Navigation';
import CONST from '../../CONST';
import * as ReportUtils from '../ReportUtils';
import * as OptionsListUtils from '../OptionsListUtils';
import * as NumberUtils from '../NumberUtils';
import DateUtils from '../DateUtils';
import * as PersonalDetailsUtils from '../PersonalDetailsUtils';

let sessionEmail = '';
let sessionAccountID = 0;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        sessionEmail = lodashGet(val, 'email', '');
        sessionAccountID = lodashGet(val, 'accountID', 0);
    },
});

let allPersonalDetails;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => (allPersonalDetails = val),
});

/**
 * @param {String} partnerUserID
 * @param {String} firstName
 * @param {String} lastName
 */
function referTeachersUniteVolunteer(partnerUserID, firstName, lastName) {
    const optimisticPublicRoom = ReportUtils.buildOptimisticChatReport([], CONST.TEACHERS_UNITE.PUBLIC_ROOM_NAME, CONST.REPORT.CHAT_TYPE.POLICY_ROOM, CONST.TEACHERS_UNITE.POLICY_ID);
    const {
        optimisticData: personalDetailsOptimisticData,
        successData: personalDetailsSuccessData,
        failureData: personalDetailsFailureData,
    } = PersonalDetailsUtils.getNewPersonalDetailsOnyxData([CONST.TEACHERS_UNITE.PUBLIC_ROOM_ADMIN_LOGIN], [CONST.TEACHERS_UNITE.PUBLIC_ROOM_ADMIN_ID]);

    const reportID = CONST.TEACHERS_UNITE.PUBLIC_ROOM_ID;
    const reportActionID = NumberUtils.rand64();

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                ...optimisticPublicRoom,
                reportID,
                policyName: CONST.TEACHERS_UNITE.POLICY_NAME,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    reportActionID,
                    reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                    message: [
                        {
                            html: `Hey <mention-user>@${sessionEmail}</mention-user>! Thanks for referring your friend <mention-user>@${partnerUserID}</mention-user> to <a href=${CONST.FOOTER.ORG_URL} rel="noreferrer noopener">Expensify.org</a> Teachers Unite. We have gone ahead and reached out to them! We'll continue to share any important announcements here to keep you in the loop about the campaign's impact. If you'd like to refer someone else, just click on Save The World in the app's main menu. Thanks for helping us to Save The World!`,
                            text: `Hey @${sessionEmail}! Thanks for referring your friend @${partnerUserID} to Expensify.org Teachers Unite. We have gone ahead and reached out to them! We'll continue to share any important announcements here to keep you in the loop about the campaign's impact. If you'd like to refer someone else, just click on Save The World in the app's main menu. Thanks for helping us to Save The World!`,
                            isEdited: false,
                            type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                        },
                    ],
                    created: DateUtils.getDBTime(),
                    actorAccountID: CONST.TEACHERS_UNITE.PUBLIC_ROOM_ADMIN_ID,
                    whisperedToAccountIDs: [sessionAccountID],
                },
            },
        },
        ...personalDetailsOptimisticData,
    ];

    const successData = [personalDetailsSuccessData];
    const failureData = [personalDetailsFailureData];

    API.write(
        'ReferTeachersUniteVolunteer',
        {
            publicRoomReportID: optimisticPublicRoom.reportID,
            firstName,
            lastName,
            partnerUserID,
            reportActionID,
        },
        {optimisticData, successData, failureData},
    );

    Navigation.dismissModal(reportID);
}

/**
 * Optimistically creates a policyExpenseChat for the school principal and passes data to AddSchoolPrincipal
 * @param {String} firstName
 * @param {String} partnerUserID
 * @param {String} lastName
 */
function addSchoolPrincipal(firstName, partnerUserID, lastName) {
    const policyName = CONST.TEACHERS_UNITE.POLICY_NAME;
    const policyID = CONST.TEACHERS_UNITE.POLICY_ID;
    const loggedInEmail = OptionsListUtils.addSMSDomainIfPhoneNumber(sessionEmail);
    const reportCreationData = {};

    const expenseChatData = ReportUtils.buildOptimisticChatReport([sessionAccountID], '', CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, policyID, sessionAccountID, true, policyName);
    const expenseChatReportID = expenseChatData.reportID;
    const expenseReportCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(sessionEmail);
    const expenseReportActionData = {
        [expenseReportCreatedAction.reportActionID]: expenseReportCreatedAction,
    };

    reportCreationData[loggedInEmail] = {
        reportID: expenseChatReportID,
        reportActionID: expenseReportCreatedAction.reportActionID,
    };

    API.write(
        'AddSchoolPrincipal',
        {
            firstName,
            lastName,
            partnerUserID,
            reportCreationData: JSON.stringify(reportCreationData),
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    value: {
                        id: policyID,
                        isPolicyExpenseChatEnabled: true,
                        type: CONST.POLICY.TYPE.CORPORATE,
                        name: policyName,
                        role: CONST.POLICY.ROLE.USER,
                        owner: sessionEmail,
                        outputCurrency: lodashGet(allPersonalDetails, [sessionAccountID, 'localCurrencyCode'], CONST.CURRENCY.USD),
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
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
                    },
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
    Navigation.dismissModal(expenseChatReportID);
}

export default {referTeachersUniteVolunteer, addSchoolPrincipal};
