import type {NavigationState} from '@react-navigation/native';
import {act, renderHook} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import useCurrentReportID, {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        Onyx.clear();
        return waitForBatchedUpdates();
    });

    afterAll(async () => {
        Onyx.clear();
        await waitForBatchedUpdates();
    });

    const onSetCurrentReportID = jest.fn();

    function TestWrapper({children}: {children: React.ReactNode}) {
        return <CurrentReportIDContextProvider onSetCurrentReportID={onSetCurrentReportID}>{children}</CurrentReportIDContextProvider>;
    }

    it('should prevent updates when currentReportID === reportID', () => {
        // Given the hook is rendered
        const {result} = renderHook(() => useCurrentReportID(), {
            wrapper: TestWrapper,
        });
        // Given the navigation state is set
        const navigationState = {
            index: 0,
            routes: [
                {
                    key: '1',
                    name: 'Report',
                    params: {reportID: '123'},
                },
            ],
        } as NavigationState;

        mockGetTopmostReportId.mockReturnValue('123');

        // When the updateCurrentReportID is called
        act(() => {
            result.current?.updateCurrentReportID(navigationState);
        });

        // Then the currentReportID is updated
        expect(result.current?.currentReportID).toBe('123');
        expect(onSetCurrentReportID).toHaveBeenCalledWith('123');
        onSetCurrentReportID.mockClear();

        // When the updateCurrentReportID is called with the same reportID
        act(() => {
            result.current?.updateCurrentReportID(navigationState);
        });

        // Then the setState should not be called again
        expect(onSetCurrentReportID).not.toHaveBeenCalled();
    });

    it('should prevent updates when both currentReportID and reportID are empty/undefined', () => {
        // Given the hook is rendered
        const {result} = renderHook(() => useCurrentReportID(), {
            wrapper: TestWrapper,
        });

        // Given the navigation state is set
        const navigationState = {
            index: 0,
            routes: [
                {
                    key: '1',
                    name: 'Home',
                    params: {},
                },
            ],
        } as NavigationState;

        mockGetTopmostReportId.mockReturnValue(undefined);

        // When the updateCurrentReportID is called
        act(() => {
            result.current?.updateCurrentReportID(navigationState);
        });

        // Then the currentReportID is updated
        expect(result.current?.currentReportID).toBe('');

        // When the updateCurrentReportID is called with the same navigation state
        act(() => {
            result.current?.updateCurrentReportID(navigationState);
        });

        // Then the setState should not be called again
        expect(onSetCurrentReportID).not.toHaveBeenCalled();
    });

    it('should update when reportID changes', () => {
        // Given the hook is rendered
        const {result} = renderHook(() => useCurrentReportID(), {
            wrapper: CurrentReportIDContextProvider,
        });

        // Given the navigation state is set
        const state1 = {
            index: 0,
            routes: [
                {
                    key: '1',
                    name: 'Report',
                    params: {reportID: '123'},
                },
            ],
        } as NavigationState;

        const state2 = {
            index: 0,
            routes: [
                {
                    key: '1',
                    name: 'Report',
                    params: {reportID: '456'},
                },
            ],
        } as NavigationState;

        mockGetTopmostReportId.mockReturnValueOnce('123').mockReturnValueOnce('456');

        // When the updateCurrentReportID is called
        act(() => {
            result.current?.updateCurrentReportID(state1);
        });

        // Then the currentReportID is updated
        expect(result.current?.currentReportID).toBe('123');

        // When the updateCurrentReportID is called with a different reportID
        act(() => {
            result.current?.updateCurrentReportID(state2);
        });

        // Then the currentReportID is updated
        expect(result.current?.currentReportID).toBe('456');
    });

    it('should prevent updates when navigating to Settings screens', () => {
        // Given the hook is rendered
        const {result} = renderHook(() => useCurrentReportID(), {
            wrapper: CurrentReportIDContextProvider,
        });

        // Given the navigation state is set
        const settingsState = {
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
        } as NavigationState;

        mockGetTopmostReportId.mockReturnValue('123');

        // When the updateCurrentReportID is called
        act(() => {
            result.current?.updateCurrentReportID(settingsState);
        });

        // Then the currentReportID should remain unchanged
        expect(result.current?.currentReportID).toBe('');
    });

    it('should update context value when currentReportID changes', () => {
        // Given the hook is rendered
        const {result} = renderHook(() => useCurrentReportID(), {
            wrapper: CurrentReportIDContextProvider,
        });

        // Given the navigation state is set
        const reportState = {
            index: 0,
            routes: [
                {
                    key: '1',
                    name: 'Report',
                    params: {reportID: '123'},
                },
            ],
        } as NavigationState;

        mockGetTopmostReportId.mockReturnValue('123');

        // Given the initial context value is set
        const initialContextValue = result.current;

        // When the updateCurrentReportID is called
        act(() => {
            result.current?.updateCurrentReportID(reportState);
        });

        // Then the context value is updated
        expect(result.current?.currentReportID).toBe('123');
        expect(result.current).not.toBe(initialContextValue);
    });
});
