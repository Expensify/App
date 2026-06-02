import type * as NativeNavigation from '@react-navigation/native';
import {act, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import MoneyReportView from '@components/ReportActionItem/MoneyReportView';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
        toLocaleDigit: jest.fn((digit: string) => digit),
    })),
);

jest.mock('@react-navigation/native', () => ({
    ...((): typeof NativeNavigation => jest.requireActual('@react-navigation/native'))(),
    useNavigation: jest.fn(() => ({navigate: jest.fn(), addListener: jest.fn(() => jest.fn())})),
    useIsFocused: jest.fn(() => true),
    useRoute: jest.fn(() => ({key: '', name: '', params: {reportID: '1'}})),
}));

jest.mock('@pages/inbox/report/AnimatedEmptyStateBackground', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string}>>>('react-native');
    return () => <RN.View testID="animated-bg" />;
});

TestHelper.setupGlobalFetchMock();

const policyID = 'policy_mrv_breakdown';
const reportID = 'report_mrv_breakdown';

const buildExpenseReport = (overrides: Partial<OnyxTypes.Report> = {}): OnyxTypes.Report => ({
    ...LHNTestUtils.getFakeReport([1, 2]),
    reportID,
    type: CONST.REPORT.TYPE.EXPENSE,
    policyID,
    currency: CONST.CURRENCY.USD,
    total: 0,
    ...overrides,
});

const buildTransaction = (id: string, amount: number, reimbursable: boolean | undefined, billable = false, taxAmount = 0): OnyxTypes.Transaction =>
    ({
        transactionID: id,
        reportID,
        amount,
        currency: CONST.CURRENCY.USD,
        created: '2025-06-01',
        merchant: 'Merchant',
        comment: {},
        reimbursable,
        billable,
        taxAmount,
    }) as OnyxTypes.Transaction;

const seedReportAndTransactions = async (transactions: OnyxTypes.Transaction[], reportOverrides: Partial<OnyxTypes.Report> = {}) => {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
            id: policyID,
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            name: 'Policy',
            outputCurrency: CONST.CURRENCY.USD,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, buildExpenseReport(reportOverrides));
        for (const transaction of transactions) {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
        }
    });
    await waitForBatchedUpdatesWithAct();
};

const renderMoneyReportView = (report: OnyxTypes.Report, policy: OnyxTypes.Policy | undefined = undefined, extraProps: Partial<React.ComponentProps<typeof MoneyReportView>> = {}) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider]}>
            <MoneyReportView
                report={report}
                policy={policy}
                shouldHideThreadDividerLine={false}
                shouldShowAnimatedBackground={false}
                {...extraProps}
            />
        </ComposeProviders>,
    );

// The divider has no testID, so find it by its `reportHorizontalRule` style in the tree.
const hasThreadDivider = (node: unknown): boolean => {
    if (Array.isArray(node)) {
        return node.some(hasThreadDivider);
    }
    if (!node || typeof node !== 'object') {
        return false;
    }
    const {props, children} = node as {props?: {style?: unknown}; children?: unknown};
    const styleStr = JSON.stringify(props?.style ?? '');
    if (styleStr.includes('borderColor') && styleStr.includes('borderBottomWidth')) {
        return true;
    }
    return hasThreadDivider(children);
};

