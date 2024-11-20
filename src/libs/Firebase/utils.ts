import {getAllTransactions, getAllTransactionViolationsLength} from '@libs/actions/Transaction';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import {getActivePolicy, getAllPoliciesLength} from '@libs/PolicyUtils';
import {getReportActionsLength} from '@libs/ReportActionsUtils';
import * as ReportConnection from '@libs/ReportConnection';
import * as SessionUtils from '@libs/SessionUtils';
import type {PerfAttributes} from './types';

function getAttributes<T extends keyof PerfAttributes>(attributes?: T[]): Pick<PerfAttributes, T> {
    const session = SessionUtils.getSession();
    const policy = getActivePolicy();

    const allAttributes: PerfAttributes = {
        accountId: session?.accountID?.toString() ?? 'N/A',
        reportsLength: ReportConnection.getAllReportsLength().toString(),
        reportActionsLength: getReportActionsLength().toString(),
        personalDetailsLength: PersonalDetailsUtils.getPersonalDetailsLength().toString(),
        transactionViolationsLength: getAllTransactionViolationsLength().toString(),
        policiesLength: getAllPoliciesLength().toString(),
        transactionsLength: getAllTransactions().toString(),
        policyType: policy?.type ?? 'N/A',
        policyRole: policy?.role ?? 'N/A',
    };

    if (attributes && attributes.length > 0) {
        const selectedAttributes = {} as Pick<PerfAttributes, T>;
        attributes.forEach((attribute) => {
            selectedAttributes[attribute] = allAttributes[attribute];
        });
        return selectedAttributes;
    }

    return allAttributes;
}

export default {
    getAttributes,
};
