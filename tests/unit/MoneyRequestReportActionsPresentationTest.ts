import {act, renderHook} from '@testing-library/react-native';

import * as ReportActionsUtils from '@libs/ReportActionsUtils';

import useReportActionsPresentation from '@pages/inbox/report/useReportActionsPresentation';

import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

function makeAction(reportActionID: string): ReportAction {
    return {
        reportActionID,
        actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
        actorAccountID: 1,
        created: `2026-07-30 00:00:0${reportActionID}.000`,
        message: [{type: 'TEXT', html: reportActionID, text: reportActionID}],
    };
}

describe('useReportActionsPresentation', () => {
    const visibleReportActions = [makeAction('1'), makeAction('2'), makeAction('3')];

    it('expands once and keeps all members visible on repeated expansion', () => {
        const {result} = renderHook(() => useReportActionsPresentation({visibleReportActions}));
        expect(result.current.displayReportActions).toEqual([visibleReportActions.at(0)]);
        act(() => result.current.expandSystemMessageRun(['1', '2', '3']));
        expect(result.current.displayReportActions).toEqual(visibleReportActions);
        act(() => result.current.expandSystemMessageRun(['1', '2', '3']));
        expect(result.current.displayReportActions).toEqual(visibleReportActions);
    });

    it('reveals a linked member without requiring the user to expand it', () => {
        const {result} = renderHook(() => useReportActionsPresentation({visibleReportActions, linkedReportActionID: '2'}));
        expect(result.current.displayReportActions).toEqual(visibleReportActions);
        expect(result.current.reportActionIDToDisplayIndex.get('2')).toBe(1);
    });

    it('expands a newly linked run on the first render after a same-screen route change', () => {
        const separatedVisibleReportActions = [makeAction('1'), makeAction('2'), {...makeAction('3'), actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}, makeAction('4'), makeAction('5')];
        const initialProps: {linkedReportActionID?: string} = {linkedReportActionID: '1'};
        const {result, rerender} = renderHook(
            (props: {linkedReportActionID?: string}) =>
                useReportActionsPresentation({
                    visibleReportActions: separatedVisibleReportActions,
                    linkedReportActionID: props.linkedReportActionID,
                }),
            {initialProps},
        );

        const displayStateSpy = jest.spyOn(ReportActionsUtils, 'getSystemMessageDisplayState');

        rerender({linkedReportActionID: '5'});

        expect(displayStateSpy.mock.calls.at(0)?.at(2)).toEqual(['5']);
        expect(result.current.displayReportActions.map((reportAction) => reportAction.reportActionID)).toEqual(['1', '2', '3', '4', '5']);
        expect(result.current.reportActionIDToDisplayIndex.get('5')).toBe(4);
        rerender({linkedReportActionID: undefined});
        expect(result.current.displayReportActions).toEqual(separatedVisibleReportActions);
        displayStateSpy.mockRestore();
    });

    it.each([false, true])('keeps revealed pagination members visible when older pages repartition 24-hour runs (newest first: %s)', (newestFirst) => {
        const actions = [
            {...makeAction('1'), created: '2026-07-30 00:00:00.000'},
            {...makeAction('2'), created: '2026-07-30 20:00:00.000'},
            {...makeAction('3'), created: '2026-07-31 16:00:00.000'},
            {...makeAction('4'), created: '2026-07-31 17:00:00.000'},
        ];
        const orderActions = (items: ReportAction[]) => (newestFirst ? items.toReversed() : items);
        const {result, rerender} = renderHook(({items}: {items: ReportAction[]}) => useReportActionsPresentation({visibleReportActions: items}), {
            initialProps: {items: orderActions(actions.slice(2))},
        });
        act(() => result.current.expandSystemMessageRun(['3', '4']));
        rerender({items: orderActions(actions.slice(1))});
        expect(result.current.displayReportActions).toEqual(orderActions(actions.slice(1)));
        rerender({items: orderActions(actions)});
        expect(result.current.displayReportActions).toEqual(orderActions(actions));
    });

    it('keeps an unread member collapsed and maps its marker to the summary row', () => {
        const {result} = renderHook(() =>
            useReportActionsPresentation({
                visibleReportActions,
                unreadMarkerReportActionID: '2',
            }),
        );

        expect(result.current.displayReportActions).toEqual([visibleReportActions.at(0)]);
        expect(result.current.runsByAnchorReportActionID.get('1')?.isExpanded).toBe(false);
        expect(result.current.unreadMarkerReportActionIndex).toBe(0);
    });
});
