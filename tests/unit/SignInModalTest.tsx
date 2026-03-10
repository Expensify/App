import {act, render, waitFor} from '@testing-library/react-native';
import React from 'react';
import {useSession} from '@components/OnyxListItemProvider';
import {openApp} from '@libs/actions/App';
import Navigation from '@libs/Navigation/Navigation';
import {waitForIdle} from '@libs/Network/SequentialQueue';
import SignInModal from '@pages/signin/SignInModal';
import type {Session} from '@src/types/onyx';

type Deferred<T> = {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
};

function createDeferred<T>(): Deferred<T> {
    let resolve: Deferred<T>['resolve'];
    let reject: Deferred<T>['reject'];
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return {
        promise,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        resolve: resolve!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        reject: reject!,
    };
}

jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/OnyxListItemProvider', () => ({
    useSession: jest.fn(),
}));
jest.mock('@hooks/useAndroidBackButtonHandler', () => jest.fn());
jest.mock('@hooks/useStyleUtils', () =>
    jest.fn(() => ({
        getBackgroundColorStyle: jest.fn(() => ({})),
    })),
);
jest.mock('@hooks/useTheme', () => {
    const pageThemes = new Proxy<Record<string, {backgroundColor: string}>>(
        {},
        {
            get: () => ({backgroundColor: '#fff'}),
        },
    );

    return jest.fn(() => ({
        PAGE_THEMES: pageThemes,
    }));
});
jest.mock('@libs/actions/App', () => ({
    openApp: jest.fn(),
}));
jest.mock('@libs/Browser', () => ({
    isMobileSafari: jest.fn(() => false),
}));
jest.mock('@libs/Network/SequentialQueue', () => ({
    waitForIdle: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        dismissModal: jest.fn(),
        goBack: jest.fn(),
        isNavigationReady: jest.fn(() => Promise.resolve()),
    },
}));
jest.mock('@pages/signin/SignInPage', () => {
    function MockSignInPage() {
        return null;
    }

    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        default: MockSignInPage,
        SignInPage: MockSignInPage,
    };
});

const mockUseSession = jest.mocked(useSession);
const mockOpenApp = jest.mocked(openApp);
const mockWaitForIdle = jest.mocked(waitForIdle);
const mockNavigation = Navigation as jest.Mocked<typeof Navigation>;

describe('SignInModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockWaitForIdle.mockResolvedValue(undefined);
        mockNavigation.isNavigationReady.mockResolvedValue(undefined);
    });

    it('should dismiss the sign-in modal only after openApp resolves for non-anonymous users', async () => {
        const deferredOpenApp = createDeferred<void>();
        mockOpenApp.mockReturnValue(deferredOpenApp.promise);
        mockUseSession.mockReturnValue({
            authTokenType: 'google',
        } as Session);

        render(<SignInModal />);

        await waitFor(() => expect(mockWaitForIdle).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(mockOpenApp).toHaveBeenCalledWith(true));
        expect(mockNavigation.dismissModal).not.toHaveBeenCalled();

        await act(async () => {
            deferredOpenApp.resolve();
            await deferredOpenApp.promise;
        });

        await waitFor(() => expect(mockNavigation.dismissModal).toHaveBeenCalledTimes(1));
        const openAppCallOrder = mockOpenApp.mock.invocationCallOrder.at(0) ?? 0;
        const dismissCallOrder = mockNavigation.dismissModal.mock.invocationCallOrder.at(0) ?? 0;
        expect(openAppCallOrder).toBeGreaterThan(0);
        expect(dismissCallOrder).toBeGreaterThan(0);
        expect(openAppCallOrder).toBeLessThan(dismissCallOrder);
    });
});
