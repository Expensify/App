import {findFocusedRoute} from '@react-navigation/native';
import {renderHook} from '@testing-library/react-native';
import {useEffect} from 'react';
import useDeepCompareRef from '@hooks/useDeepCompareRef';
import {clearActiveTransactionIDs, setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import {navigationRef} from '@libs/Navigation/Navigation';
import SCREENS from '@src/SCREENS';

// Mock the TransactionThreadNavigation module
jest.mock('@libs/actions/TransactionThreadNavigation', () => ({
    setActiveTransactionIDs: jest.fn(() => Promise.resolve()),
    clearActiveTransactionIDs: jest.fn(() => Promise.resolve()),
}));

// Mock the navigation module
jest.mock('@libs/Navigation/Navigation', () => ({
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
    const visualOrderTransactionIDsDeepCompare = useDeepCompareRef(visualOrderTransactionIDs);

    useEffect(() => {
        const focusedRoute = findFocusedRoute(navigationRef.getRootState());
        if (focusedRoute?.name !== SCREENS.RIGHT_MODAL.SEARCH_REPORT) {
            return;
        }
        setActiveTransactionIDs(visualOrderTransactionIDsDeepCompare ?? []);
        return () => {
            clearActiveTransactionIDs();
        };
    }, [visualOrderTransactionIDsDeepCompare]);

    return {visualOrderTransactionIDsDeepCompare};
}

describe('MoneyRequestReportTransactionList - Active Transaction IDs Effect', () => {
    const mockSetActiveTransactionIDs = setActiveTransactionIDs as jest.MockedFunction<typeof setActiveTransactionIDs>;
    const mockClearActiveTransactionIDs = clearActiveTransactionIDs as jest.MockedFunction<typeof clearActiveTransactionIDs>;
    const mockFindFocusedRoute = findFocusedRoute as jest.MockedFunction<typeof findFocusedRoute>;
    const mockGetRootState = navigationRef.getRootState as jest.MockedFunction<typeof navigationRef.getRootState>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetRootState.mockReturnValue({} as ReturnType<typeof navigationRef.getRootState>);
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

        // Then clearActiveTransactionIDs should NOT be called (since the effect returned early)
        expect(mockClearActiveTransactionIDs).not.toHaveBeenCalled();
    });

    it('should update active transaction IDs when the list changes (deep comparison)', () => {
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

    it('should NOT update when transaction IDs array has same content (deep comparison)', () => {
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

        // Then setActiveTransactionIDs should NOT be called again (deep comparison prevents it)
        expect(mockSetActiveTransactionIDs).toHaveBeenCalledTimes(1);
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
