import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import Navigation from '../Navigation/Navigation';
import CONST from '../../CONST';
import * as ReportUtils from '../ReportUtils';

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
 * @param {String} reportID
 * @param {String} values.firstName
 * @param {String} values.phoneOrEmail
 * @param {String} [values.lastName]
 */

function referTeachersUniteVolunteer(reportID, firstName, phoneOrEmail, lastName = '') {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                firstName,
                lastName,
                phoneOrEmail,
            },
        },
    ];
    API.write(
        'ReferTeachersUniteVolunteer',
        {
            reportID,
            firstName,
            lastName,
            phoneOrEmail,
        },
        {optimisticData},
    );
    Navigation.dismissModal(CONST.TEACHER_UNITE.PUBLIC_ROOM_ID);
}

/**
 * Optimistically creates a policyExpenseChat for schoolPrincipal and pass data to AddSchoolPrincipal
 * @param {String} firstName
 * @param {String} email
 * @param {String} [lastName]
 */

function createExpenseChatSchoolPrincipal(firstName, email, lastName = '') {
    const policyName = 'TeacherUniteSchoolPrincipal';
    const policyID = CONST.TEACHER_UNITE.SCHOOL_PRINCIPAL_POLICY_ID;

    const {expenseChatReportID, expenseChatData, expenseReportActionData, expenseCreatedReportActionID} = ReportUtils.buildOptimisticExpenseChatForSchoolPrincipal(policyID, policyName);

    API.write(
        'AddSchoolPrincipal',
        {
            firstName,
            lastName,
            email,
            expenseCreatedReportActionID,
            policyExpenseChatReportID: expenseChatReportID,
            policyExpenseCreatedReportActionID: expenseCreatedReportActionID,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    value: {
                        id: policyID,
                        type: CONST.POLICY.TYPE.FREE,
                        name: policyName,
                        role: CONST.POLICY.ROLE.ADMIN,
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
                            role: CONST.POLICY.ROLE.ADMIN,
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

export default {referTeachersUniteVolunteer, createExpenseChatSchoolPrincipal};
