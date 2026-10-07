import {render} from '@testing-library/react-native';

import MoneyReportHeaderActions from '@components/MoneyReportHeaderActions';
import MoneyReportHeaderSecondaryActions from '@components/MoneyReportHeaderActions/MoneyReportHeaderSecondaryActions';
import MoneyReportHeaderSelectionDropdown from '@components/MoneyReportHeaderActions/MoneyReportHeaderSelectionDropdown';
import MoneyReportHeaderPrimaryAction from '@components/MoneyReportHeaderPrimaryAction';

import CONST from '@src/CONST';

import React from 'react';

let mockSelectedTransactionIDs: string[] = [];
let mockTransactionThreadReportID: string | undefined;
let mockUseNarrowLayoutOnWideRHP = false;
const mockClearSelectedTransactions = jest.fn();

jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/useExportAgainModal', () => () => ({triggerExportOrConfirm: jest.fn()}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false, isMediumScreenWidth: false, isInLandscapeMode: false}));
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => () => ({shouldUseNarrowLayout: mockUseNarrowLayoutOnWideRHP}));
jest.mock('@components/MoneyReportTransactionThreadContext', () => ({useMoneyReportTransactionThread: () => ({transactionThreadReportID: mockTransactionThreadReportID})}));
jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionContext: () => ({selectedTransactionIDs: mockSelectedTransactionIDs}),
    useSearchSelectionActions: () => ({clearSelectedTransactions: mockClearSelectedTransactions}),
}));
jest.mock('@components/MoneyReportHeaderPrimaryAction', () => jest.fn(() => null));
jest.mock('@components/MoneyReportHeaderActions/MoneyReportHeaderSecondaryActions', () => jest.fn(() => null));
jest.mock('@components/MoneyReportHeaderActions/MoneyReportHeaderSelectionDropdown', () => jest.fn(() => null));

describe('MoneyReportHeaderActions', () => {
    beforeEach(() => {
        mockSelectedTransactionIDs = [];
        mockTransactionThreadReportID = undefined;
        mockUseNarrowLayoutOnWideRHP = false;
        jest.clearAllMocks();
    });

    it('passes a report action and its initially null ref to secondary actions', () => {
        // Given a report-level action and no selection.
        // When the real header routes its actions.
        render(
            <MoneyReportHeaderActions
                reportID="123"
                primaryAction={CONST.REPORT.PRIMARY_ACTIONS.PAY}
            />,
        );
        // Then the report action stays typed and the dropdown ref starts null.
        expect(jest.mocked(MoneyReportHeaderSecondaryActions)).toHaveBeenCalledTimes(1);
        const props = jest.mocked(MoneyReportHeaderSecondaryActions).mock.lastCall?.[0];
        expect(props?.primaryAction).toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
        expect(props?.dropdownMenuRef?.current).toBeNull();
        expect(props?.isDisabled).toBe(false);
    });

    it('maps transaction-only keepThisOne to empty secondary action', () => {
        // Given the transaction-only action.
        // When the real header narrows it for secondary actions.
        render(
            <MoneyReportHeaderActions
                reportID="123"
                primaryAction={CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.KEEP_THIS_ONE}
            />,
        );
        // Then the primary child still gets the original action while the secondary child gets empty.
        expect(jest.mocked(MoneyReportHeaderPrimaryAction).mock.lastCall?.[0].primaryAction).toBe(CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.KEEP_THIS_ONE);
        expect(jest.mocked(MoneyReportHeaderSecondaryActions).mock.lastCall?.[0].primaryAction).toBe('');
    });

    it('routes a narrow selection to the selection dropdown', () => {
        // Given a selection in the narrow RHP branch.
        mockSelectedTransactionIDs = ['transaction'];
        mockUseNarrowLayoutOnWideRHP = true;
        // When the real header renders.
        render(
            <MoneyReportHeaderActions
                reportID="123"
                primaryAction={CONST.REPORT.PRIMARY_ACTIONS.PAY}
            />,
        );
        // Then only the selection dropdown handles report actions.
        expect(jest.mocked(MoneyReportHeaderSelectionDropdown)).toHaveBeenCalledTimes(1);
        expect(jest.mocked(MoneyReportHeaderSecondaryActions)).not.toHaveBeenCalled();
    });

    it('keeps report actions available inside a transaction thread and clears selection', () => {
        // Given a selected expense in a transaction thread.
        mockSelectedTransactionIDs = ['transaction'];
        mockTransactionThreadReportID = 'thread';
        mockUseNarrowLayoutOnWideRHP = true;
        // When the real header renders.
        render(
            <MoneyReportHeaderActions
                reportID="123"
                primaryAction={CONST.REPORT.PRIMARY_ACTIONS.PAY}
            />,
        );
        // Then the normal actions remain enabled and the thread clears selection.
        expect(jest.mocked(MoneyReportHeaderSecondaryActions).mock.lastCall?.[0].isDisabled).toBe(false);
        expect(mockClearSelectedTransactions).toHaveBeenCalledWith(true);
    });

    it('disables report actions during a wide-layout selection', () => {
        // Given a selection in the ordinary wide layout.
        mockSelectedTransactionIDs = ['transaction'];
        // When the real header renders.
        render(
            <MoneyReportHeaderActions
                reportID="123"
                primaryAction={CONST.REPORT.PRIMARY_ACTIONS.PAY}
            />,
        );
        // Then both report-level children are disabled.
        expect(jest.mocked(MoneyReportHeaderPrimaryAction).mock.lastCall?.[0].isDisabled).toBe(true);
        expect(jest.mocked(MoneyReportHeaderSecondaryActions).mock.lastCall?.[0].isDisabled).toBe(true);
    });
});
