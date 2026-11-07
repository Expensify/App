import {act, render, renderHook} from '@testing-library/react-native';

import {CurrentReportIDContextProvider, useCurrentReportIDActions, useCurrentReportIDState, useIsCurrentReportID} from '@hooks/useCurrentReportID';

import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';

import type {NavigationState} from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Mock Navigation
jest.mock('@libs/Navigation/Navigation', () => ({
    getTopmostReportId: jest.fn(),
}));

// Mock ReportUtils
jest.mock('@libs/ReportUtils', () => ({
    getReportIDFromLink: jest.fn(),
    parseReportRouteParams: jest.fn(() => ({reportID: undefined})),
}));

describe('useCurrentReportID', () => {
    const mockGetTopmostReportId = jest.mocked(Navigation.getTopmostReportId);

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        return waitForBatchedUpdatesWithAct();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    afterAll(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    const onSetCurrentReportID = jest.fn();

    function TestWrapper({children}: {children: React.ReactNode}) {
        return <CurrentReportIDContextProvider onSetCurrentReportID={onSetCurrentReportID}>{children}</CurrentReportIDContextProvider>;
    }

    it('should prevent updates when currentReportID === reportID', async () => {
        // Given the hook is rendered
        const {result} = renderHook(
            () => ({
                state: useCurrentReportIDState(),
                actions: useCurrentReportIDActions(),
            }),
            {
                wrapper: TestWrapper,
            },
        );
        await waitForBatchedUpdatesWithAct();
        // Given the navigation state is set
        const navigationState = createMock<NavigationState>({
            index: 0,
            routes: [
                {
                    key: '1',
                    name: 'Report',
                    params: {reportID: '123'},
                },
            ],
        });

        mockGetTopmostReportId.mockReturnValue('123');

        // When the updateCurrentReportID is called
        act(() => {
            result.current.actions.updateCurrentReportID(navigationState);
        });

        // Then the currentReportID is updated
        expect(result.current.state.currentReportID).toBe('123');
        expect(onSetCurrentReportID).toHaveBeenCalledWith('123');
        onSetCurrentReportID.mockClear();

        // When the updateCurrentReportID is called with the same reportID
        act(() => {
            result.current.actions.updateCurrentReportID(navigationState);
        });

        // Then the setState should not be called again
        expect(onSetCurrentReportID).not.toHaveBeenCalled();
    });

    it('should prevent updates when both currentReportID and reportID are empty/undefined', async () => {
        // Given the hook is rendered
        const {result} = renderHook(
            () => ({
                state: useCurrentReportIDState(),
                actions: useCurrentReportIDActions(),
            }),
            {
                wrapper: TestWrapper,
            },
        );
        await waitForBatchedUpdatesWithAct();

        // Given the navigation state is set
        const navigationState = createMock<NavigationState>({
            index: 0,
            routes: [
                {
                    key: '1',
                    name: 'Home',
                    params: {},
                },
            ],
        });

        mockGetTopmostReportId.mockReturnValue(undefined);

        // When the updateCurrentReportID is called
        act(() => {
            result.current.actions.updateCurrentReportID(navigationState);
        });

        // Then the currentReportID is updated
        expect(result.current.state.currentReportID).toBe('');

        // When the updateCurrentReportID is called with the same navigation state
        act(() => {
            result.current.actions.updateCurrentReportID(navigationState);
        });

        // Then the setState should not be called again
        expect(onSetCurrentReportID).not.toHaveBeenCalled();
    });

    it('should update when reportID changes', async () => {
        // Given the hook is rendered
        const {result} = renderHook(
            () => ({
                state: useCurrentReportIDState(),
                actions: useCurrentReportIDActions(),
            }),
            {
                wrapper: CurrentReportIDContextProvider,
            },
        );
        await waitForBatchedUpdatesWithAct();

        // Given the navigation state is set
        const state1 = createMock<NavigationState>({
            index: 0,
            routes: [
                {
                    key: '1',
                    name: 'Report',
                    params: {reportID: '123'},
                },
            ],
        });

        const state2 = createMock<NavigationState>({
            index: 0,
            routes: [
                {
                    key: '1',
                    name: 'Report',
                    params: {reportID: '456'},
                },
            ],
        });

        mockGetTopmostReportId.mockReturnValueOnce('123').mockReturnValueOnce('456');

        // When the updateCurrentReportID is called
        act(() => {
            result.current.actions.updateCurrentReportID(state1);
        });

        // Then the currentReportID is updated
        expect(result.current.state.currentReportID).toBe('123');

        // When the updateCurrentReportID is called with a different reportID
        act(() => {
            result.current.actions.updateCurrentReportID(state2);
        });

        // Then the currentReportID is updated
        expect(result.current.state.currentReportID).toBe('456');
    });

    it('should prevent updates when navigating to Settings screens', async () => {
        // Given the hook is rendered
        const {result} = renderHook(
            () => ({
                state: useCurrentReportIDState(),
                actions: useCurrentReportIDActions(),
            }),
            {
                wrapper: CurrentReportIDContextProvider,
            },
        );
        await waitForBatchedUpdatesWithAct();

        // Given the navigation state is set
        const settingsState = createMock<NavigationState>({
            index: 0,
            routes: [
                {
                    key: '1',
                    name: 'Settings',
                    params: {
                        screen: 'Settings_Profile',
                    },
                },
            ],
        });

        mockGetTopmostReportId.mockReturnValue('123');

        // When the updateCurrentReportID is called
        act(() => {
            result.current.actions.updateCurrentReportID(settingsState);
        });

        // Then the currentReportID should remain unchanged
        expect(result.current.state.currentReportID).toBe('');
    });

    it('should update context value when currentReportID changes', async () => {
        // Given the hook is rendered
        const {result} = renderHook(
            () => ({
                state: useCurrentReportIDState(),
                actions: useCurrentReportIDActions(),
            }),
            {
                wrapper: CurrentReportIDContextProvider,
            },
        );
        await waitForBatchedUpdatesWithAct();

        // Given the navigation state is set
        const reportState = createMock<NavigationState>({
            index: 0,
            routes: [
                {
                    key: '1',
                    name: 'Report',
                    params: {reportID: '123'},
                },
            ],
        });

        mockGetTopmostReportId.mockReturnValue('123');

        // Given the initial context value is set
        const initialContextValue = result.current.state;

        // When the updateCurrentReportID is called
        act(() => {
            result.current.actions.updateCurrentReportID(reportState);
        });

        // Then the context value is updated
        expect(result.current.state.currentReportID).toBe('123');
        expect(result.current.state).not.toBe(initialContextValue);
    });

    it('should only re-render the rows whose current report state changes', async () => {
        const onRowRender = jest.fn<void, [string, boolean]>();
        const onActions = jest.fn<void, [(state: NavigationState) => void]>();

        type RowProps = {reportID: string};
        function Row({reportID}: RowProps) {
            onRowRender(reportID, useIsCurrentReportID(reportID));
            return null;
        }
        function Actions() {
            onActions(useCurrentReportIDActions().updateCurrentReportID);
            return null;
        }

        // Given three rows under one provider
        render(
            <TestWrapper>
                <Actions />
                <Row reportID="1" />
                <Row reportID="2" />
                <Row reportID="3" />
            </TestWrapper>,
        );
        await waitForBatchedUpdatesWithAct();
        const updateCurrentReportID = onActions.mock.lastCall?.[0];

        // When report 1 and then report 2 become the current report
        for (const reportID of ['1', '2']) {
            mockGetTopmostReportId.mockReturnValue(reportID);
            await act(async () => {
                updateCurrentReportID?.(createMock<NavigationState>({index: 0, routes: [{key: reportID, name: 'Report', params: {reportID}}]}));
                await waitForBatchedUpdatesWithAct();
            });
        }

        // Then only report 2 is current, and the row that was never current never re-rendered
        const renders = (reportID: string) => onRowRender.mock.calls.filter(([id]) => id === reportID);
        expect(renders('1').map(([, isCurrent]) => isCurrent)).toEqual([false, true, false]);
        expect(renders('2').map(([, isCurrent]) => isCurrent)).toEqual([false, true]);
        expect(renders('3').map(([, isCurrent]) => isCurrent)).toEqual([false]);
    });
});
