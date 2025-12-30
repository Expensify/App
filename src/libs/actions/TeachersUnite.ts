import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import type {AddSchoolPrincipalParams, ReferTeachersUniteVolunteerParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';
import {buildOptimisticChatReport, buildOptimisticCreatedReportAction} from '@libs/ReportUtils';
import type {OptimisticCreatedReportAction} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type CreationData = {
    reportID: string;
    reportActionID: string;
};

type ReportCreationData = Record<string, CreationData>;

type ExpenseReportActionData = Record<string, OptimisticCreatedReportAction>;

/**
 * @param publicRoomReportID - This is the global reportID for the public room, we'll ignore the optimistic one
 */
function referTeachersUniteVolunteer(partnerUserID: string, firstName: string, lastName: string, policyID: string, publicRoomReportID: string) {
    const optimisticPublicRoom = buildOptimisticChatReport({
        participantList: [],
        reportName: CONST.TEACHERS_UNITE.PUBLIC_ROOM_NAME,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
        policyID,
    });
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${publicRoomReportID}`,
            value: {
                ...optimisticPublicRoom,
                reportID: publicRoomReportID,
                policyName: CONST.TEACHERS_UNITE.POLICY_NAME,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${publicRoomReportID}`,
            value: {
                isOptimisticReport: false,
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
    Navigation.dismissModalWithReport({reportID: publicRoomReportID});
}

/**
 * Optimistically creates a policyExpenseChat for the school principal and passes data to AddSchoolPrincipal
 */
function addSchoolPrincipal(
    firstName: string,
    partnerUserID: string,
    lastName: string,
    policyID: string,
    localCurrencyCode: string | undefined,
    sessionEmail: string,
    sessionAccountID: number,
    optimisticReportID: string,
) {
    const policyName = CONST.TEACHERS_UNITE.POLICY_NAME;
    const loggedInEmail = addSMSDomainIfPhoneNumber(sessionEmail);
    const reportCreationData: ReportCreationData = {};

    const expenseChatData = buildOptimisticChatReport({
        participantList: [sessionAccountID],
        reportName: '',
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        policyID,
        ownerAccountID: sessionAccountID,
        isOwnPolicyExpenseChat: true,
        oldPolicyName: policyName,
        optimisticReportID,
    });
    const expenseChatReportID = expenseChatData.reportID;
    const expenseReportCreatedAction = buildOptimisticCreatedReportAction(sessionEmail);
    const expenseReportActionData: ExpenseReportActionData = {
        [expenseReportCreatedAction.reportActionID]: expenseReportCreatedAction,
    };

    reportCreationData[loggedInEmail] = {
        reportID: expenseChatReportID,
        reportActionID: expenseReportCreatedAction.reportActionID,
    };

    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM | typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM,
            value: {
                isLoading: true,
                errors: null,
            },
        },
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
                outputCurrency: localCurrencyCode ?? CONST.CURRENCY.USD,
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

    const successData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM
            | typeof ONYXKEYS.COLLECTION.POLICY
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM,
            value: {
                isLoading: false,
            },
        },
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
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${expenseChatReportID}`,
            value: {
                isOptimisticReport: false,
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

    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM | typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM,
            value: {
                isLoading: false,
                errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            },
        },
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
}

export default {referTeachersUniteVolunteer, addSchoolPrincipal};
