import {renderHook} from '@testing-library/react-native';

import {clearActiveTransactionIDs, getActiveTransactionIDs, setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import {navigationRef} from '@libs/Navigation/Navigation';

import SCREENS from '@src/SCREENS';

import {findFocusedRoute} from '@react-navigation/native';
import {useEffect, useMemo} from 'react';

import createRandomTransaction from '../utils/collections/transaction';

// Mock the TransactionThreadNavigation module
jest.mock('@libs/actions/TransactionThreadNavigation', () => ({
    setActiveTransactionIDs: jest.fn(() => Promise.resolve()),
    clearActiveTransactionIDs: jest.fn(() => Promise.resolve()),
    getActiveTransactionIDs: jest.fn(() => ({ids: null, descriptors: null})),
}));

// Mock the navigation module
jest.mock('@libs/Navigation/Navigation', () => ({
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    navigationRef: {
        getRootState: jest.fn(),
    },
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
    findFocusedRoute: jest.fn(),
    useFocusEffect: jest.fn(),
}));

/**
 * This hook replicates the active transaction IDs logic from MoneyRequestReportTransactionList
 * to allow isolated testing of the useEffect behavior.
 */
function useActiveTransactionIDsEffect(visualOrderTransactionIDs: string[]) {
    const visualOrderTransactionIDsKey = useMemo(() => visualOrderTransactionIDs.join(','), [visualOrderTransactionIDs]);

    useEffect(() => {
        const focusedRoute = findFocusedRoute(navigationRef.getRootState());
        if (focusedRoute?.name !== SCREENS.RIGHT_MODAL.SEARCH_REPORT) {
            return;
        }
        if (getActiveTransactionIDs().descriptors) {
            return;
        }
        setActiveTransactionIDs(visualOrderTransactionIDs);
        return () => {
            clearActiveTransactionIDs();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- visualOrderTransactionIDsKey is a primitive proxy for the array
    }, [visualOrderTransactionIDsKey]);

    return {visualOrderTransactionIDsKey};
}

describe('MoneyRequestReportTransactionList - Active Transaction IDs Effect', () => {
    const mockSetActiveTransactionIDs = jest.mocked(setActiveTransactionIDs);
    const mockClearActiveTransactionIDs = jest.mocked(clearActiveTransactionIDs);
    const mockGetActiveTransactionIDs = jest.mocked(getActiveTransactionIDs);
    const mockFindFocusedRoute = jest.mocked(findFocusedRoute);

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetActiveTransactionIDs.mockReturnValue({ids: null, descriptors: null});
        (navigationRef.getRootState as jest.Mock).mockReturnValue({} as ReturnType<typeof navigationRef.getRootState>);
    });

    it('should call setActiveTransactionIDs when focused route is SEARCH_REPORT', () => {
        // Given the focused route is SEARCH_REPORT
        mockFindFocusedRoute.mockReturnValue({name: SCREENS.RIGHT_MODAL.SEARCH_REPORT, key: 'test-key'});

        const transactionIDs = ['trans1', 'trans2', 'trans3'];

        // When the hook is rendered
        renderHook(() => useActiveTransactionIDsEffect(transactionIDs));

        // Then setActiveTransactionIDs should be called with the transaction IDs
        expect(mockSetActiveTransactionIDs).toHaveBeenCalledWith(transactionIDs);
    });

    it('should NOT call setActiveTransactionIDs when focused route is NOT SEARCH_REPORT', () => {
        // Given the focused route is something other than SEARCH_REPORT
        mockFindFocusedRoute.mockReturnValue({name: 'SomeOtherRoute', key: 'test-key'});

        const transactionIDs = ['trans1', 'trans2'];

        // When the hook is rendered
        renderHook(() => useActiveTransactionIDsEffect(transactionIDs));

        // Then setActiveTransactionIDs should NOT be called
        expect(mockSetActiveTransactionIDs).not.toHaveBeenCalled();
    });

    it('should NOT call setActiveTransactionIDs when focused route is undefined', () => {
        // Given there is no focused route
        mockFindFocusedRoute.mockReturnValue(undefined);

        const transactionIDs = ['trans1'];

        // When the hook is rendered
        renderHook(() => useActiveTransactionIDsEffect(transactionIDs));

        // Then setActiveTransactionIDs should NOT be called
        expect(mockSetActiveTransactionIDs).not.toHaveBeenCalled();
    });

    it('should call clearActiveTransactionIDs on unmount when route was SEARCH_REPORT', () => {
        // Given the focused route is SEARCH_REPORT
        mockFindFocusedRoute.mockReturnValue({name: SCREENS.RIGHT_MODAL.SEARCH_REPORT, key: 'test-key'});

        const transactionIDs = ['trans1', 'trans2'];

        // When the hook is rendered and then unmounted
        const {unmount} = renderHook(() => useActiveTransactionIDsEffect(transactionIDs));

        expect(mockClearActiveTransactionIDs).not.toHaveBeenCalled();

        unmount();

        // Then clearActiveTransactionIDs should be called
        expect(mockClearActiveTransactionIDs).toHaveBeenCalledTimes(1);
    });

    it('should NOT call clearActiveTransactionIDs on unmount when route was NOT SEARCH_REPORT', () => {
        // Given the focused route is NOT SEARCH_REPORT
        mockFindFocusedRoute.mockReturnValue({name: 'SomeOtherRoute', key: 'test-key'});

        const transactionIDs = ['trans1'];

        // When the hook is rendered and then unmounted
        const {unmount} = renderHook(() => useActiveTransactionIDsEffect(transactionIDs));

        unmount();

        // Then clearActiveTransactionIDs should NOT be called (since the effect returned early, no cleanup was registered)
        expect(mockClearActiveTransactionIDs).not.toHaveBeenCalled();
    });

    it('should update active transaction IDs when the list changes', () => {
        // Given the focused route is SEARCH_REPORT
        mockFindFocusedRoute.mockReturnValue({name: SCREENS.RIGHT_MODAL.SEARCH_REPORT, key: 'test-key'});

        const initialTransactionIDs = ['trans1', 'trans2'];

        // When the hook is rendered
        const {rerender} = renderHook(({ids}) => useActiveTransactionIDsEffect(ids), {
            initialProps: {ids: initialTransactionIDs},
        });

        expect(mockSetActiveTransactionIDs).toHaveBeenCalledTimes(1);
        expect(mockSetActiveTransactionIDs).toHaveBeenLastCalledWith(initialTransactionIDs);

        // When the transaction IDs change
        const newTransactionIDs = ['trans1', 'trans2', 'trans3'];
        rerender({ids: newTransactionIDs});

        // Then setActiveTransactionIDs should be called again with the new IDs
        expect(mockSetActiveTransactionIDs).toHaveBeenCalledTimes(2);
        expect(mockSetActiveTransactionIDs).toHaveBeenLastCalledWith(newTransactionIDs);
    });

    it('should NOT re-fire when array reference changes but content is the same', () => {
        // Given the focused route is SEARCH_REPORT
        mockFindFocusedRoute.mockReturnValue({name: SCREENS.RIGHT_MODAL.SEARCH_REPORT, key: 'test-key'});

        const initialTransactionIDs = ['trans1', 'trans2'];

        // When the hook is rendered
        const {rerender} = renderHook(({ids}) => useActiveTransactionIDsEffect(ids), {
            initialProps: {ids: initialTransactionIDs},
        });

        expect(mockSetActiveTransactionIDs).toHaveBeenCalledTimes(1);

        // When rerendering with a new array reference but same content
        const sameContentNewArray = ['trans1', 'trans2'];
        rerender({ids: sameContentNewArray});

        // Then the effect should NOT re-fire because the join(',') key hasn't changed.
        // This prevents overwriting IDs set by other callers (e.g. TransactionDuplicateReview.onPreviewPressed).
        expect(mockSetActiveTransactionIDs).toHaveBeenCalledTimes(1);
        expect(mockClearActiveTransactionIDs).not.toHaveBeenCalled();
    });

    it('should NOT take over a snapshot-backed carousel that already has sibling descriptors', () => {
        // Given the focused route is SEARCH_REPORT and a descriptor-backed carousel (e.g. Home "Recently added") is active
        mockFindFocusedRoute.mockReturnValue({name: SCREENS.RIGHT_MODAL.SEARCH_REPORT, key: 'test-key'});
        mockGetActiveTransactionIDs.mockReturnValue({
            ids: ['recentlyAdded1', 'recentlyAdded2'],
            descriptors: {recentlyAdded1: {reportID: 'r1', transaction: {...createRandomTransaction(1), transactionID: 'recentlyAdded1'}}},
        });

        const transactionIDs = ['trans1', 'trans2', 'trans3'];

        // When the hook is rendered and then unmounted
        const {unmount} = renderHook(() => useActiveTransactionIDsEffect(transactionIDs));

        // Then it should neither overwrite nor clear the existing carousel context
        expect(mockSetActiveTransactionIDs).not.toHaveBeenCalled();

        unmount();

        expect(mockClearActiveTransactionIDs).not.toHaveBeenCalled();
    });

    it('should handle empty transaction IDs array', () => {
        // Given the focused route is SEARCH_REPORT
        mockFindFocusedRoute.mockReturnValue({name: SCREENS.RIGHT_MODAL.SEARCH_REPORT, key: 'test-key'});

        const emptyTransactionIDs: string[] = [];

        // When the hook is rendered with empty array
        renderHook(() => useActiveTransactionIDsEffect(emptyTransactionIDs));

        // Then setActiveTransactionIDs should be called with empty array
        expect(mockSetActiveTransactionIDs).toHaveBeenCalledWith([]);
    });
});
