import Onyx from 'react-native-onyx';
import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {AddSchoolPrincipalParams, ReferTeachersUniteVolunteerParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import Navigation from '@libs/Navigation/Navigation';
import * as PhoneNumber from '@libs/PhoneNumber';
import {getPolicy} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {OptimisticCreatedReportAction} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

type CreationData = {
    reportID: string;
    reportActionID: string;
};

type ReportCreationData = Record<string, CreationData>;

type ExpenseReportActionData = Record<string, OptimisticCreatedReportAction>;

let sessionEmail = '';
let sessionAccountID = 0;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        sessionEmail = value?.email ?? '';
        sessionAccountID = value?.accountID ?? -1;
    },
});

let allPersonalDetails: OnyxEntry<PersonalDetailsList>;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => (allPersonalDetails = value),
});

/**
 * @param publicRoomReportID - This is the global reportID for the public room, we'll ignore the optimistic one
 */
function referTeachersUniteVolunteer(partnerUserID: string, firstName: string, lastName: string, policyID: string, publicRoomReportID: string) {
    const optimisticPublicRoom = ReportUtils.buildOptimisticChatReport([], CONST.TEACHERS_UNITE.PUBLIC_ROOM_NAME, CONST.REPORT.CHAT_TYPE.POLICY_ROOM, policyID);
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${publicRoomReportID}`,
            value: {
                ...optimisticPublicRoom,
                reportID: publicRoomReportID,
                policyName: CONST.TEACHERS_UNITE.POLICY_NAME,
            },
        },
    ];

    const parameters: ReferTeachersUniteVolunteerParams = {
        reportID: publicRoomReportID,
        firstName,
        lastName,
        partnerUserID,
    };

    API.write(WRITE_COMMANDS.REFER_TEACHERS_UNITE_VOLUNTEER, parameters, {optimisticData});
    Navigation.dismissModal(publicRoomReportID);
}

/**
 * Optimistically creates a policyExpenseChat for the school principal and passes data to AddSchoolPrincipal
 */
function addSchoolPrincipal(firstName: string, partnerUserID: string, lastName: string, policyID: string) {
    const policyName = CONST.TEACHERS_UNITE.POLICY_NAME;
    const loggedInEmail = PhoneNumber.addSMSDomainIfPhoneNumber(sessionEmail);
    const reportCreationData: ReportCreationData = {};

    const expenseChatData = ReportUtils.buildOptimisticChatReport([sessionAccountID], '', CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, policyID, sessionAccountID, true, policyName);
    const expenseChatReportID = expenseChatData.reportID;
    const expenseReportCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(sessionEmail);
    const expenseReportActionData: ExpenseReportActionData = {
        [expenseReportCreatedAction.reportActionID]: expenseReportCreatedAction,
    };

    reportCreationData[loggedInEmail] = {
        reportID: expenseChatReportID,
        reportActionID: expenseReportCreatedAction.reportActionID,
    };

    const optimisticData: OnyxUpdate[] = [
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
                outputCurrency: getPolicy(policyID)?.outputCurrency ?? allPersonalDetails?.[sessionAccountID]?.localCurrencyCode ?? CONST.CURRENCY.USD,
                employeeList: {
                    [sessionEmail]: {
                        role: CONST.POLICY.ROLE.USER,
                        errors: {},
                    },
                },
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
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
    ];

    const successData: OnyxUpdate[] = [
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
                [Object.keys(expenseChatData).at(0) ?? '']: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                [sessionEmail]: null,
            },
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
    ];

    const parameters: AddSchoolPrincipalParams = {
        firstName,
        lastName,
        partnerUserID,
        policyID,
        reportCreationData: JSON.stringify(reportCreationData),
    };

    API.write(WRITE_COMMANDS.ADD_SCHOOL_PRINCIPAL, parameters, {optimisticData, successData, failureData});
    Navigation.dismissModal(expenseChatReportID);
}

export default {referTeachersUniteVolunteer, addSchoolPrincipal};
