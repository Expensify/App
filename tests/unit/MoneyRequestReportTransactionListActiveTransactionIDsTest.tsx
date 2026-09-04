import {renderHook} from '@testing-library/react-native';

import {CAROUSEL_SOURCE, clearActiveTransactionIDsForSource, getActiveTransactionIDs, setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import {navigationRef} from '@libs/Navigation/Navigation';

import SCREENS from '@src/SCREENS';

import {findFocusedRoute} from '@react-navigation/native';
import {useEffect, useMemo, useRef} from 'react';

import createRandomTransaction from '../utils/collections/transaction';
import createMock from '../utils/createMock';

// Mock the TransactionThreadNavigation module
jest.mock('@libs/actions/TransactionThreadNavigation', () => ({
    setActiveTransactionIDs: jest.fn(() => Promise.resolve()),
    clearActiveTransactionIDsForSource: jest.fn(() => Promise.resolve()),
    getActiveTransactionIDs: jest.fn(() => ({ids: null, descriptors: null, source: null})),
    CAROUSEL_SOURCE: {report: (reportID: string | undefined) => `report:${reportID}`},
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

const REPORT_ID = 'reportA';
const CAROUSEL_SOURCE_FOR_REPORT = `report:${REPORT_ID}`;

/**
 * This hook replicates the active transaction IDs logic from MoneyRequestReportTransactionList
 * to allow isolated testing of the useEffect behavior.
 */
function useActiveTransactionIDsEffect(visualOrderTransactionIDs: string[]) {
    const visualOrderTransactionIDsKey = useMemo(() => visualOrderTransactionIDs.join(','), [visualOrderTransactionIDs]);
    const carouselSource = CAROUSEL_SOURCE.report(REPORT_ID);
    const hasSeededCarouselRef = useRef(false);

    useEffect(() => {
        const focusedRoute = findFocusedRoute(navigationRef.getRootState());
        if (focusedRoute?.name !== SCREENS.RIGHT_MODAL.SEARCH_REPORT) {
            return;
        }
        if (getActiveTransactionIDs().descriptors) {
            return;
        }
        if (visualOrderTransactionIDs.length < 2) {
            return;
        }
        setActiveTransactionIDs(visualOrderTransactionIDs, {source: carouselSource});
        hasSeededCarouselRef.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps -- visualOrderTransactionIDsKey is an order-sensitive proxy for the array
    }, [visualOrderTransactionIDsKey, carouselSource]);

    useEffect(() => {
        return () => {
            if (!hasSeededCarouselRef.current) {
                return;
            }
            hasSeededCarouselRef.current = false;
            clearActiveTransactionIDsForSource(carouselSource);
        };
    }, [carouselSource]);

    return {visualOrderTransactionIDsKey};
}

describe('MoneyRequestReportTransactionList - Active Transaction IDs Effect', () => {
    const mockSetActiveTransactionIDs = jest.mocked(setActiveTransactionIDs);
    const mockClearActiveTransactionIDsForSource = jest.mocked(clearActiveTransactionIDsForSource);
    const mockGetActiveTransactionIDs = jest.mocked(getActiveTransactionIDs);
    const mockFindFocusedRoute = jest.mocked(findFocusedRoute);
    const mockGetRootState = jest.spyOn(navigationRef, 'getRootState');

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetActiveTransactionIDs.mockReturnValue({ids: null, descriptors: null, source: null});
        mockGetRootState.mockReturnValue(createMock<NonNullable<ReturnType<typeof navigationRef.getRootState>>>({}));
    });

    it('should call setActiveTransactionIDs when focused route is SEARCH_REPORT', () => {
        // Given the focused route is SEARCH_REPORT
        mockFindFocusedRoute.mockReturnValue({name: SCREENS.RIGHT_MODAL.SEARCH_REPORT, key: 'test-key'});

        const transactionIDs = ['trans1', 'trans2', 'trans3'];

        // When the hook is rendered
        renderHook(() => useActiveTransactionIDsEffect(transactionIDs));

        // Then setActiveTransactionIDs should be called with the transaction IDs, stamped with this report's source
        expect(mockSetActiveTransactionIDs).toHaveBeenCalledWith(transactionIDs, {source: CAROUSEL_SOURCE_FOR_REPORT});
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

        const transactionIDs = ['trans1', 'trans2'];

        // When the hook is rendered
        renderHook(() => useActiveTransactionIDsEffect(transactionIDs));

        // Then setActiveTransactionIDs should NOT be called
        expect(mockSetActiveTransactionIDs).not.toHaveBeenCalled();
    });

    // A report with one expense (or none) has nothing to page between. Seeding it would clobber the broader carousel
    // the user drilled in from, and leave the header rendering an empty expense carousel.
    it.each([
        ['a single transaction', ['trans1']],
        ['no transactions', [] as string[]],
    ])('should NOT seed the carousel for a report with %s', (_label, transactionIDs) => {
        mockFindFocusedRoute.mockReturnValue({name: SCREENS.RIGHT_MODAL.SEARCH_REPORT, key: 'test-key'});

        renderHook(() => useActiveTransactionIDsEffect(transactionIDs));

        expect(mockSetActiveTransactionIDs).not.toHaveBeenCalled();
    });

    it('should release the carousel on unmount when route was SEARCH_REPORT', () => {
        // Given the focused route is SEARCH_REPORT
        mockFindFocusedRoute.mockReturnValue({name: SCREENS.RIGHT_MODAL.SEARCH_REPORT, key: 'test-key'});

        const transactionIDs = ['trans1', 'trans2'];

        // When the hook is rendered and then unmounted
        const {unmount} = renderHook(() => useActiveTransactionIDsEffect(transactionIDs));

        expect(mockClearActiveTransactionIDsForSource).not.toHaveBeenCalled();

        unmount();

        // Then it should release only its own carousel, not whatever is active
        expect(mockClearActiveTransactionIDsForSource).toHaveBeenCalledTimes(1);
        expect(mockClearActiveTransactionIDsForSource).toHaveBeenCalledWith(CAROUSEL_SOURCE_FOR_REPORT);
    });

    it('should NOT release the carousel on unmount when route was NOT SEARCH_REPORT', () => {
        // Given the focused route is NOT SEARCH_REPORT
        mockFindFocusedRoute.mockReturnValue({name: 'SomeOtherRoute', key: 'test-key'});

        const transactionIDs = ['trans1', 'trans2'];

        // When the hook is rendered and then unmounted
        const {unmount} = renderHook(() => useActiveTransactionIDsEffect(transactionIDs));

        unmount();

        // Then nothing was seeded, so nothing should be released
        expect(mockClearActiveTransactionIDsForSource).not.toHaveBeenCalled();
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
        expect(mockSetActiveTransactionIDs).toHaveBeenLastCalledWith(initialTransactionIDs, {source: CAROUSEL_SOURCE_FOR_REPORT});

        // When the transaction IDs change
        const newTransactionIDs = ['trans1', 'trans2', 'trans3'];
        rerender({ids: newTransactionIDs});

        // Then setActiveTransactionIDs should be called again with the new IDs
        expect(mockSetActiveTransactionIDs).toHaveBeenCalledTimes(2);
        expect(mockSetActiveTransactionIDs).toHaveBeenLastCalledWith(newTransactionIDs, {source: CAROUSEL_SOURCE_FOR_REPORT});
    });

    /**
     * Regression guard for https://github.com/Expensify/App/issues/99630: teardown used to be the seeding effect's
     * own cleanup, so React ran it on every re-seed. Any run that then bailed out at a guard left the carousel
     * cleared, and the arrows vanished after an action that changed the report's transactions (duplicating an
     * expense, for instance).
     */
    it('should NOT release the carousel while re-seeding it', () => {
        mockFindFocusedRoute.mockReturnValue({name: SCREENS.RIGHT_MODAL.SEARCH_REPORT, key: 'test-key'});

        const {rerender} = renderHook(({ids}) => useActiveTransactionIDsEffect(ids), {
            initialProps: {ids: ['trans1', 'trans2']},
        });

        rerender({ids: ['trans1', 'trans2', 'trans3']});

        expect(mockClearActiveTransactionIDsForSource).not.toHaveBeenCalled();
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
        expect(mockClearActiveTransactionIDsForSource).not.toHaveBeenCalled();
    });

    it('should NOT take over a snapshot-backed carousel that already has sibling descriptors', () => {
        // Given the focused route is SEARCH_REPORT and a descriptor-backed carousel (e.g. Home "Recently added") is active
        mockFindFocusedRoute.mockReturnValue({name: SCREENS.RIGHT_MODAL.SEARCH_REPORT, key: 'test-key'});
        mockGetActiveTransactionIDs.mockReturnValue({
            ids: ['recentlyAdded1', 'recentlyAdded2'],
            descriptors: {recentlyAdded1: {reportID: 'r1', transaction: {...createRandomTransaction(1), transactionID: 'recentlyAdded1'}}},
            source: 'home:recentlyAdded',
        });

        const transactionIDs = ['trans1', 'trans2', 'trans3'];

        // When the hook is rendered and then unmounted
        const {unmount} = renderHook(() => useActiveTransactionIDsEffect(transactionIDs));

        // Then it should neither overwrite nor clear the existing carousel context
        expect(mockSetActiveTransactionIDs).not.toHaveBeenCalled();

        unmount();

        expect(mockClearActiveTransactionIDsForSource).not.toHaveBeenCalled();
    });
});
