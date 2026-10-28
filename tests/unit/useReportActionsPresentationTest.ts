import {act, renderHook} from '@testing-library/react-native';

import moveAccessibilityFocus from '@libs/Accessibility/moveAccessibilityFocus';

import useReportActionsPresentation from '@pages/inbox/report/useReportActionsPresentation';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import createMock from '../utils/createMock';
import {buildSystemAction} from '../utils/ReportTestUtils';

jest.mock('@libs/Accessibility/moveAccessibilityFocus', () => jest.fn());

type PresentationProps = Parameters<typeof useReportActionsPresentation>[0];

const older = buildSystemAction('older', {created: '2026-10-26 10:00:00.000'});
const newer = buildSystemAction('newer', {created: '2026-10-26 10:01:00.000'});
const backgroundUpdate = buildSystemAction('background', {created: '2026-10-26 10:02:00.000'});

describe('system-message expansion focus', () => {
    beforeEach(() => jest.clearAllMocks());

    it.each([false, true])('hands focus to the first revealed message only once after mounting (newest first: %s)', (newestFirst) => {
        // Given either list direction and a collapsed group whose rows have not mounted yet
        const visibleReportActions = newestFirst ? [newer, older] : [older, newer];
        const target = createMock<ComponentRef<typeof View>>({focus: jest.fn()});
        const {result, rerender} = renderHook((props: PresentationProps) => useReportActionsPresentation(props), {initialProps: {visibleReportActions}});

        // When the user expands the group, keep focus pending until the first message has a host
        act(() => result.current.expandSystemMessageRun([older.reportActionID, newer.reportActionID]));
        expect(result.current.displayReportActions).toEqual(visibleReportActions);
        expect(result.current.focusRequestedReportActionID).toBe(older.reportActionID);
        expect(moveAccessibilityFocus).not.toHaveBeenCalled();
        act(() => {
            result.current.onExpandedSystemMessageReady(newer.reportActionID, target);
            result.current.onExpandedSystemMessageReady(older.reportActionID, null);
        });
        expect(moveAccessibilityFocus).not.toHaveBeenCalled();

        // Then its first ready callback consumes the request, even if it fires again before React rerenders
        act(() => {
            result.current.onExpandedSystemMessageReady(older.reportActionID, target);
            result.current.onExpandedSystemMessageReady(older.reportActionID, target);
        });
        expect(moveAccessibilityFocus).toHaveBeenCalledTimes(1);
        expect(moveAccessibilityFocus).toHaveBeenCalledWith(target);
        expect(result.current.focusRequestedReportActionID).toBeUndefined();

        // Later background updates and recycled callbacks must leave the user's new position alone
        rerender({visibleReportActions: newestFirst ? [backgroundUpdate, newer, older] : [older, newer, backgroundUpdate]});
        act(() => result.current.onExpandedSystemMessageReady(older.reportActionID, target));
        expect(moveAccessibilityFocus).toHaveBeenCalledTimes(1);
    });

    it('never requests focus for automatic deep-link expansion or background updates', () => {
        // Given a hidden member opened through a route, without a user pressing the summary
        const target = createMock<ComponentRef<typeof View>>({focus: jest.fn()});
        const initialProps: PresentationProps = {visibleReportActions: [newer, older], linkedReportActionID: older.reportActionID};
        const {result, rerender} = renderHook((props: PresentationProps) => useReportActionsPresentation(props), {initialProps});

        // When the route reveals the run and more updates arrive
        expect(result.current.displayReportActions).toEqual([newer, older]);
        rerender({...initialProps, visibleReportActions: [backgroundUpdate, newer, older]});
        act(() => result.current.onExpandedSystemMessageReady(older.reportActionID, target));

        // Then automatic expansion remains separate from manual focus intent
        expect(result.current.focusRequestedReportActionID).toBeUndefined();
        expect(moveAccessibilityFocus).not.toHaveBeenCalled();
    });
});
