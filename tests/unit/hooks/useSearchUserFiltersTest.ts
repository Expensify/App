import {act, renderHook, waitFor} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';
import useSearchUserFilters from '@hooks/useSearchUserFilters';

import {openSearchUserFiltersPage, setSearchUserFiltersState} from '@libs/actions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchUserFiltersState} from '@src/types/onyx';

import {useSyncExternalStore} from 'react';

type UserFiltersResponse = {hasMore: boolean; nextCursor: string; logins: string[]};

const mockOpenSearchUserFiltersPage = jest.mocked(openSearchUserFiltersPage);
const mockSetSearchUserFiltersState = jest.mocked(setSearchUserFiltersState);
const mockUseOnyx = jest.mocked(useOnyx);

let mockIsOffline = false;
const onyxStore: Record<string, SearchUserFiltersState | undefined> = {};
const onyxListeners = new Set<() => void>();

function notifyOnyxListeners() {
    for (const listener of onyxListeners) {
        listener();
    }
}

function getStateKey(policyIDs: string) {
    return `${ONYXKEYS.COLLECTION.RAM_ONLY_SEARCH_USER_FILTERS_STATE}${policyIDs || 'all'}`;
}

function useTestOnyx(key: string) {
    const value = useSyncExternalStore(
        (listener) => {
            onyxListeners.add(listener);
            return () => onyxListeners.delete(listener);
        },
        () => onyxStore[key],
    );
    return [value, {status: 'loaded'}] as ReturnType<typeof useOnyx>;
}

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: mockIsOffline}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/actions/Search', () => ({
    ALL_POLICY_IDS_KEY: 'all',
    openSearchUserFiltersPage: jest.fn(() => Promise.resolve({hasMore: false, nextCursor: '', logins: []})),
    setSearchUserFiltersState: jest.fn(),
}));

function createDeferredResponse() {
    let resolve!: (value: UserFiltersResponse) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<UserFiltersResponse>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {promise, resolve, reject};
}

