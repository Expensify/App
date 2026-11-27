import {renderHook} from '@testing-library/react-native';

import useFetchAfterAppLoaded from '@hooks/useFetchAfterAppLoaded';
import useOnyx from '@hooks/useOnyx';

jest.mock('@hooks/useOnyx', () => jest.fn());

const mockUseOnyx = jest.mocked(useOnyx);

describe('useFetchAfterAppLoaded', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseOnyx.mockReturnValue([false, {status: 'loaded'}]);
    });

    it('uses the latest callback after loading without refetching for callback changes', () => {
        // Given a mounted page that has already fetched data.
        const originalFetch = jest.fn();
        const latestFetch = jest.fn();
        const {rerender} = renderHook(({fetchData}) => useFetchAfterAppLoaded(fetchData), {initialProps: {fetchData: originalFetch}});
        expect(originalFetch).toHaveBeenCalledTimes(1);

        // When unrelated page data changes the callback and a Copilot transition starts.
        rerender({fetchData: latestFetch});
        expect(latestFetch).not.toHaveBeenCalled();
        mockUseOnyx.mockReturnValue([true, {status: 'loaded'}]);
        rerender({fetchData: latestFetch});
        expect(latestFetch).not.toHaveBeenCalled();
        mockUseOnyx.mockReturnValue([false, {status: 'loaded'}]);
        rerender({fetchData: latestFetch});

        // Then loading completion fetches once using the current page data, not the old callback.
        expect(latestFetch).toHaveBeenCalledTimes(1);
        expect(originalFetch).toHaveBeenCalledTimes(1);
    });

    it('fetches again when the resource key changes even if app loading does not change', () => {
        // Given a loaded profile whose account ID identifies the data to fetch.
        const fetchData = jest.fn<void, [number]>();
        const {rerender} = renderHook(({accountID}) => useFetchAfterAppLoaded(() => fetchData(accountID), accountID), {initialProps: {accountID: 1}});
        expect(fetchData).toHaveBeenCalledWith(1);

        // When the same mounted profile switches to another account.
        rerender({accountID: 2});
        rerender({accountID: 2});

        // Then the new account is fetched exactly once despite subsequent rerenders.
        expect(fetchData).toHaveBeenCalledTimes(2);
        expect(fetchData).toHaveBeenLastCalledWith(2);
    });

    it('defers resource key changes until app loading finishes', () => {
        // Given a profile mounted while a Copilot transition is still loading.
        mockUseOnyx.mockReturnValue([true, {status: 'loaded'}]);
        const fetchData = jest.fn<void, [number]>();
        const {rerender} = renderHook(({accountID}) => useFetchAfterAppLoaded(() => fetchData(accountID), accountID), {initialProps: {accountID: 1}});

        // When the profile changes account before the transition finishes.
        rerender({accountID: 2});
        expect(fetchData).not.toHaveBeenCalled();
        mockUseOnyx.mockReturnValue([false, {status: 'loaded'}]);
        rerender({accountID: 2});

        // Then only the latest account is fetched after the active token is ready.
        expect(fetchData).toHaveBeenCalledTimes(1);
        expect(fetchData).toHaveBeenCalledWith(2);
    });
});
