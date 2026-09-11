import {act, renderHook, waitFor} from '@testing-library/react-native';

import useAccessToken from '@components/MapView/useAccessToken';

import {setAccessToken} from '@rnmapbox/maps';

/**
 * `useAccessToken` is the sole guard against the HybridApp Android crash `MapboxConfigurationException`
 * (Sentry APP-HTR). Its two responsibilities:
 *   1. Never call `setAccessToken('')` — an empty string clobbers the per-process native token global,
 *      and a native `MapView` (re)constructed while that global is blank throws at `MapView.<init>`.
 *   2. Gate the map on the token being currently present, so consumers fall back to `PendingMapView`
 *      when the token is cleared at runtime instead of leaving a native map mounted over a blank global.
 *
 * `jest/setup.ts` has no global `@rnmapbox/maps` mock (it sidesteps native by mocking `@components/ConfirmedRoute`),
 * so we mock the module locally here — no native needed.
 */
jest.mock('@rnmapbox/maps', () => ({
    setAccessToken: jest.fn((token: string) => Promise.resolve(token)),
}));

const mockedSetAccessToken = jest.mocked(setAccessToken);

describe('useAccessToken', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('returns false until setAccessToken resolves, then true', async () => {
        // Hold the promise open so we can observe the pre-resolution state deterministically.
        let resolveSetToken: (token: string) => void = () => {};
        mockedSetAccessToken.mockImplementationOnce(
            () =>
                new Promise<string | null>((resolve) => {
                    resolveSetToken = resolve;
                }),
        );

        const {result} = renderHook(() => useAccessToken({accessToken: 'valid-token'}));

        // The effect kicked off setAccessToken, but the promise is still pending: the map is not ready.
        expect(mockedSetAccessToken).toHaveBeenCalledWith('valid-token');
        expect(result.current).toBe(false);

        await act(async () => {
            resolveSetToken('valid-token');
        });

        // Once the native token is set the gate opens and the map may mount.
        expect(result.current).toBe(true);
    });

    it('never pushes an empty token to native and re-closes the gate when the token is cleared', async () => {
        const {result, rerender} = renderHook(({accessToken}) => useAccessToken({accessToken}), {
            initialProps: {accessToken: 'valid-token'},
        });

        await waitFor(() => expect(result.current).toBe(true));

        // Simulate the production trigger: the token is cleared at runtime (expiry/refresh, foreground, reconnect).
        rerender({accessToken: ''});

        // The gate re-closes so consumers fall back to PendingMapView instead of a map over a blank global.
        await waitFor(() => expect(result.current).toBe(false));

        // The actual regression guard: clearing the token must NEVER call setAccessToken(''), which would
        // clobber the native token global and crash a freshly constructed native MapView (APP-HTR).
        expect(mockedSetAccessToken).not.toHaveBeenCalledWith('');
    });
});