describe('MoneyReportView reimbursable/non-reimbursable breakdown rows', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('hides both breakdown rows for a single non-reimbursable expense', async () => {
        const transactions = [buildTransaction('t1', 5000, false)];
        await seedReportAndTransactions(transactions, {nonReimbursableTotal: -5000, unheldNonReimbursableTotal: -5000});

        renderMoneyReportView(buildExpenseReport({nonReimbursableTotal: -5000, unheldNonReimbursableTotal: -5000}));
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByText('cardTransactions.outOfPocket')).not.toBeOnTheScreen();
            expect(screen.queryByText('cardTransactions.companySpend')).not.toBeOnTheScreen();
        });
    });

    it('hides the Total row and the divider for a single expense with no report-level rows above it', async () => {
        const transactions = [buildTransaction('t1', 5000, false)];
        await seedReportAndTransactions(transactions, {nonReimbursableTotal: -5000, unheldNonReimbursableTotal: -5000});

        const {toJSON} = renderMoneyReportView(buildExpenseReport({nonReimbursableTotal: -5000, unheldNonReimbursableTotal: -5000}));
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByText('common.total')).not.toBeOnTheScreen();
            expect(hasThreadDivider(toJSON())).toBe(false);
        });
    });

    it('shows the Total row when multiple expenses exist', async () => {
        const transactions = [buildTransaction('t1', 5000, false), buildTransaction('t2', 3000, false)];
        await seedReportAndTransactions(transactions, {nonReimbursableTotal: -8000, unheldNonReimbursableTotal: -8000, unheldTotal: -8000, total: -8000});

        renderMoneyReportView(buildExpenseReport({nonReimbursableTotal: -8000, unheldNonReimbursableTotal: -8000, unheldTotal: -8000, total: -8000}));
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText('common.total')).toBeOnTheScreen();
        });
    });

    it('shows both breakdown rows when reimbursable and non-reimbursable transactions coexist', async () => {
        const transactions = [buildTransaction('t1', 5000, true), buildTransaction('t2', 3000, false)];
        await seedReportAndTransactions(transactions, {nonReimbursableTotal: -3000, unheldNonReimbursableTotal: -3000, unheldTotal: -8000, total: -8000});

        renderMoneyReportView(buildExpenseReport({nonReimbursableTotal: -3000, unheldNonReimbursableTotal: -3000, unheldTotal: -8000, total: -8000}));
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText('cardTransactions.outOfPocket')).toBeOnTheScreen();
            expect(screen.getByText('cardTransactions.companySpend')).toBeOnTheScreen();
        });
    });

    it('hides every report-level row for a single billable expense (the amount lives on the expense field)', async () => {
        const transactions = [buildTransaction('t1', 5000, false, true)];
        await seedReportAndTransactions(transactions, {nonReimbursableTotal: -5000, unheldNonReimbursableTotal: -5000});

        renderMoneyReportView(buildExpenseReport({nonReimbursableTotal: -5000, unheldNonReimbursableTotal: -5000}));
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByText('common.billable')).not.toBeOnTheScreen();
            expect(screen.queryByText('cardTransactions.outOfPocket')).not.toBeOnTheScreen();
            expect(screen.queryByText('cardTransactions.companySpend')).not.toBeOnTheScreen();
        });
    });

    it('shows the billable row when multiple expenses exist', async () => {
        const transactions = [buildTransaction('t1', 5000, false, true), buildTransaction('t2', 3000, false, true)];
        await seedReportAndTransactions(transactions, {nonReimbursableTotal: -8000, unheldNonReimbursableTotal: -8000});

        renderMoneyReportView(buildExpenseReport({nonReimbursableTotal: -8000, unheldNonReimbursableTotal: -8000}));
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText('common.billable')).toBeOnTheScreen();
        });
    });

    it('hides the report-level tax row for a single taxed expense (the converted tax is shown on the expense field instead)', async () => {
        const policy = {
            id: policyID,
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            name: 'Policy',
            outputCurrency: CONST.CURRENCY.USD,
            tax: {trackingEnabled: true},
        } as OnyxTypes.Policy;
        const transactions = [buildTransaction('t1', 5000, false, false, 500)];
        await seedReportAndTransactions(transactions, {nonReimbursableTotal: -5000, unheldNonReimbursableTotal: -5000});

        renderMoneyReportView(buildExpenseReport({nonReimbursableTotal: -5000, unheldNonReimbursableTotal: -5000}), policy);
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByText('common.tax')).not.toBeOnTheScreen();
            expect(screen.queryByText('cardTransactions.outOfPocket')).not.toBeOnTheScreen();
            expect(screen.queryByText('cardTransactions.companySpend')).not.toBeOnTheScreen();
        });
    });

    it('shows the report-level tax row when multiple taxed expenses exist', async () => {
        const policy = {
            id: policyID,
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            name: 'Policy',
            outputCurrency: CONST.CURRENCY.USD,
            tax: {trackingEnabled: true},
        } as OnyxTypes.Policy;
        const transactions = [buildTransaction('t1', 5000, false, false, 500), buildTransaction('t2', 3000, false, false, 300)];
        await seedReportAndTransactions(transactions, {nonReimbursableTotal: -8000, unheldNonReimbursableTotal: -8000});

        renderMoneyReportView(buildExpenseReport({nonReimbursableTotal: -8000, unheldNonReimbursableTotal: -8000}), policy);
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText('common.tax')).toBeOnTheScreen();
        });
    });

    it('still shows both breakdown rows when reimbursable expenses + credits net to zero alongside non-reimbursable spend', async () => {
        const transactions = [buildTransaction('t1', 5000, true), buildTransaction('t2', -5000, true), buildTransaction('t3', 3000, false)];
        await seedReportAndTransactions(transactions, {nonReimbursableTotal: -3000, unheldNonReimbursableTotal: -3000, unheldTotal: -3000, total: -3000});

        renderMoneyReportView(buildExpenseReport({nonReimbursableTotal: -3000, unheldNonReimbursableTotal: -3000, unheldTotal: -3000, total: -3000}));
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText('cardTransactions.outOfPocket')).toBeOnTheScreen();
            expect(screen.getByText('cardTransactions.companySpend')).toBeOnTheScreen();
        });
    });

    it('treats the report as a single non-reimbursable expense (hides redundant rows) while the deleted expense is still pending removal', async () => {
        const transactions = [
            buildTransaction('t1', 5000, false),
            {...buildTransaction('t2', 3000, false), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE} as OnyxTypes.Transaction,
        ];
        await seedReportAndTransactions(transactions, {nonReimbursableTotal: -5000, unheldNonReimbursableTotal: -5000});

        renderMoneyReportView(buildExpenseReport({nonReimbursableTotal: -5000, unheldNonReimbursableTotal: -5000}));
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByText('cardTransactions.outOfPocket')).not.toBeOnTheScreen();
            expect(screen.queryByText('cardTransactions.companySpend')).not.toBeOnTheScreen();
        });
    });

    it('keeps the breakdown rows while offline because the pending-deleted expense is still rendered', async () => {
        const transactions = [
            buildTransaction('t1', 5000, false),
            {...buildTransaction('t2', 3000, false), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE} as OnyxTypes.Transaction,
        ];
        await seedReportAndTransactions(transactions, {nonReimbursableTotal: -5000, unheldNonReimbursableTotal: -5000});
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        });

        renderMoneyReportView(buildExpenseReport({nonReimbursableTotal: -5000, unheldNonReimbursableTotal: -5000}));
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText('cardTransactions.outOfPocket')).toBeOnTheScreen();
            expect(screen.getByText('cardTransactions.companySpend')).toBeOnTheScreen();
        });
    });

    it('does not render a stray thread divider for a single non-reimbursable expense when the policy has report fields but report fields are disabled', async () => {
        // Report field exists but is disabled, so no field row renders — and neither should the divider.
        const reportField = {
            fieldID: 'field_text_1',
            name: 'Custom Field',
            type: 'text',
            target: CONST.REPORT.TYPE.EXPENSE,
            value: 'Some value',
            defaultValue: '',
            orderWeight: 1,
            disabledOptions: [],
            values: [],
            deletable: false,
        } as unknown as OnyxTypes.PolicyReportField;
        const policy = {
            id: policyID,
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            name: 'Policy',
            outputCurrency: CONST.CURRENCY.USD,
            areReportFieldsEnabled: false,
            // eslint-disable-next-line @typescript-eslint/naming-convention -- the field key uses snake_case to match the backend API format
            fieldList: {expensify_field_text_1: reportField},
        } as unknown as OnyxTypes.Policy;

        const transactions = [buildTransaction('t1', 5000, false)];
        await seedReportAndTransactions(transactions, {nonReimbursableTotal: -5000, unheldNonReimbursableTotal: -5000});

        // Combined report with Total hidden, as `MoneyReportContentCreated` renders a single-expense thread.
        const {toJSON} = renderMoneyReportView(buildExpenseReport({nonReimbursableTotal: -5000, unheldNonReimbursableTotal: -5000}), policy, {
            isCombinedReport: true,
            shouldShowTotal: false,
        });
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByText('cardTransactions.outOfPocket')).not.toBeOnTheScreen();
            expect(screen.queryByText('cardTransactions.companySpend')).not.toBeOnTheScreen();
            expect(hasThreadDivider(toJSON())).toBe(false);
        });
    });
});
