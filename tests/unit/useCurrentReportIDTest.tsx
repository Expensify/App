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

    it('should prevent updates when currentReportID === reportID', () => {
        const {result} = renderHook(() => useCurrentReportID(), {
            wrapper: CurrentReportIDContextProvider,
        });

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

        // First update should work
        act(() => {
            result.current?.updateCurrentReportID(navigationState);
        });

        expect(result.current?.currentReportID).toBe('123');

        // Second update with same reportID should be prevented
        const setStateSpy = jest.spyOn(React, 'useState');
        act(() => {
            result.current?.updateCurrentReportID(navigationState);
        });

        // The setState should not be called again
        expect(setStateSpy).not.toHaveBeenCalled();
    });

    it('should prevent updates when both currentReportID and reportID are empty/undefined', () => {
        const {result} = renderHook(() => useCurrentReportID(), {
            wrapper: CurrentReportIDContextProvider,
        });

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

        // First update should work
        act(() => {
            result.current?.updateCurrentReportID(navigationState);
        });

        expect(result.current?.currentReportID).toBe('');

        // Second update with both undefined should be prevented
        const setStateSpy = jest.spyOn(React, 'useState');
        act(() => {
            result.current?.updateCurrentReportID(navigationState);
        });

        // The setState should not be called again
        expect(setStateSpy).not.toHaveBeenCalled();
    });

    it('should update when reportID changes', () => {
        const {result} = renderHook(() => useCurrentReportID(), {
            wrapper: CurrentReportIDContextProvider,
        });

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

        // First update
        act(() => {
            result.current?.updateCurrentReportID(state1);
        });

        expect(result.current?.currentReportID).toBe('123');

        // Second update with different reportID
        act(() => {
            result.current?.updateCurrentReportID(state2);
        });

        expect(result.current?.currentReportID).toBe('456');
    });

    it('should prevent updates when navigating to Settings screens', () => {
        const {result} = renderHook(() => useCurrentReportID(), {
            wrapper: CurrentReportIDContextProvider,
        });

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

        // Update should be prevented for Settings screen
        act(() => {
            result.current?.updateCurrentReportID(settingsState);
        });

        // The currentReportID should remain unchanged
        expect(result.current?.currentReportID).toBe('');
    });

    it('should update context value when currentReportID changes', () => {
        const {result} = renderHook(() => useCurrentReportID(), {
            wrapper: CurrentReportIDContextProvider,
        });

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

        const initialContextValue = result.current;

        act(() => {
            result.current?.updateCurrentReportID(reportState);
        });

        // Context value should be updated
        expect(result.current?.currentReportID).toBe('123');
        expect(result.current).not.toBe(initialContextValue);
    });
});
