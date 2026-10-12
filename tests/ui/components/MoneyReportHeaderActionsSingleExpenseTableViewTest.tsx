import {render} from '@testing-library/react-native';

import MoneyReportHeaderActions from '@components/MoneyReportHeaderActions';
import MoneyReportHeaderSecondaryActions from '@components/MoneyReportHeaderActions/MoneyReportHeaderSecondaryActions';
import MoneyReportHeaderPrimaryAction from '@components/MoneyReportHeaderPrimaryAction';

import useSingleExpenseReportView from '@hooks/useSingleExpenseReportView';

import CONST from '@src/CONST';

import React from 'react';

const REPORT_ID = '1001';

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
jest.mock('@components/Search/SearchContext', () => ({
    __esModule: true,
    useSearchSelectionContext: jest.fn(() => ({selectedTransactionIDs: ['tx-1']})),
    useSearchSelectionActions: jest.fn(() => ({clearSelectedTransactions: jest.fn()})),
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
        isLoading: false,
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
});
