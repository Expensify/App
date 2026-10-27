/** Exercises report breakdown visibility and exact pending contributions through the real report rows. */
import {act, render, screen, waitFor, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import MoneyReportView from '@components/ReportActionItem/MoneyReportView';

import {getReportFieldKey} from '@libs/ReportUtils';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Pinned to a wide layout so the column-count assertion below exercises the `shouldUseSingleColumn` prop rather than
// the narrow-layout fallback, which would collapse the fields to one per row on its own.
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => ({
    __esModule: true,
    default: () => ({
        shouldUseNarrowLayout: false,
        shouldUseNarrowLayoutIgnoringWideRHP: false,
        isSmallScreenWidth: false,
        isInNarrowPaneModal: false,
        isWideRHPDisplayedOnWideLayout: true,
        isSuperWideRHPDisplayedOnWideLayout: false,
    }),
}));

jest.mock('@components/OfflineWithFeedback', () => {
    const actual = jest.requireActual<{default: typeof OfflineWithFeedback}>('@components/OfflineWithFeedback');
    return {...actual, __esModule: true, default: jest.fn<ReturnType<typeof actual.default>, [OfflineWithFeedbackProps]>(actual.default)};
});

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
        toLocaleDigit: jest.fn((digit: string) => digit),
    })),
);

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({
        didScreenTransitionEnd: true,
    }),
}));

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

const buildTaxPolicy = (): OnyxTypes.Policy => ({
    ...LHNTestUtils.getFakePolicy(policyID, 'Policy'),
    outputCurrency: CONST.CURRENCY.USD,
    tax: {trackingEnabled: true},
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

const renderMoneyReportView = (report: OnyxTypes.Report, policy: OnyxTypes.Policy | undefined = undefined, isCombinedReport = false, pendingAction?: PendingAction) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider]}>
            <MoneyReportView
                report={report}
                policy={policy}
                shouldHideThreadDividerLine={false}
                shouldShowAnimatedBackground={false}
                isCombinedReport={isCombinedReport}
                pendingAction={pendingAction}
            />
        </ComposeProviders>,
    );

describe('MoneyReportView reimbursable/non-reimbursable breakdown rows', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
        initOnyxDerivedValues();
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

    it('hides the Total row for a single expense', async () => {
        const transactions = [buildTransaction('t1', 5000, false)];
        await seedReportAndTransactions(transactions, {nonReimbursableTotal: -5000, unheldNonReimbursableTotal: -5000});

        renderMoneyReportView(buildExpenseReport({nonReimbursableTotal: -5000, unheldNonReimbursableTotal: -5000}));
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByText('common.total')).not.toBeOnTheScreen();
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

    it('shows all four exact breakdown labels together for multiple taxed and billable expenses', async () => {
        // Given multiple expenses with company spend, billable amount and tax enabled
        const policy = buildTaxPolicy();
        const transactions = [buildTransaction('t1', 5000, true, true, 500), buildTransaction('t2', 3000, false, true, 300)];
        const report = buildExpenseReport({total: -8000, unheldTotal: -8000, nonReimbursableTotal: -3000, unheldNonReimbursableTotal: -3000});
        await seedReportAndTransactions(transactions, report);

        // When the actual report renders its breakdown
        renderMoneyReportView(report, policy);
        await waitForBatchedUpdatesWithAct();

        // Then all four labels remain in their existing order
        const labels = screen.getAllByText(/^(cardTransactions\.(outOfPocket|companySpend)|common\.(billable|tax))$/);
        expect(labels.map((label) => label.children.filter((child) => typeof child === 'string').join(''))).toEqual([
            'cardTransactions.outOfPocket',
            'cardTransactions.companySpend',
            'common.billable',
            'common.tax',
        ]);
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
        const policy = buildTaxPolicy();
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
        const policy = buildTaxPolicy();
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
        await seedReportAndTransactions(transactions, {total: -5000, unheldTotal: -5000, nonReimbursableTotal: -5000, unheldNonReimbursableTotal: -5000});
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        });

        renderMoneyReportView(buildExpenseReport({total: -5000, unheldTotal: -5000, nonReimbursableTotal: -5000, unheldNonReimbursableTotal: -5000}));
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText('cardTransactions.outOfPocket')).toBeOnTheScreen();
            expect(screen.getByText('cardTransactions.companySpend')).toBeOnTheScreen();
        });
    });
});