describe('useSearchUserFilters', () => {
    beforeEach(() => {
        mockIsOffline = false;
        for (const key of Object.keys(onyxStore)) {
            delete onyxStore[key];
        }
        mockUseOnyx.mockImplementation((key) => useTestOnyx(key));
        mockOpenSearchUserFiltersPage.mockReset().mockResolvedValue({hasMore: false, nextCursor: '', logins: []});
        mockSetSearchUserFiltersState.mockReset().mockImplementation((policyIDs: string, state: SearchUserFiltersState) => {
            onyxStore[getStateKey(policyIDs)] = state;
            notifyOnyxListeners();
        });
    });

    it('starts searching only once ready is true and clears isSearching when the response arrives', async () => {
        // Given a deferred server lookup and a selector that mounts while not ready
        const deferred = createDeferredResponse();
        mockOpenSearchUserFiltersPage.mockReturnValueOnce(deferred.promise);

        const {result, rerender} = renderHook(
            ({ready}: {ready: boolean}) =>
                useSearchUserFilters({
                    policyIDs: 'policy-1',
                    searchTerm: '',
                    ready,
                }),
            {initialProps: {ready: false}},
        );

        // Then no request is sent and isSearching is false while ready is false
        expect(result.current.isSearching).toBe(false);
        expect(mockOpenSearchUserFiltersPage).not.toHaveBeenCalled();

        // When ready becomes true
        rerender({ready: true});

        // Then isSearching becomes true immediately and the first page is requested
        expect(result.current.isSearching).toBe(true);
        await waitFor(() => {
            expect(mockOpenSearchUserFiltersPage).toHaveBeenCalledWith({searchQuery: '', cursor: '', limit: CONST.SEARCH.USER_FILTER_PAGE_SIZE, policyIDs: 'policy-1'}, true);
        });

        // When the server responds
        await act(async () => {
            deferred.resolve({hasMore: true, nextCursor: 'cursor-1', logins: ['alice@example.com']});
            await deferred.promise;
        });

        // Then isSearching clears and pagination state is cached in RAM-only Onyx
        expect(result.current.isSearching).toBe(false);
        expect(result.current.hasMore).toBe(true);
        expect(onyxStore[getStateKey('policy-1')]).toEqual({
            hasLoadedBase: true,
            hasMore: true,
            nextCursor: 'cursor-1',
            scopedLogins: ['alice@example.com'],
        });
    });

    it('does not show isSearching on remount when base state is cached and skips Onyx writes when unchanged', async () => {
        // Given an initial lookup that already populated the RAM-only Onyx cache
        mockOpenSearchUserFiltersPage.mockResolvedValueOnce({
            hasMore: false,
            nextCursor: '',
            logins: ['removed@example.com'],
        });

        const firstMount = renderHook(() =>
            useSearchUserFilters({
                policyIDs: 'policy-1',
                searchTerm: '',
            }),
        );

        await waitFor(() => {
            expect(firstMount.result.current.isSearching).toBe(false);
        });
        firstMount.unmount();

        mockSetSearchUserFiltersState.mockClear();
        const refreshDeferred = createDeferredResponse();
        mockOpenSearchUserFiltersPage.mockReturnValueOnce(refreshDeferred.promise);

        // When the hook remounts for the same workspace scope
        const secondMount = renderHook(() =>
            useSearchUserFilters({
                policyIDs: 'policy-1',
                searchTerm: '',
            }),
        );

        // Then isSearching stays false immediately while a silent background refresh runs
        expect(secondMount.result.current.isSearching).toBe(false);
        await waitFor(() => {
            expect(mockOpenSearchUserFiltersPage).toHaveBeenCalledTimes(2);
        });

        // When the silent refresh returns unchanged data
        await act(async () => {
            refreshDeferred.resolve({hasMore: false, nextCursor: '', logins: ['removed@example.com']});
            await refreshDeferred.promise;
        });

        // Then no redundant Onyx write is issued
        expect(mockSetSearchUserFiltersState).not.toHaveBeenCalled();
    });

    it('prunes stale scoped logins when a complete page-1 silent refresh returns fewer logins', async () => {
        // Given a cached complete base state with an outdated scoped login
        onyxStore[getStateKey('policy-1')] = {
            hasLoadedBase: true,
            hasMore: false,
            nextCursor: '',
            scopedLogins: ['old@example.com'],
        };
        mockOpenSearchUserFiltersPage.mockResolvedValueOnce({
            hasMore: false,
            nextCursor: '',
            logins: ['new@example.com'],
        });

        // When the hook remounts and the silent refresh resolves with complete page-1 logins
        const {result} = renderHook(() =>
            useSearchUserFilters({
                policyIDs: 'policy-1',
                searchTerm: '',
            }),
        );

        expect(result.current.isSearching).toBe(false);
        await waitFor(() => {
            expect(onyxStore[getStateKey('policy-1')]).toEqual({
                hasLoadedBase: true,
                hasMore: false,
                nextCursor: '',
                scopedLogins: ['new@example.com'],
            });
        });
    });

    it('merges scoped logins for non-empty searches without marking base as loaded', async () => {
        // Given a workspace-scoped non-empty search that returns a removed member
        mockOpenSearchUserFiltersPage.mockResolvedValueOnce({
            hasMore: false,
            nextCursor: '',
            logins: ['removed@example.com'],
        });

        // When the hook mounts with a non-empty search term
        const {result} = renderHook(() =>
            useSearchUserFilters({
                policyIDs: 'policy-1',
                searchTerm: 'removed',
            }),
        );

        await waitFor(() => {
            expect(result.current.isSearching).toBe(false);
        });

        // Then scopedLogins is stored in Onyx without setting hasLoadedBase to true
        expect(onyxStore[getStateKey('policy-1')]).toEqual({
            scopedLogins: ['removed@example.com'],
        });
    });

    it('loads the next page with the stored cursor and ignores stale responses after the search term changes', async () => {
        // Given an initial page that has more results
        mockOpenSearchUserFiltersPage.mockResolvedValueOnce({
            hasMore: true,
            nextCursor: 'cursor-1',
            logins: ['first@example.com'],
        });

        const {result, rerender} = renderHook(
            ({searchTerm}: {searchTerm: string}) =>
                useSearchUserFilters({
                    policyIDs: 'policy-1',
                    searchTerm,
                }),
            {initialProps: {searchTerm: ''}},
        );

        await waitFor(() => {
            expect(result.current.hasMore).toBe(true);
        });

        // When loadMoreUsers is called and the search term changes before that page resolves
        const loadMoreDeferred = createDeferredResponse();
        const newSearchDeferred = createDeferredResponse();
        mockOpenSearchUserFiltersPage.mockReturnValueOnce(loadMoreDeferred.promise).mockReturnValueOnce(newSearchDeferred.promise);

        act(() => {
            result.current.loadMoreUsers();
        });
        expect(result.current.isLoadingMore).toBe(true);
        expect(mockOpenSearchUserFiltersPage).toHaveBeenLastCalledWith({searchQuery: '', cursor: 'cursor-1', limit: CONST.SEARCH.USER_FILTER_PAGE_SIZE, policyIDs: 'policy-1'}, false);

        rerender({searchTerm: 'bob'});

        // Then pagination for the new search resets synchronously
        expect(result.current.isSearching).toBe(true);
        expect(result.current.hasMore).toBe(false);
        expect(result.current.isLoadingMore).toBe(false);

        // When the stale load-more response resolves first, it is ignored
        await act(async () => {
            loadMoreDeferred.resolve({hasMore: true, nextCursor: 'stale-cursor', logins: ['stale@example.com']});
            await loadMoreDeferred.promise;
        });
        expect(result.current.isSearching).toBe(true);
        expect(result.current.hasMore).toBe(false);

        // When the new search resolves, its state is applied and clearing back to empty does not spin
        await act(async () => {
            newSearchDeferred.resolve({hasMore: false, nextCursor: '', logins: ['bob@example.com']});
            await newSearchDeferred.promise;
        });
        expect(result.current.isSearching).toBe(false);
        expect(result.current.hasMore).toBe(false);

        rerender({searchTerm: ''});
        expect(result.current.isSearching).toBe(false);
        expect(result.current.hasMore).toBe(true);
    });

    it('prevents an in-flight silent refresh from overwriting loadMoreUsers pagination', async () => {
        // Given a cached paginated base state and a silent refresh in flight on remount
        onyxStore[getStateKey('policy-1')] = {
            hasLoadedBase: true,
            hasMore: true,
            nextCursor: '50',
            scopedLogins: ['first@example.com'],
        };
        const refreshDeferred = createDeferredResponse();
        const loadMoreDeferred = createDeferredResponse();
        mockOpenSearchUserFiltersPage.mockReturnValueOnce(refreshDeferred.promise).mockReturnValueOnce(loadMoreDeferred.promise);

        const {result} = renderHook(() =>
            useSearchUserFilters({
                policyIDs: 'policy-1',
                searchTerm: '',
            }),
        );

        await waitFor(() => {
            expect(mockOpenSearchUserFiltersPage).toHaveBeenCalledTimes(1);
        });

        // When loadMoreUsers runs before the silent refresh resolves
        act(() => {
            result.current.loadMoreUsers();
        });
        expect(result.current.isLoadingMore).toBe(true);

        // When loadMoreUsers resolves first and the slower silent refresh resolves afterwards
        await act(async () => {
            loadMoreDeferred.resolve({hasMore: true, nextCursor: '100', logins: ['second@example.com']});
            await loadMoreDeferred.promise;
        });
        await act(async () => {
            refreshDeferred.resolve({hasMore: true, nextCursor: '50', logins: ['first@example.com']});
            await refreshDeferred.promise;
        });

        // Then the newer loadMoreUsers cursor is preserved
        expect(onyxStore[getStateKey('policy-1')]).toEqual({
            hasLoadedBase: true,
            hasMore: true,
            nextCursor: '100',
            scopedLogins: ['first@example.com', 'second@example.com'],
        });
        expect(result.current.isLoadingMore).toBe(false);
    });

    it('skips server requests while offline', () => {
        // Given the device is offline
        mockIsOffline = true;

        // When the hook mounts
        const {result} = renderHook(() =>
            useSearchUserFilters({
                policyIDs: 'policy-1',
                searchTerm: 'alice',
            }),
        );

        // Then no server lookup is triggered and isSearching is false
        expect(result.current.isSearching).toBe(false);
        expect(mockOpenSearchUserFiltersPage).not.toHaveBeenCalled();
    });

    it('clears isSearching without caching on first-page failure, retries on remount, and clears isLoadingMore on next-page failure', async () => {
        // Given the initial base lookup rejects
        mockOpenSearchUserFiltersPage.mockRejectedValueOnce(new Error('network failure'));

        // When the hook mounts
        const firstMount = renderHook(() =>
            useSearchUserFilters({
                policyIDs: 'policy-1',
                searchTerm: '',
            }),
        );

        // Then isSearching clears without marking Onyx as loaded
        await waitFor(() => {
            expect(firstMount.result.current.isSearching).toBe(false);
        });
        expect(onyxStore[getStateKey('policy-1')]).toBeUndefined();
        firstMount.unmount();

        // When the hook remounts and succeeds with a next page cursor
        mockOpenSearchUserFiltersPage.mockResolvedValueOnce({
            hasMore: true,
            nextCursor: 'cursor-2',
            logins: ['alice@example.com'],
        });
        const secondMount = renderHook(() =>
            useSearchUserFilters({
                policyIDs: 'policy-1',
                searchTerm: '',
            }),
        );

        await waitFor(() => {
            expect(secondMount.result.current.hasMore).toBe(true);
        });

        // When loading the next page fails
        const loadMoreDeferred = createDeferredResponse();
        mockOpenSearchUserFiltersPage.mockReturnValueOnce(loadMoreDeferred.promise);

        act(() => {
            secondMount.result.current.loadMoreUsers();
        });
        expect(secondMount.result.current.isLoadingMore).toBe(true);

        await act(async () => {
            loadMoreDeferred.reject(new Error('next page failure'));
            await loadMoreDeferred.promise.catch(() => {});
        });

        // Then isLoadingMore resets to false while preserving hasMore so the page can be retried
        expect(secondMount.result.current.isLoadingMore).toBe(false);
        expect(secondMount.result.current.hasMore).toBe(true);
    });
});
