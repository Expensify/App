import {renderHook} from '@testing-library/react-native';

import useRulesPrefetch from '@hooks/useRulesPrefetch';

import {getRules, resetRulesFetchState} from '@libs/actions/Policy/Rules';

jest.mock('@libs/actions/Policy/Rules', () => ({
    getRules: jest.fn(),
    resetRulesFetchState: jest.fn(),
}));

let mockIsOffline = false;
let mockOnReconnect: (() => void) | undefined;

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: ({onReconnect}: {onReconnect?: () => void} = {}) => {
        mockOnReconnect = onReconnect;
        return {isOffline: mockIsOffline};
    },
}));

let mockHasBeenFetched: boolean | undefined = false;
let mockIsLoadingRules: boolean | undefined = false;
let mockHasFetchFailed: boolean | undefined = false;

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => {
        if (key === 'isLoadingRules') {
            return [mockIsLoadingRules];
        }
        if (key === 'hasRulesFetchFailed') {
            return [mockHasFetchFailed];
        }
        return [mockHasBeenFetched, {status: 'loaded'}];
    },
}));

jest.mock('@src/types/utils/isLoadingOnyxValue', () => ({
    __esModule: true,
    default: () => false,
}));

const mockGetRules = jest.mocked(getRules);

describe('useRulesPrefetch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsOffline = false;
        mockHasBeenFetched = false;
        mockIsLoadingRules = false;
        mockHasFetchFailed = false;
        mockOnReconnect = undefined;
    });

    it('asks for the collection once per mount', () => {
        // Given a screen that needs the rules collection

        // When it renders and re-renders
        const {rerender} = renderHook(() => useRulesPrefetch(true));
        rerender({});

        // Then one fetch is sent, because the response SETs the whole collection
        expect(mockGetRules).toHaveBeenCalledTimes(1);
    });

    it('does not ask again when its own fetch fails while the screen stays open', () => {
        // Given a screen that sent the fetch on mount, which is then in flight
        const {rerender} = renderHook(() => useRulesPrefetch(true));
        mockIsLoadingRules = true;
        rerender({});

        // When the fetch fails, which clears the in-flight flag and leaves the collection unfetched
        mockIsLoadingRules = false;
        mockHasBeenFetched = false;
        mockHasFetchFailed = true;
        rerender({});
        rerender({});

        // Then nothing is sent again, so a server error does not retry on every render
        expect(mockGetRules).toHaveBeenCalledTimes(1);
    });

    it('stops waiting once its own fetch has failed', () => {
        // Given a screen that sent the fetch on mount, which is then in flight
        const {result, rerender} = renderHook(() => useRulesPrefetch(true));
        expect(result.current.areRulesLoading).toBe(true);
        mockIsLoadingRules = true;
        rerender({});
        expect(result.current.areRulesLoading).toBe(true);

        // When the fetch fails
        mockIsLoadingRules = false;
        mockHasBeenFetched = false;
        mockHasFetchFailed = true;
        rerender({});

        // Then readers stop waiting, rather than being held for the rest of the session
        expect(result.current.areRulesLoading).toBe(false);
    });

    it('keeps waiting between asking and the in-flight flag landing', () => {
        // Given a screen that has just sent the fetch, whose optimistic in-flight flag has not landed yet

        // When a reader checks whether the collection is on its way
        const {result} = renderHook(() => useRulesPrefetch(true));

        // Then it is told to wait, so the rules do not read as settled in the gap before the flag is written
        expect(result.current.areRulesLoading).toBe(true);
    });

    it('asks for the collection when a fetch it waited on fails', () => {
        // Given a screen opened while another screen's fetch was already in flight, so it sent nothing itself
        mockIsLoadingRules = true;
        const {rerender} = renderHook(() => useRulesPrefetch(true));
        expect(mockGetRules).not.toHaveBeenCalled();

        // When that fetch fails, leaving the collection unfetched
        mockIsLoadingRules = false;
        mockHasBeenFetched = false;
        mockHasFetchFailed = true;
        rerender({});

        // Then this screen asks, because it still needs the collection and has not asked for it yet
        expect(mockGetRules).toHaveBeenCalledTimes(1);
    });

    it('asks again on a screen opened after a failed fetch', () => {
        // Given a fetch that failed, leaving the collection unfetched
        renderHook(() => useRulesPrefetch(true));
        expect(mockGetRules).toHaveBeenCalledTimes(1);

        // When another screen that needs the collection is opened
        renderHook(() => useRulesPrefetch(true));

        // Then it asks again, so the rules are not missing for the rest of the session
        expect(mockGetRules).toHaveBeenCalledTimes(2);
    });

    it('asks again after reconnecting', () => {
        // Given a screen whose fetch has already been sent
        renderHook(() => useRulesPrefetch(true));
        expect(mockGetRules).toHaveBeenCalledTimes(1);

        // When the connection comes back, which is the only signal that a fetch left in flight is not still on its way
        mockOnReconnect?.();

        // Then the stale flags are cleared, so the collection is fetched again
        expect(resetRulesFetchState).toHaveBeenCalled();
    });

    it('does not ask once the collection has arrived', () => {
        // Given a session whose fetch already succeeded
        mockHasBeenFetched = true;

        // When a screen that needs the collection renders
        const {result} = renderHook(() => useRulesPrefetch(true));

        // Then nothing is sent and nothing is waited on, because the response SET the whole collection
        expect(mockGetRules).not.toHaveBeenCalled();
        expect(result.current.areRulesLoading).toBe(false);
    });

    it('stays inert for a policy with no rules to fetch', () => {
        // Given a caller that has no reason to read the collection

        // When the hook renders disabled
        const {result} = renderHook(() => useRulesPrefetch(false));

        // Then nothing is sent, so the shared guards cannot be bypassed by a caller
        expect(mockGetRules).not.toHaveBeenCalled();
        expect(result.current.areRulesLoading).toBe(false);
    });
});
