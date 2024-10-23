import {getAllTransactions, getAllTransactionViolationsLength} from '@libs/actions/Transaction';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import {getActivePolicy, getAllPoliciesLength} from '@libs/PolicyUtils';
import {getReportActionsLength} from '@libs/ReportActionsUtils';
import * as ReportConnection from '@libs/ReportConnection';
import * as SessionUtils from '@libs/SessionUtils';
import type {FirebaseAttributes} from './types';

function getAttributes(): FirebaseAttributes {
    const session = SessionUtils.getSession();

    const accountId = session?.accountID?.toString() ?? 'N/A';
    const reportsLength = ReportConnection.getAllReportsLength().toString();
    const reportActionsLength = getReportActionsLength().toString();
    const personalDetailsLength = PersonalDetailsUtils.getPersonalDetailsLength().toString();
    const transactionViolationsLength = getAllTransactionViolationsLength().toString();
    const policiesLength = getAllPoliciesLength().toString();
    const transactionsLength = getAllTransactions().toString();
    const policy = getActivePolicy();

    return {
        accountId,
        reportsLength,
        reportActionsLength,
        personalDetailsLength,
        transactionViolationsLength,
        policiesLength,
        transactionsLength,
        policyType: policy?.type ?? 'N/A',
        policyRole: policy?.role ?? 'N/A',
    };
}

export default {
    getAttributes,
};
