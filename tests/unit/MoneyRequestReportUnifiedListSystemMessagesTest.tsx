import {render} from '@testing-library/react-native';

import type {MoneyRequestReportTransactionListController, TransactionListItemData} from '@components/MoneyRequestReportView/MoneyRequestReportTransactionList';
import MoneyRequestReportUnifiedList from '@components/MoneyRequestReportView/MoneyRequestReportUnifiedList';

import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

import type {FlashListProps} from '@shopify/flash-list';
import type {ViewToken} from 'react-native';

import React from 'react';

const mockFlashList = jest.fn(() => null);

jest.mock('@components/FlashList', () => ({
    __esModule: true,
    default: (props: FlashListProps<unknown>) => mockFlashList(props),
}));

jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowHeight: 800})));
jest.mock('@components/MoneyRequestReportView/MoneyRequestViewReportFields', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestReportView/ReportActionsListLoadingSkeleton', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestReportView/ExternalScrollFlashListTable', () => ({
    __esModule: true,
    createScrollOffsetStore: () => ({
        getOffset: jest.fn(() => 0),
        setOffset: jest.fn(),
        subscribe: jest.fn(() => jest.fn()),
    }),
    default: jest.fn(() => null),
}));

function makeAction(reportActionID: string): ReportAction {
    return {
        reportActionID,
        actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
        actorAccountID: 1,
        created: `2026-07-30 00:00:0${reportActionID}.000`,
        message: [{type: 'TEXT', html: reportActionID, text: reportActionID}],
    };
}

function makeController(overrides: Partial<MoneyRequestReportTransactionListController> = {}): MoneyRequestReportTransactionListController {
    return {
        beforeListContent: <></>,
        tableColumnHeader: null,
        transactionListItems: [],
        renderTransactionListItem: jest.fn(() => null),
        afterListContent: null,
        shouldScrollHorizontally: false,
        tableMinWidth: 0,
        isEmptyTransactions: true,
        ...overrides,
    };
}

describe('MoneyRequestReportUnifiedList system-message presentation', () => {
    beforeEach(() => {
        mockFlashList.mockClear();
    });

    it('uses the displayed action list and keeps inline transaction offsets aligned', () => {
        const transactionItem = {type: 'transaction', transaction: {transactionID: 'transaction-1'}} as TransactionListItemData;
        const displayReportActions = [makeAction('1'), makeAction('3')];
        const renderReportAction = jest.fn(() => null);
        const onViewableItemsChanged = jest.fn();
        const onLastItemIndexChange = jest.fn();

        render(
            <MoneyRequestReportUnifiedList
                controller={makeController({transactionListItems: [transactionItem], isEmptyTransactions: false})}
                report={{reportID: 'report-1'}}
                displayReportActions={displayReportActions}
                renderReportAction={renderReportAction}
                reportActionsExtraData={undefined}
                linkedReportActionID="3"
                listRef={{current: null}}
                accessibilityLabel="Audit trail"
                onLayout={jest.fn()}
                onScroll={jest.fn()}
                onScrollBeginDrag={jest.fn()}
                onContentSizeChange={jest.fn()}
                onViewableItemsChanged={onViewableItemsChanged}
                onEndReached={jest.fn()}
                onStartReached={jest.fn()}
                contentContainerStyle={undefined}
                isOffline={false}
                isLoadingInitialActions={false}
                skeletonReasonAttributes={{context: 'test'}}
                onLastItemIndexChange={onLastItemIndexChange}
            />,
        );

        const flashListProps = mockFlashList.mock.calls.at(-1)?.at(0) as FlashListProps<{
            type: string;
            action?: ReportAction;
        }>;
        expect(flashListProps.data?.map((item) => item.type)).toEqual(['transaction', 'transactions-footer', 'report-action', 'report-action']);
        expect(flashListProps.data?.slice(2).map((item) => item.action?.reportActionID)).toEqual(['1', '3']);
        expect(flashListProps.initialScrollIndex).toBe(3);
        expect(onLastItemIndexChange).toHaveBeenLastCalledWith(3);

        flashListProps.renderItem?.({item: flashListProps.data?.at(2), index: 2} as never);
        expect(renderReportAction).toHaveBeenCalledWith(displayReportActions.at(0), 0);

        flashListProps.onViewableItemsChanged?.({
            viewableItems: [{index: 2} as ViewToken],
            changed: [],
        });
        expect(onViewableItemsChanged).toHaveBeenCalledWith({
            viewableItems: [{index: 0}],
            changed: [],
        });
    });

    it('keeps horizontal-table action indices local to the displayed action list', () => {
        const displayReportActions = [makeAction('1'), makeAction('2')];
        const renderReportAction = jest.fn(() => null);

        render(
            <MoneyRequestReportUnifiedList
                controller={makeController({shouldScrollHorizontally: true, isEmptyTransactions: false})}
                report={{reportID: 'report-1'}}
                displayReportActions={displayReportActions}
                renderReportAction={renderReportAction}
                reportActionsExtraData={undefined}
                linkedReportActionID="2"
                listRef={{current: null}}
                accessibilityLabel="Audit trail"
                onLayout={jest.fn()}
                onScroll={jest.fn()}
                onScrollBeginDrag={jest.fn()}
                onContentSizeChange={jest.fn()}
                onViewableItemsChanged={jest.fn()}
                onEndReached={jest.fn()}
                onStartReached={jest.fn()}
                contentContainerStyle={undefined}
                isOffline={false}
                isLoadingInitialActions={false}
                skeletonReasonAttributes={{context: 'test'}}
            />,
        );

        const flashListProps = mockFlashList.mock.calls.at(-1)?.at(0) as FlashListProps<{type: string; action?: ReportAction}>;
        expect(flashListProps.data?.map((item) => item.action?.reportActionID)).toEqual(['1', '2']);
        expect(flashListProps.initialScrollIndex).toBe(1);

        flashListProps.renderItem?.({item: flashListProps.data?.at(1), index: 1} as never);
        expect(renderReportAction).toHaveBeenCalledWith(displayReportActions.at(1), 1);
    });
});
