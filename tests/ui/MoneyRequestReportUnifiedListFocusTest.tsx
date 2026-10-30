import {act, render} from '@testing-library/react-native';

import MoneyRequestReportUnifiedList from '@components/MoneyRequestReportView/MoneyRequestReportUnifiedList';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import createMock from '../utils/createMock';
import {buildSystemAction} from '../utils/ReportTestUtils';

jest.mock('@components/FlashList', () => jest.fn(() => null));
jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowHeight: 800})));
jest.mock('@pages/inbox/report/useScrollToEditingReportAction', () => jest.fn());
jest.mock('@components/MoneyRequestReportView/MoneyRequestViewReportFields', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestReportView/ReportActionsListLoadingSkeleton', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestReportView/ExternalScrollFlashListTable', () => ({
    __esModule: true,
    default: jest.fn(() => null),
    createScrollOffsetStore: () => ({getOffset: () => 0, setOffset: jest.fn()}),
}));

type Props = React.ComponentProps<typeof MoneyRequestReportUnifiedList>;

// These modes have different virtualized row positions even though their audit input is identical.
describe('MoneyRequestReportUnifiedList expansion focus', () => {
    it.each([
        {name: 'inline transactions and footer', horizontal: false, empty: false, expectedIndex: 4},
        {name: 'horizontal transaction table', horizontal: true, empty: false, expectedIndex: 1},
        {name: 'empty transactions', horizontal: false, empty: true, expectedIndex: 1},
    ])('mounts an off-screen revealed update with $name', ({horizontal, empty, expectedIndex}) => {
        const scrollToIndex = jest.fn();
        const listRef = createMock<Props['listRef']>({current: {scrollToIndex}});
        const frames = new Map<number, FrameRequestCallback>();
        let frameID = 0;
        const frameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
            frames.set(++frameID, callback);
            return frameID;
        });
        const cancelSpy = jest.spyOn(global, 'cancelAnimationFrame').mockImplementation((id) => {
            if (typeof id !== 'number') {
                return;
            }
            frames.delete(id);
        });
        const actions = [
            buildSystemAction('earlier', {actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, created: '2026-01-01 10:00:00.000'}),
            buildSystemAction('revealed-oldest', {actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, created: '2026-01-01 11:00:00.000'}),
        ];
        const props = createMock<Props>({
            controller: {
                shouldScrollHorizontally: horizontal,
                isEmptyTransactions: empty,
                transactionListItems: [
                    {type: 'transaction', transaction: {transactionID: 'expense-one'}},
                    {type: 'transaction', transaction: {transactionID: 'expense-two'}},
                ],
            },
            report: {reportID: 'expense-report'},
            visibleReportActions: actions,
            renderReportAction: () => <View />,
            listRef,
            onScroll: jest.fn(),
            onLayout: jest.fn(),
        });
        try {
            const {rerender, unmount} = render(<MoneyRequestReportUnifiedList {...props} />);
            expect(scrollToIndex).not.toHaveBeenCalled();
            rerender(
                <MoneyRequestReportUnifiedList
                    {...props}
                    focusRequestedReportActionID="revealed-oldest"
                />,
            );
            act(() => {
                for (const callback of [...frames.values()]) {
                    callback(0);
                }
            });
            expect(scrollToIndex).toHaveBeenCalledTimes(1);
            expect(scrollToIndex).toHaveBeenCalledWith({index: expectedIndex, animated: false, viewPosition: 0.5});
            unmount();
        } finally {
            frameSpy.mockRestore();
            cancelSpy.mockRestore();
        }
    });
});
