import {act, renderHook, waitFor} from '@testing-library/react-native';

import useSearchUserFilters from '@hooks/useSearchUserFilters';

import {openSearchUserFiltersPage} from '@libs/actions/Search';

import CONST from '@src/CONST';

type UserFiltersResponse = {hasMore: boolean; nextCursor: string; logins: string[]};

const mockOpenSearchUserFiltersPage = jest.mocked(openSearchUserFiltersPage);

let mockIsOffline = false;

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: mockIsOffline}),
}));

jest.mock('@libs/actions/Search', () => ({
    openSearchUserFiltersPage: jest.fn(() => Promise.resolve({hasMore: false, nextCursor: '', logins: []})),
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
        mockOpenSearchUserFiltersPage.mockReset().mockResolvedValue({hasMore: false, nextCursor: '', logins: []});
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

        // Then isSearching clears and pagination state reflects the response
        expect(result.current.isSearching).toBe(false);
        expect(result.current.hasMore).toBe(true);
    });

    it('reports logins via onScopedLoginsChange when policyIDs is set and the server returns logins', async () => {
        // Given a workspace-scoped lookup that returns logins
        const onScopedLoginsChange = jest.fn();
        mockOpenSearchUserFiltersPage.mockResolvedValueOnce({
            hasMore: false,
            nextCursor: '',
            logins: ['removed@example.com'],
        });

        // When the hook mounts and the lookup resolves
        const {result} = renderHook(() =>
            useSearchUserFilters({
                policyIDs: 'policy-1',
                searchTerm: 'removed',
                onScopedLoginsChange,
            }),
        );

        await waitFor(() => {
            expect(result.current.isSearching).toBe(false);
        });

        // Then the callback receives the workspace scope and returned logins
        expect(onScopedLoginsChange).toHaveBeenCalledWith('policy-1', ['removed@example.com']);
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

        // When the new search resolves, its state is applied
        await act(async () => {
            newSearchDeferred.resolve({hasMore: false, nextCursor: '', logins: ['bob@example.com']});
            await newSearchDeferred.promise;
        });
        expect(result.current.isSearching).toBe(false);
        expect(result.current.hasMore).toBe(false);
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

    it('clears isSearching when the first page request fails and clears isLoadingMore when loading the next page fails', async () => {
        // Given the initial lookup rejects
        mockOpenSearchUserFiltersPage.mockRejectedValueOnce(new Error('network failure'));

        // When the hook mounts
        const {result, rerender} = renderHook(
            ({searchTerm}: {searchTerm: string}) =>
                useSearchUserFilters({
                    policyIDs: 'policy-1',
                    searchTerm,
                }),
            {initialProps: {searchTerm: 'fail'}},
        );

        // Then isSearching clears and hasMore stays false once the rejection settles
        await waitFor(() => {
            expect(result.current.isSearching).toBe(false);
        });
        expect(result.current.hasMore).toBe(false);

        // Given a subsequent search succeeds with a next page cursor
        mockOpenSearchUserFiltersPage.mockResolvedValueOnce({
            hasMore: true,
            nextCursor: 'cursor-2',
            logins: ['alice@example.com'],
        });
        rerender({searchTerm: 'alice'});

        await waitFor(() => {
            expect(result.current.hasMore).toBe(true);
        });

        // When loading the next page fails
        const loadMoreDeferred = createDeferredResponse();
        mockOpenSearchUserFiltersPage.mockReturnValueOnce(loadMoreDeferred.promise);

        act(() => {
            result.current.loadMoreUsers();
        });
        expect(result.current.isLoadingMore).toBe(true);

        await act(async () => {
            loadMoreDeferred.reject(new Error('next page failure'));
            await loadMoreDeferred.promise.catch(() => {});
        });

        // Then isLoadingMore resets to false while preserving hasMore so the page can be retried
        expect(result.current.isLoadingMore).toBe(false);
        expect(result.current.hasMore).toBe(true);
    });
});
