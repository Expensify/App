import {render} from '@testing-library/react-native';

import type {MoneyRequestReportTransactionListController, TransactionListItemData} from '@components/MoneyRequestReportView/MoneyRequestReportTransactionList';
import MoneyRequestReportUnifiedList from '@components/MoneyRequestReportView/MoneyRequestReportUnifiedList';

import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

import type {FlashListProps, ViewToken} from '@shopify/flash-list';

import React from 'react';
import {View} from 'react-native';

type TestListItem = {
    type: string;
    action?: ReportAction;
};

type TestFlashListProps = FlashListProps<TestListItem>;

const mockFlashList = jest.fn<null, [TestFlashListProps]>(() => null);

jest.mock('@components/FlashList', () => ({
    __esModule: true,
    default: (props: TestFlashListProps) => mockFlashList(props),
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
        beforeListContent: <View />,
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
        const transactionItem: TransactionListItemData = {
            type: 'transaction',
            transaction: {
                amount: 0,
                created: '2026-07-30 00:00:00.000',
                currency: CONST.CURRENCY.USD,
                merchant: '',
                reportID: 'report-1',
                transactionID: 'transaction-1',
            },
        };
        const displayReportActions = [makeAction('1'), makeAction('3')];
        const renderReportAction = jest.fn<React.ReactElement, [ReportAction, number]>(() => <View />);
        const onViewableItemsChanged = jest.fn();
        const onLastItemIndexChange = jest.fn();

        render(
            <MoneyRequestReportUnifiedList
                controller={makeController({transactionListItems: [transactionItem], isEmptyTransactions: false})}
                report={{reportID: 'report-1'}}
                visibleReportActions={displayReportActions}
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
                onLastItemIndexChange={onLastItemIndexChange}
            />,
        );

        const flashListProps = mockFlashList.mock.calls.at(-1)?.at(0);
        expect(flashListProps).toBeDefined();
        if (!flashListProps) {
            throw new Error('Expected FlashList props');
        }
        expect(flashListProps.data?.map((item) => item.type)).toEqual(['transaction', 'transactions-footer', 'report-action', 'report-action']);
        expect(flashListProps.data?.slice(2).map((item) => item.action?.reportActionID)).toEqual(['1', '3']);
        expect(flashListProps.initialScrollIndex).toBe(3);
        expect(onLastItemIndexChange).toHaveBeenLastCalledWith(3);

        const firstReportActionItem = flashListProps.data?.at(2);
        expect(firstReportActionItem).toBeDefined();
        if (!firstReportActionItem) {
            throw new Error('Expected the first displayed report action');
        }
        flashListProps.renderItem?.({item: firstReportActionItem, index: 2, target: 'Cell'});
        expect(renderReportAction).toHaveBeenCalledWith(displayReportActions.at(0), 0);

        const viewableItem: ViewToken<TestListItem> = {
            item: firstReportActionItem,
            key: 'report-action-1',
            index: 2,
            isViewable: true,
            timestamp: 0,
        };
        flashListProps.onViewableItemsChanged?.({
            viewableItems: [viewableItem],
            changed: [],
        });
        expect(onViewableItemsChanged).toHaveBeenCalledWith({
            viewableItems: [{...viewableItem, index: 0}],
            changed: [],
        });
    });

    it('keeps horizontal-table action indices local to the displayed action list', () => {
        const displayReportActions = [makeAction('1'), makeAction('2')];
        const renderReportAction = jest.fn<React.ReactElement, [ReportAction, number]>(() => <View />);

        render(
            <MoneyRequestReportUnifiedList
                controller={makeController({shouldScrollHorizontally: true, isEmptyTransactions: false})}
                report={{reportID: 'report-1'}}
                visibleReportActions={displayReportActions}
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
            />,
        );

        const flashListProps = mockFlashList.mock.calls.at(-1)?.at(0);
        expect(flashListProps).toBeDefined();
        if (!flashListProps) {
            throw new Error('Expected FlashList props');
        }
        expect(flashListProps.data?.map((item) => item.action?.reportActionID)).toEqual(['1', '2']);
        expect(flashListProps.initialScrollIndex).toBe(1);

        const secondReportActionItem = flashListProps.data?.at(1);
        expect(secondReportActionItem).toBeDefined();
        if (!secondReportActionItem) {
            throw new Error('Expected the second displayed report action');
        }
        flashListProps.renderItem?.({item: secondReportActionItem, index: 1, target: 'Cell'});
        expect(renderReportAction).toHaveBeenCalledWith(displayReportActions.at(1), 1);
    });
});
