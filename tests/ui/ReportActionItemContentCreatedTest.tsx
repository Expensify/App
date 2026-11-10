import {render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {ShowContextMenuActionsContextType, ShowContextMenuStateContextType} from '@components/ShowContextMenuContext';
import {ShowContextMenuActionsContext, ShowContextMenuStateContext} from '@components/ShowContextMenuContext';

import {buildOptimisticIOUReportAction} from '@libs/ReportUtils';

import ReportActionItemContentCreated from '@pages/inbox/report/ReportActionItemContentCreated';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Only what renders between the expense and its comments matters here, so the expense and the divider parts are stand-ins.
jest.mock('@components/ReportActionItem/MoneyRequestView', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string}>>>('react-native');
    return () => <RN.View testID="money-request-view" />;
});
jest.mock('@components/UnreadActionIndicator', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string}>>>('react-native');
    return () => <RN.View testID="unread-indicator" />;
});
jest.mock('@components/SpacerView', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string}>>>('react-native');
    return () => <RN.View testID="divider-rule" />;
});

const threadReport: OnyxTypes.Report = {...LHNTestUtils.getFakeReport(), parentReportID: 'expenseReport1'};
const expenseAction: OnyxTypes.ReportAction = buildOptimisticIOUReportAction({
    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
    amount: 5000,
    currency: CONST.CURRENCY.USD,
    comment: '',
    participants: [],
    transactionID: 'transaction1',
    iouReportID: 'expenseReport1',
    getCurrencyDecimals: () => 2,
});

const contextMenuState: ShowContextMenuStateContextType = {
    anchor: null,
    report: threadReport,
    action: undefined,
    transactionThreadReport: undefined,
    isDisabled: true,
    shouldDisplayContextMenu: false,
};
const contextMenuActions: ShowContextMenuActionsContextType = {
    checkIfContextMenuActive: () => {},
    onShowContextMenu: () => {},
};

const renderExpenseThreadTop = (shouldHideThreadDividerLine: boolean, hasActionsAfterCreated: boolean) =>
    render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <ShowContextMenuStateContext.Provider value={contextMenuState}>
                    <ShowContextMenuActionsContext.Provider value={contextMenuActions}>
                        <ReportActionItemContentCreated
                            parentReportAction={expenseAction}
                            transactionID="transaction1"
                            draftMessage={undefined}
                            shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                            hasActionsAfterCreated={hasActionsAfterCreated}
                        />
                    </ShowContextMenuActionsContext.Provider>
                </ShowContextMenuStateContext.Provider>
            </LocaleContextProvider>
        </OnyxListItemProvider>,
    );

describe('ReportActionItemContentCreated below an expense', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    it('separates the expense from its read comments with a rule and a heading', async () => {
        // Given an expense whose comments have all been read
        // When the top of its thread renders
        renderExpenseThreadTop(false, true);
        await waitForBatchedUpdatesWithAct();

        // Then a rule and the "Comments" heading sit between the expense and the comments, with no "New" line
        expect(screen.getByTestId('divider-rule')).toBeOnTheScreen();
        expect(screen.getByText('Comments')).toBeOnTheScreen();
        expect(screen.queryByTestId('unread-indicator')).not.toBeOnTheScreen();
    });

    it('shows the "New" line in place of the rule when the first comment is unread', async () => {
        // Given an expense whose first comment has not been read
        // When the top of its thread renders
        renderExpenseThreadTop(true, true);
        await waitForBatchedUpdatesWithAct();

        // Then the "New" line marks the unread comment under the heading and takes the rule's place, so the two don't stack
        expect(screen.getByTestId('unread-indicator')).toBeOnTheScreen();
        expect(screen.getByText('Comments')).toBeOnTheScreen();
        expect(screen.queryByTestId('divider-rule')).not.toBeOnTheScreen();
    });

    it('shows no heading while the expense has nothing below it', async () => {
        // Given an expense with no comments or system messages yet
        // When the top of its thread renders
        renderExpenseThreadTop(false, false);
        await waitForBatchedUpdatesWithAct();

        // Then there is nothing to head, so neither the heading nor the rule shows
        expect(screen.queryByText('Comments')).not.toBeOnTheScreen();
        expect(screen.queryByTestId('divider-rule')).not.toBeOnTheScreen();
    });
});
