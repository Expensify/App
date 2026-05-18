import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {ShowContextMenuActionsContextType, ShowContextMenuStateContextType} from '@components/ShowContextMenuContext';
import MoneyReportContentCreated from '@pages/inbox/report/MoneyReportContentCreated';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Capture the `isTotalPending` prop forwarded to MoneyReportView. The component itself
// is heavy (theme, currency, breakdown logic); the value we care about for this test
// is whether the parent computes the pending flag correctly.
// Prefix `mock` so jest allows the variable inside the factory below.
const mockMoneyReportView = jest.fn<null, [Record<string, unknown>]>(() => null);
jest.mock('@components/ReportActionItem/MoneyReportView', () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => mockMoneyReportView(props),
}));

// MoneyRequestView is irrelevant to this test (it only renders in the combined branch)
jest.mock('@components/ReportActionItem/MoneyRequestView', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string}>>>('react-native');
    return () => <RN.View testID="money-request-view" />;
});

jest.mock('@pages/inbox/report/AnimatedEmptyStateBackground', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string}>>>('react-native');
    return () => <RN.View testID="animated-bg" />;
});

const buildExpenseReport = (overrides: Partial<OnyxTypes.Report> = {}): OnyxTypes.Report => ({
    ...LHNTestUtils.getFakeReport([1, 2]),
    type: CONST.REPORT.TYPE.EXPENSE,
    currency: CONST.CURRENCY.USD,
    total: 0,
    ...overrides,
});

const noopState: ShowContextMenuStateContextType = {
    anchor: null,
    report: undefined,
    action: undefined,
    transactionThreadReport: undefined,
    isDisabled: true,
    shouldDisplayContextMenu: false,
};
const noopActions: ShowContextMenuActionsContextType = {
    checkIfContextMenuActive: () => {},
    onShowContextMenu: () => {},
};

const renderWithProps = (props: Partial<React.ComponentProps<typeof MoneyReportContentCreated>>) => {
    const merged: React.ComponentProps<typeof MoneyReportContentCreated> = {
        report: undefined,
        policy: undefined,
        transaction: undefined,
        transactionThreadReport: undefined,
        action: undefined,
        contextMenuActionsValue: noopActions,
        disabledStateValue: noopState,
        shouldHideThreadDividerLine: false,
        threadDivider: null,
        ...props,
    };

    return render(
        <OnyxListItemProvider>
            <MoneyReportContentCreated {...merged} />
        </OnyxListItemProvider>,
    );
};

describe('MoneyReportContentCreated', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        mockMoneyReportView.mockClear();
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('forwards isTotalPending=true when the report has exactly one transaction and the thread report is missing', async () => {
        const report = buildExpenseReport();
        const transaction = LHNTestUtils.getFakeTransaction(report.reportID, 1500);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
        });

        renderWithProps({report, transactionThreadReport: undefined});
        await waitForBatchedUpdatesWithAct();

        const lastCall = mockMoneyReportView.mock.calls.at(-1)?.at(0);
        expect(lastCall?.isTotalPending).toBe(true);
    });

    it('forwards isTotalPending=false when the thread report is already present (combined branch)', async () => {
        const report = buildExpenseReport();
        const transaction = LHNTestUtils.getFakeTransaction(report.reportID, 1500);
        const threadReport = buildExpenseReport({reportID: 'thread_1'});

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
        });

        renderWithProps({report, transactionThreadReport: threadReport});
        await waitForBatchedUpdatesWithAct();

        // In the combined branch the inline `MoneyReportView` is invoked with `isCombinedReport`
        // and never with `isTotalPending=true`. Assert against every call to be safe.
        const calls = mockMoneyReportView.mock.calls.map((c) => c[0]);
        expect(calls.every((p) => p?.isTotalPending !== true)).toBe(true);
    });

    it('forwards isTotalPending=false when there are zero transactions', async () => {
        const report = buildExpenseReport();

        renderWithProps({report, transactionThreadReport: undefined});
        await waitForBatchedUpdatesWithAct();

        const lastCall = mockMoneyReportView.mock.calls.at(-1)?.at(0);
        expect(lastCall?.isTotalPending).toBe(false);
    });

    it('forwards isTotalPending=false when there are multiple transactions on the report', async () => {
        const report = buildExpenseReport();
        const t1 = LHNTestUtils.getFakeTransaction(report.reportID, 1500);
        const t2 = LHNTestUtils.getFakeTransaction(report.reportID, 2500);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${t1.transactionID}`, t1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${t2.transactionID}`, t2);
        });

        renderWithProps({report, transactionThreadReport: undefined});
        await waitForBatchedUpdatesWithAct();

        const lastCall = mockMoneyReportView.mock.calls.at(-1)?.at(0);
        expect(lastCall?.isTotalPending).toBe(false);
    });

    it('forwards isTotalPending=false when the only transaction belongs to a different report', async () => {
        const report = buildExpenseReport();
        const otherReportTransaction = LHNTestUtils.getFakeTransaction('some_other_report', 1500);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${otherReportTransaction.transactionID}`, otherReportTransaction);
        });

        renderWithProps({report, transactionThreadReport: undefined});
        await waitForBatchedUpdatesWithAct();

        const lastCall = mockMoneyReportView.mock.calls.at(-1)?.at(0);
        expect(lastCall?.isTotalPending).toBe(false);
    });
});
