import {act, renderHook} from '@testing-library/react-native';

import useMoneyRequestReportActionsPresentation from '@components/MoneyRequestReportView/useMoneyRequestReportActionsPresentation';

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

describe('useMoneyRequestReportActionsPresentation', () => {
    const visibleReportActions = [makeAction('1'), makeAction('2'), makeAction('3')];

    it('expands a linked member once and permits an explicit collapse', () => {
        const {result, rerender} = renderHook(
            (props: {linkedReportActionID?: string}) =>
                useMoneyRequestReportActionsPresentation({
                    visibleReportActions,
                    linkedReportActionID: props.linkedReportActionID,
                }),
            {initialProps: {linkedReportActionID: '2'}},
        );

        expect(result.current.displayReportActions).toEqual(visibleReportActions);
        expect(result.current.runsByAnchorReportActionID.get('1')?.isExpanded).toBe(true);

        act(() => {
            result.current.toggleSystemMessageRun(['1', '2', '3'], true);
        });

        expect(result.current.displayReportActions).toEqual([visibleReportActions.at(0)]);
        expect(result.current.runsByAnchorReportActionID.get('1')?.isExpanded).toBe(false);
        expect(result.current.reportActionIDToDisplayIndex.get('2')).toBe(0);

        rerender({linkedReportActionID: '3'});
        expect(result.current.displayReportActions).toEqual(visibleReportActions);
        expect(result.current.runsByAnchorReportActionID.get('1')?.isExpanded).toBe(true);
    });

    it('keeps an unread member collapsed and maps its marker to the summary row', () => {
        const {result} = renderHook(() =>
            useMoneyRequestReportActionsPresentation({
                visibleReportActions,
                unreadMarkerReportActionID: '2',
            }),
        );

        expect(result.current.displayReportActions).toEqual([visibleReportActions.at(0)]);
        expect(result.current.runsByAnchorReportActionID.get('1')?.isExpanded).toBe(false);
        expect(result.current.unreadMarkerReportActionIndex).toBe(0);
    });
});