describe('MoneyReportView report fields visibility', () => {
    const customFieldKey = getReportFieldKey('field_test');

    const buildTitleField = (): OnyxTypes.PolicyReportField => ({
        fieldID: CONST.REPORT_FIELD_TITLE_FIELD_ID,
        name: 'title',
        type: CONST.REPORT_FIELD_TYPES.FORMULA,
        target: 'expense',
        orderWeight: 1,
        deletable: false,
        defaultValue: '{report:type} {report:startdate}',
        value: 'Expense Report',
        values: [],
        keys: [],
        externalIDs: [],
        disabledOptions: [],
        isTax: false,
    });

    const buildCustomTextField = (): OnyxTypes.PolicyReportField => ({
        fieldID: 'field_test',
        name: 'Test',
        type: CONST.REPORT_FIELD_TYPES.TEXT,
        target: 'expense',
        orderWeight: 2,
        deletable: true,
        defaultValue: '',
        value: '1',
        values: [],
        keys: [],
        externalIDs: [],
        disabledOptions: [],
        isTax: false,
    });

    const buildReportFieldsPolicy = (fieldList: Record<string, OnyxTypes.PolicyReportField>): OnyxTypes.Policy =>
        ({
            ...LHNTestUtils.getFakePolicy(policyID, 'Policy'),
            // A non-admin submitter: report fields become read-only (not editable) after approval.
            role: CONST.POLICY.ROLE.USER,
            type: CONST.POLICY.TYPE.TEAM,
            outputCurrency: CONST.CURRENCY.USD,
            areReportFieldsEnabled: true,
            fieldList,
        }) as OnyxTypes.Policy;

    const seedReportFieldsPolicy = async (policy: OnyxTypes.Policy, report: OnyxTypes.Report) => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
        });
        await waitForBatchedUpdatesWithAct();
    };

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
        initOnyxDerivedValues();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    const buildFourFieldReport = () => {
        const customFields = Array.from({length: 4}, (_unused, index) => ({
            ...buildCustomTextField(),
            fieldID: `field_test${index}`,
            name: `Test${index}`,
            orderWeight: index + 2,
        }));
        const fieldList: Record<string, OnyxTypes.PolicyReportField> = {[CONST.REPORT_FIELD_TITLE_FIELD_ID]: buildTitleField()};
        for (const field of customFields) {
            fieldList[`expensify_${field.fieldID}`] = field;
        }
        return {policy: buildReportFieldsPolicy(fieldList), report: buildExpenseReport({fieldList})};
    };

    it('edits the report fields inline, one per row on a wide layout', async () => {
        // Given a one-expense report with 4 custom fields on a wide layout
        const {policy, report} = buildFourFieldReport();
        await seedReportFieldsPolicy(policy, report);

        // When this view renders them
        renderMoneyReportView(report, policy);
        await waitForBatchedUpdatesWithAct();

        // Then each field is an input on its own row. Four fields would fill two rows of three if the grid were in use,
        // so four rows proves this view asks for a single column: it renders inside a container too narrow for three
        // fields side by side even though the window itself is wide
        await waitFor(() => {
            expect(screen.getAllByTestId('reportFieldsRow')).toHaveLength(4);
        });
        expect(screen.getByLabelText('Test0')).toBeOnTheScreen();
    });

    it('keeps a custom report field visible for a non-admin submitter after the report is approved (single-expense combined view)', async () => {
        const fieldList = {
            [CONST.REPORT_FIELD_TITLE_FIELD_ID]: buildTitleField(),
            [customFieldKey]: buildCustomTextField(),
        };
        const policy = buildReportFieldsPolicy(fieldList);
        const approvedReport = buildExpenseReport({
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            fieldList,
        });
        await seedReportFieldsPolicy(policy, approvedReport);

        renderMoneyReportView(approvedReport, policy, true);
        await waitForBatchedUpdatesWithAct();

        // The custom field (rendered read-only after approval) must still show for the submitter.
        await waitFor(() => {
            expect(screen.getByLabelText('Test')).toBeOnTheScreen();
        });
    });

    it('hides the report-fields section in the combined view when only the title field is configured', async () => {
        const fieldList = {[CONST.REPORT_FIELD_TITLE_FIELD_ID]: buildTitleField()};
        const policy = buildReportFieldsPolicy(fieldList);
        const approvedReport = buildExpenseReport({
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            fieldList,
        });
        await seedReportFieldsPolicy(policy, approvedReport);

        renderMoneyReportView(approvedReport, policy, true);
        await waitForBatchedUpdatesWithAct();

        // The title field is shown in the report header for a combined report, so the redundant section stays hidden.
        await waitFor(() => {
            expect(screen.queryByText('title')).not.toBeOnTheScreen();
        });
    });

    it.each<PendingAction | undefined>([undefined, null, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE])(
        'preserves the exact custom-field contribution %s without taking a title or another field contribution',
        async (contribution) => {
            // Given keys produced by getReportFieldKey and the pending shape written by updateReportField
            const secondFieldKey = getReportFieldKey('field_second');
            const fieldList = {
                [CONST.REPORT_FIELD_TITLE_FIELD_ID]: buildTitleField(),
                [customFieldKey]: buildCustomTextField(),
                [secondFieldKey]: {...buildCustomTextField(), fieldID: 'field_second', name: 'Second', orderWeight: 3},
            };
            const policy = buildReportFieldsPolicy(fieldList);
            const report = buildExpenseReport({
                fieldList,
                pendingFields: {[getReportFieldKey(CONST.REPORT_FIELD_TITLE_FIELD_ID)]: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
            });
            // Custom pending keys are written by updateReportField even though the Report model lists fixed keys only.
            const pendingFields = {...report.pendingFields, [customFieldKey]: contribution, [secondFieldKey]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE};
            const reportWithPending = {...report, pendingFields};
            await seedReportFieldsPolicy(policy, report);
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
            });
            jest.mocked(OfflineWithFeedback).mockClear();

            // When typed direct props retain explicit undefined and null that an Onyx merge would delete
            renderMoneyReportView(reportWithPending, policy);
            await waitForBatchedUpdatesWithAct();

            // Then both intended rows exist and the real feedback component receives their distinct exact values
            expect(screen.getByLabelText('Test')).toBeOnTheScreen();
            expect(screen.getByLabelText('Second')).toBeOnTheScreen();
            const feedback = screen.UNSAFE_getAllByType(OfflineWithFeedback);
            expect(feedback).toHaveLength(2);
            const customFeedback = feedback.find((row) => within(row).queryByLabelText('Test'));
            const secondFeedback = feedback.find((row) => within(row).queryByLabelText('Second'));
            expect(customFeedback).toBeDefined();
            expect(secondFeedback).toBeDefined();
            if (!customFeedback || !secondFeedback) {
                throw new Error('Expected feedback around both custom report fields');
            }
            const customObservation = jest.mocked(OfflineWithFeedback).mock.calls.findLast(([props]) => props === customFeedback.props)?.[0];
            const secondObservation = jest.mocked(OfflineWithFeedback).mock.calls.findLast(([props]) => props === secondFeedback.props)?.[0];
            expect(customObservation).toBeDefined();
            expect(secondObservation).toBeDefined();
            expect(customObservation?.pendingAction).toBe(contribution);
            expect(secondObservation?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        },
    );

    it.each(['missing-container', 'missing-key', 'overall-action'] as const)('retains undefined feedback for %s', async (scenario) => {
        // Given two custom rows and title pending data that must not leak into either row
        const secondFieldKey = getReportFieldKey('field_second');
        const fieldList = {
            [CONST.REPORT_FIELD_TITLE_FIELD_ID]: buildTitleField(),
            [customFieldKey]: buildCustomTextField(),
            [secondFieldKey]: {...buildCustomTextField(), fieldID: 'field_second', name: 'Second', orderWeight: 3},
        };
        const policy = buildReportFieldsPolicy(fieldList);
        const report = buildExpenseReport({fieldList});
        const pendingFields =
            scenario === 'missing-container'
                ? undefined
                : {
                      ...report.pendingFields,
                      [getReportFieldKey(CONST.REPORT_FIELD_TITLE_FIELD_ID)]: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                      ...(scenario === 'overall-action' ? {[customFieldKey]: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, [secondFieldKey]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE} : {}),
                  };
        const reportWithPending = {...report, pendingFields};
        await seedReportFieldsPolicy(policy, reportWithPending);
        jest.mocked(OfflineWithFeedback).mockClear();

        // When the real component receives missing contributions or an overall pending action
        renderMoneyReportView(reportWithPending, policy, false, scenario === 'overall-action' ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined);
        await waitForBatchedUpdatesWithAct();

        // Then the intended rows still exist without duplicate or unrelated feedback
        expect(screen.getByLabelText('Test')).toBeOnTheScreen();
        expect(screen.getByLabelText('Second')).toBeOnTheScreen();
        const feedback = screen.UNSAFE_getAllByType(OfflineWithFeedback);
        expect(feedback).toHaveLength(2);
        for (const name of ['Test', 'Second']) {
            const fieldFeedback = feedback.find((row) => within(row).queryByLabelText(name));
            expect(fieldFeedback).toBeDefined();
            if (!fieldFeedback) {
                throw new Error(`Expected feedback around ${name}`);
            }
            const observation = jest.mocked(OfflineWithFeedback).mock.calls.findLast(([props]) => props === fieldFeedback.props)?.[0];
            expect(observation).toBeDefined();
            expect(observation?.pendingAction).toBeUndefined();
        }
    });
});
