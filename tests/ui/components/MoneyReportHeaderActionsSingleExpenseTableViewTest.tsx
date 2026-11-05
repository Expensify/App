import {render} from '@testing-library/react-native';

import MoneyReportHeaderActions from '@components/MoneyReportHeaderActions';
import MoneyReportHeaderSecondaryActions from '@components/MoneyReportHeaderActions/MoneyReportHeaderSecondaryActions';
import MoneyReportHeaderPrimaryAction from '@components/MoneyReportHeaderPrimaryAction';
import {useMoneyReportTransactionThread} from '@components/MoneyReportTransactionThreadContext';

import useSingleExpenseReportView from '@hooks/useSingleExpenseReportView';

import CONST from '@src/CONST';

import React from 'react';

const REPORT_ID = '1001';
const EMPTY_TRANSACTION_THREAD = {iouTransactionID: undefined, requestParentReportAction: null, transactionThreadReport: undefined, reportActions: []};

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));
jest.mock('@hooks/useExportAgainModal', () => jest.fn(() => ({triggerExportOrConfirm: jest.fn()})));
jest.mock('@hooks/useLayoutSpacing', () => jest.fn(() => ({pageGutter: {}})));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false, isMediumScreenWidth: false, isInLandscapeMode: false})));
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => jest.fn(() => ({isWideRHPDisplayedOnWideLayout: false, isSuperWideRHPDisplayedOnWideLayout: false, shouldUseNarrowLayout: false})));
jest.mock('@hooks/useSingleExpenseReportView', () => jest.fn());

// useThemeStyles throws without a <ThemeStylesProvider>; return a proxy that yields an empty style object for any key.
jest.mock('@hooks/useThemeStyles', () => {
    const styleProxy = new Proxy({}, {get: () => ({})});
    return jest.fn(() => styleProxy);
});

// A single-expense report always has a transaction thread, whichever view it is shown in.
jest.mock('@components/MoneyReportTransactionThreadContext', () => ({
    __esModule: true,
    useMoneyReportTransactionThread: jest.fn(() => ({transactionThreadReportID: '1002'})),
}));

// The user has selected the report's only expense.
const mockClearSelectedTransactions = jest.fn();
jest.mock('@components/Search/SearchContext', () => ({
    __esModule: true,
    useSearchSelectionContext: jest.fn(() => ({selectedTransactionIDs: ['tx-1']})),
    useSearchSelectionActions: jest.fn(() => ({clearSelectedTransactions: mockClearSelectedTransactions})),
}));

jest.mock('@components/MoneyReportHeaderPrimaryAction', () => jest.fn(() => null));
jest.mock('@components/MoneyReportHeaderActions/MoneyReportHeaderSecondaryActions', () => jest.fn(() => null));
jest.mock('@components/MoneyReportHeaderActions/MoneyReportHeaderSelectionDropdown', () => jest.fn(() => null));

const mockedUseSingleExpenseReportView = jest.mocked(useSingleExpenseReportView);
const mockedPrimaryAction = jest.mocked(MoneyReportHeaderPrimaryAction);
const mockedSecondaryActions = jest.mocked(MoneyReportHeaderSecondaryActions);

function mockSingleExpenseReportView(shouldUseTableViewForSingleExpense: boolean) {
    mockedUseSingleExpenseReportView.mockReturnValue({
        singleExpenseReportView: shouldUseTableViewForSingleExpense ? CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.TABLE : CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.EXPENSE,
        shouldUseTableViewForSingleExpense,
    });
}

function renderActions() {
    return render(
        <MoneyReportHeaderActions
            reportID={REPORT_ID}
            primaryAction={CONST.REPORT.PRIMARY_ACTIONS.SUBMIT}
            isReportInSearch={false}
        />,
    );
}

describe('MoneyReportHeaderActions on a single-expense report', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useMoneyReportTransactionThread).mockReturnValue({...EMPTY_TRANSACTION_THREAD, transactionThreadReportID: '1002'});
    });

    it('disables Submit and More while the expense is selected in the table view', () => {
        // Given a single-expense report shown in the table view, where its expense is a selectable row
        mockSingleExpenseReportView(true);

        // When the header renders while that expense is selected
        renderActions();

        // Then the report-level actions are disabled so they can't be mixed up with the bulk actions on the selection
        expect(mockedPrimaryAction.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({isDisabled: true}));
        expect(mockedSecondaryActions.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({isDisabled: true}));
    });

    it('keeps Submit and More enabled in the expense view', () => {
        // Given a single-expense report shown in the expense view, which has no selectable rows
        mockSingleExpenseReportView(false);

        // When the header renders with a leftover selection
        renderActions();

        // Then the report-level actions stay enabled, as there is no bulk selection the user can act on
        expect(mockedPrimaryAction.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({isDisabled: false}));
        expect(mockedSecondaryActions.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({isDisabled: false}));
    });

    it('keeps the selection when the header mounts in the table view', () => {
        // Given a single-expense report shown in the table view, where its expense is a selectable row
        mockSingleExpenseReportView(true);

        // When the header mounts, as it does after a resize or when a page like Hold or Move opens over a narrow layout
        renderActions();

        // Then the selection is kept, so the bulk action still acts on the selected expense
        expect(mockClearSelectedTransactions).not.toHaveBeenCalled();
    });

    it('keeps the selection when a table-view report drops to one expense', () => {
        // Given a report in the table view with two expenses, so it has no transaction thread yet
        mockSingleExpenseReportView(true);
        const mockedUseMoneyReportTransactionThread = jest.mocked(useMoneyReportTransactionThread);
        mockedUseMoneyReportTransactionThread.mockReturnValue({...EMPTY_TRANSACTION_THREAD, transactionThreadReportID: undefined});
        const {rerender} = renderActions();

        // When one expense is deleted and the report gets a transaction thread for the remaining one
        mockedUseMoneyReportTransactionThread.mockReturnValue({...EMPTY_TRANSACTION_THREAD, transactionThreadReportID: '1002'});
        rerender(
            <MoneyReportHeaderActions
                reportID={REPORT_ID}
                primaryAction={CONST.REPORT.PRIMARY_ACTIONS.SUBMIT}
                isReportInSearch={false}
            />,
        );

        // Then the selection is kept, as the remaining expense is still a selectable row
        expect(mockClearSelectedTransactions).not.toHaveBeenCalled();
    });

    it('clears the selection in the expense view', () => {
        // Given a single-expense report shown in the expense view, which has no selectable rows
        mockSingleExpenseReportView(false);

        // When the header mounts with a leftover selection
        renderActions();

        // Then the selection is cleared so it can't be acted on from a view that doesn't show it
        expect(mockClearSelectedTransactions).toHaveBeenCalledWith(true);
    });
});
