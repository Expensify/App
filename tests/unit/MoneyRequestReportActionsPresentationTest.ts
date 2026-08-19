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

    it('expands a linked member once and permits an explicit collapse', () => {
        const {result, rerender} = renderHook(
            (props: {linkedReportActionID?: string}) =>
                useReportActionsPresentation({
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

    it('expands a newly linked run on the first render after a same-screen route change', () => {
        const separatedVisibleReportActions = [makeAction('1'), makeAction('2'), {...makeAction('3'), actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}, makeAction('4'), makeAction('5')];
        const {result, rerender} = renderHook(
            (props: {linkedReportActionID?: string}) =>
                useReportActionsPresentation({
                    visibleReportActions: separatedVisibleReportActions,
                    linkedReportActionID: props.linkedReportActionID,
                }),
            {initialProps: {linkedReportActionID: '1'}},
        );

        act(() => {
            result.current.toggleSystemMessageRun(['1', '2'], true);
        });
        const displayStateSpy = jest.spyOn(ReportActionsUtils, 'getSystemMessageDisplayState');

        rerender({linkedReportActionID: '5'});

        expect(displayStateSpy.mock.calls.at(0)?.at(2)).toEqual(['5']);
        expect(result.current.displayReportActions.map((reportAction) => reportAction.reportActionID)).toEqual(['1', '3', '4', '5']);
        expect(result.current.reportActionIDToDisplayIndex.get('5')).toBe(3);
        displayStateSpy.mockRestore();
    });

    it('forgets a manual collapse after the route stops targeting the linked action', () => {
        const initialProps: {linkedReportActionID?: string} = {linkedReportActionID: '2'};
        const {result, rerender} = renderHook(
            (props: {linkedReportActionID?: string}) =>
                useReportActionsPresentation({
                    visibleReportActions,
                    linkedReportActionID: props.linkedReportActionID,
                }),
            {initialProps},
        );

        act(() => {
            result.current.toggleSystemMessageRun(['1', '2', '3'], true);
        });
        expect(result.current.runsByAnchorReportActionID.get('1')?.isExpanded).toBe(false);

        rerender({linkedReportActionID: undefined});
        expect(result.current.runsByAnchorReportActionID.get('1')?.isExpanded).toBe(false);

        rerender({linkedReportActionID: '2'});

        expect(result.current.displayReportActions).toEqual(visibleReportActions);
        expect(result.current.runsByAnchorReportActionID.get('1')?.isExpanded).toBe(true);
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
