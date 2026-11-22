import {act, renderHook} from '@testing-library/react-native';

import InitialURLContextProvider, {useInitialURLState} from '@components/InitialURLContextProvider';

import CONST from '@src/CONST';

import {Linking} from 'react-native';

const TRANSITION_URL = 'https://dev.new.expensify.com:8082/transition?shortLivedAuthToken=token&email=user%40example.com';

describe('InitialURLContextProvider', () => {
    beforeEach(() => {
        jest.useFakeTimers({doNotFake: ['setImmediate', 'nextTick']});
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('keeps an initial URL that resolves after the timeout', async () => {
        // Given a launch URL that the platform delivers later than the timeout, as on a slow cold start
        let resolveInitialURL: (url: string) => void = () => {};
        jest.spyOn(Linking, 'getInitialURL').mockReturnValue(
            new Promise((resolve) => {
                resolveInitialURL = resolve;
            }),
        );
        const {result} = renderHook(() => useInitialURLState(), {wrapper: InitialURLContextProvider});

        // When the timeout passes before the URL arrives
        await act(async () => {
            await jest.advanceTimersByTimeAsync(CONST.TIMING.GET_INITIAL_URL_TIMEOUT);
        });

        // Then the provider stops loading so screens waiting on it are not stuck
        expect(result.current.isLoadingInitialURL).toBe(false);
        expect(result.current.initialURL).toBeNull();

        // When the URL arrives
        await act(async () => {
            resolveInitialURL(TRANSITION_URL);
        });

        // Then the provider still saves it, so the transition page can process the link
        expect(result.current.initialURL).toBe(TRANSITION_URL);
    });
});
