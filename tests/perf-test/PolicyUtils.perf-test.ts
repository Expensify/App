import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import {getMemberAccountIDsForWorkspace, getSubmitToAccountID} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import createCollection from '../utils/collections/createCollection';
import createRandomPolicy from '../utils/collections/policies';
import createRandomPolicyEmployeeList from '../utils/collections/policyEmployeeList';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';

describe('PolicyUtils', () => {
    afterEach(() => {
        return Onyx.clear();
    });

    describe('getMemberAccountIDsForWorkspace', () => {
        test('500 policy members with personal details', async () => {
            const policyEmployeeList = createCollection(
                (_, index) => index,
                () => createRandomPolicyEmployeeList(),
            );

            await measureFunction(() => getMemberAccountIDsForWorkspace(policyEmployeeList));
        });

        test('500 policy members with errors and personal details', async () => {
            const policyEmployeeList = createCollection(
                (_, index) => index,
                () => ({
                    ...createRandomPolicyEmployeeList(),
                    errors: {error: 'Error message'},
                }),
            );

            await measureFunction(() => getMemberAccountIDsForWorkspace(policyEmployeeList));
        });
    });

    describe('getSubmitToAccountID', () => {
        test('submit and close policy', async () => {
            const policy: Policy = {
                ...createRandomPolicy(0),
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                rules: {
                    approvalRules: Array.from(Array(100), () => ({
                        applyWhen: [
                            {
                                condition: CONST.POLICY.RULE_CONDITIONS.MATCHES,
                                field: CONST.POLICY.FIELDS.CATEGORY,
                                value: '',
                            },
                        ],
                        approver: 'approver@gmail.com',
                    })),
                },
            };
            const expenseReport: Report = {
                ...createRandomReport(0, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
            };
            const transactions = createCollection<Transaction>(
                (transaction) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                (index) => ({...createRandomTransaction(index), reportID: expenseReport.reportID}),
                100000,
            );
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, transactions);
            await measureFunction(() => getSubmitToAccountID(policy, expenseReport));
        });

        describe('not a submit and close policy', () => {
            test('policy has category approval rules, but all transactions have no category', async () => {
                const category = 'Car';
                const policy: Policy = {
                    ...createRandomPolicy(0),
                    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                    rules: {
                        approvalRules: Array.from(Array(100), () => ({
                            applyWhen: [
                                {
                                    condition: CONST.POLICY.RULE_CONDITIONS.MATCHES,
                                    field: CONST.POLICY.FIELDS.CATEGORY,
                                    value: category,
                                },
                            ],
                            approver: 'approver@gmail.com',
                        })),
                    },
                };
                const expenseReport: Report = {
                    ...createRandomReport(0, undefined),
                    type: CONST.REPORT.TYPE.EXPENSE,
                };
                const transactions = createCollection<Transaction>(
                    (transaction) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                    (index) => ({...createRandomTransaction(index), reportID: expenseReport.reportID, category: ''}),
                    10000,
                );
                await Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, transactions);
                await measureFunction(() => getSubmitToAccountID(policy, expenseReport));
            });

            test('all transactions have category, but no category approval rules', async () => {
                const policy: Policy = {
                    ...createRandomPolicy(0),
                    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                    rules: {
                        approvalRules: Array.from(Array(100), () => ({
                            applyWhen: [
                                {
                                    condition: CONST.POLICY.RULE_CONDITIONS.MATCHES,
                                    field: CONST.POLICY.FIELDS.TAX,
                                    value: '',
                                },
                            ],
                            approver: 'approver@gmail.com',
                        })),
                    },
                };
                const expenseReport: Report = {
                    ...createRandomReport(0, undefined),
                    type: CONST.REPORT.TYPE.EXPENSE,
                };
                const transactions = createCollection<Transaction>(
                    (transaction) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                    (index) => ({...createRandomTransaction(index), reportID: expenseReport.reportID}),
                    10000,
                );
                await Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, transactions);
                await measureFunction(() => getSubmitToAccountID(policy, expenseReport));
            });
        });
    });
});
